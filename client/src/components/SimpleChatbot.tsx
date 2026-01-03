import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Bot, Send, Loader2, X, Sparkles, Copy, Check, Trash2 } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_MODEL = 'gemini-2.0-flash-exp';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

interface SimpleChatbotProps {
    isOpen: boolean;
    onClose: () => void;
    onCodeGenerated: (code: string) => void;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
    id: string;
    timestamp: Date;
}

export default function SimpleChatbot({ isOpen, onClose, onCodeGenerated }: SimpleChatbotProps) {
    const [messages, setMessages] = useState<Message[]>(() => {
        // Load messages from localStorage on initial render
        const saved = localStorage.getItem('move-chatbot-history');
        return saved ? JSON.parse(saved, (key, value) => {
            if (key === 'timestamp') return new Date(value);
            return value;
        }) : [];
    });
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Save messages to localStorage whenever they change
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('move-chatbot-history', JSON.stringify(messages));
        }
    }, [messages]);

    // Auto-scroll to bottom when new messages are added
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    // Auto-focus textarea when chatbot opens
    useEffect(() => {
        if (isOpen && textareaRef.current) {
            setTimeout(() => textareaRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const systemPrompt = `You are an expert Move smart contract developer. Your task is to generate clean, production-ready Move code based on user requirements.

IMPORTANT RULES:
1. Generate ONLY Move code - no explanations, no markdown code blocks, no backticks
2. Code must be syntactically correct and follow Move best practices
3. Include proper module structure, function signatures, and error handling
4. Use appropriate Move types and patterns (resources, capabilities, events, etc.)
5. Always start with "module" declaration including the correct address
6. Include comprehensive error codes and events where applicable
7. Follow Aptos Move conventions if unspecified

EXAMPLE FORMAT:
module 0x1::my_token {
    use std::signer;
    use std::string::String;
    
    struct Token has key {
        id: u64,
        name: String,
        balance: u64,
    }
    
    public entry fun initialize(account: &signer) {
        // Implementation
    }
}

Generate Move code based on the user's request and conversation history below.`;

    const generateCode = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            role: 'user',
            content: input.trim(),
            id: Date.now().toString(),
            timestamp: new Date()
        };
        
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);
        setStatusMessage("Generating code...");

        try {
            // Prepare conversation history for Gemini
            const conversationHistory = messages
                .slice(-10) // Keep last 10 messages for context
                .map(msg => `${msg.role}: ${msg.content}`)
                .join('\n\n');

            const userPrompt = `SYSTEM PROMPT: ${systemPrompt}

${conversationHistory ? `CONVERSATION HISTORY:\n${conversationHistory}\n\n` : ''}USER REQUEST: ${input.trim()}

Generate Move code based on the above request. Remember: ONLY Move code, no explanations.`;

            const response = await fetch(GEMINI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            role: 'user',
                            parts: [{ text: userPrompt }]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.2,
                        maxOutputTokens: 4000,
                        topP: 0.8,
                        topK: 40,
                    },
                    safetySettings: [
                        {
                            category: "HARM_CATEGORY_HARASSMENT",
                            threshold: "BLOCK_NONE"
                        },
                        {
                            category: "HARM_CATEGORY_HATE_SPEECH", 
                            threshold: "BLOCK_NONE"
                        },
                        {
                            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                            threshold: "BLOCK_NONE"
                        },
                        {
                            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                            threshold: "BLOCK_NONE"
                        }
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API request failed: ${response.status} - ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            let generatedCode = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

            // Clean up the generated code
            generatedCode = generatedCode.trim();
            
            // Remove markdown code blocks and any explanations
            generatedCode = generatedCode.replace(/```move\s*\n?/gi, '');
            generatedCode = generatedCode.replace(/```\s*\n?/gi, '');
            generatedCode = generatedCode.replace(/^Here(?:'s| is) the (?:Move )?code:?\s*\n?/i, '');
            generatedCode = generatedCode.replace(/module\s+[a-zA-Z0-9_]+::/g, (match) => {
                return match.replace(/\s+/g, ' ');
            });

            const assistantMessage: Message = {
                role: 'assistant',
                content: generatedCode,
                id: (Date.now() + 1).toString(),
                timestamp: new Date()
            };
            
            setMessages(prev => [...prev, assistantMessage]);
            setStatusMessage("Code generated successfully!");

            // Send code to parent
            onCodeGenerated(generatedCode);

        } catch (error) {
            console.error('Error generating code:', error);
            
            const errorMessage: Message = {
                role: 'assistant',
                content: `Error: ${error instanceof Error ? error.message : 'Failed to generate code. Please try again.'}\n\nMake sure your API key is valid and you have an internet connection.`,
                id: (Date.now() + 1).toString(),
                timestamp: new Date()
            };
            
            setMessages(prev => [...prev, errorMessage]);
            setStatusMessage("Failed to generate code. Check console for details.");
        } finally {
            setIsLoading(false);
            // Clear status message after 3 seconds
            setTimeout(() => setStatusMessage(null), 3000);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            generateCode();
        }
    };

    const clearHistory = () => {
        setMessages([]);
        localStorage.removeItem('move-chatbot-history');
        setStatusMessage("Chat history cleared");
        setTimeout(() => setStatusMessage(null), 3000);
    };

    const copyToClipboard = async (content: string, messageId: string) => {
        try {
            await navigator.clipboard.writeText(content);
            setCopiedMessageId(messageId);
            setStatusMessage("Code copied to clipboard!");
            
            setTimeout(() => {
                setCopiedMessageId(null);
                setStatusMessage(null);
            }, 2000);
        } catch (err) {
            setStatusMessage("Failed to copy code");
            setTimeout(() => setStatusMessage(null), 3000);
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const examples = [
        "Create a fungible token with mint and burn functions",
        "Make a simple voting contract with proposal and vote functions",
        "Create an NFT collection with minting and transfer",
        "Make a staking contract with rewards distribution",
        "Create a multi-signature wallet contract",
        "Make a decentralized exchange pool for two tokens"
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-5xl h-[85vh] flex flex-col bg-gradient-to-b from-slate-900 to-slate-950 border-cyan-500/20 shadow-2xl shadow-cyan-500/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-slate-800">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 via-blue-500 to-yellow-600 rounded-xl flex items-center justify-center animate-pulse-slow">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-bold font-mono">
                                Move AI Assistant
                            </CardTitle>
                            <p className="text-xs text-slate-400 font-mono">
                                Powered by Gemini 2.0 Flash Experimental • Context-aware
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {statusMessage && (
                            <div className="px-3 py-1 bg-slate-800/80 border border-slate-700 rounded-lg">
                                <p className="text-xs text-cyan-400 font-mono">{statusMessage}</p>
                            </div>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearHistory}
                            className="text-xs text-slate-400 hover:text-cyan-400 hover:bg-slate-800"
                            disabled={messages.length === 0}
                            title="Clear chat history"
                        >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Clear
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full"
                            title="Close chatbot"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col p-0 overflow-hidden overflow-y-auto">
                    {/* Messages Area */}
                    <ScrollArea className="flex-1 p-6">
                        <div className="space-y-4">
                            {messages.length === 0 && (
                                <div className="text-center py-12">
                                    <Sparkles className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-pulse" />
                                    <h3 className="text-xl font-bold text-slate-300 mb-3 font-mono">
                                        Welcome to Move AI Assistant
                                    </h3>
                                    <p className="text-sm text-slate-400 font-mono mb-6 max-w-md mx-auto">
                                        Describe the Move smart contract you want to create. I'll generate production-ready code for you.
                                    </p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                                        {examples.map((example, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setInput(example)}
                                                className="text-left p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/30 transition-all group"
                                            >
                                                <p className="text-sm text-slate-300 font-mono group-hover:text-cyan-300">
                                                    {example}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-xl p-4 ${message.role === 'user'
                                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                                                : 'bg-slate-800/80 text-slate-200 border border-slate-700 backdrop-blur-sm'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-medium text-slate-300">
                                                {message.role === 'user' ? 'You' : 'Assistant'}
                                            </span>
                                            <span className="text-xs text-slate-500">
                                                {formatTime(message.timestamp)}
                                            </span>
                                        </div>
                                        
                                        {message.role === 'assistant' ? (
                                            <div className="relative group">
                                                <pre className="text-xs font-mono whitespace-pre-wrap overflow-x-auto bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                                                    {message.content}
                                                </pre>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => copyToClipboard(message.content, message.id)}
                                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800/90 hover:bg-slate-700"
                                                    title="Copy code to clipboard"
                                                >
                                                    {copiedMessageId === message.id ? (
                                                        <Check className="w-3.5 h-3.5 text-green-400" />
                                                    ) : (
                                                        <Copy className="w-3.5 h-3.5" />
                                                    )}
                                                </Button>
                                            </div>
                                        ) : (
                                            <p className="text-sm">{message.content}</p>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 max-w-[85%] backdrop-blur-sm">
                                        <div className="flex items-center space-x-3">
                                            <div className="relative">
                                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping absolute"></div>
                                                <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="h-1.5 w-24 bg-slate-700 rounded-full animate-pulse"></div>
                                                <div className="h-1.5 w-32 bg-slate-700 rounded-full animate-pulse delay-75"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div ref={messagesEndRef} />
                        </div>
                    </ScrollArea>

                </CardContent>
                    {/* Input Area */}
                    <div className="border-t border-slate-800 p-4 bg-gradient-to-t from-slate-950 to-transparent">
                        <div className="flex space-x-3">
                            <div className="flex-1 relative">
                                <Textarea
                                    ref={textareaRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Describe your Move contract (e.g., 'Create a fungible token with mint, burn, and transfer functions')"
                                    className="min-h-[90px] bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500 font-mono text-sm resize-none backdrop-blur-sm"
                                    disabled={isLoading}
                                />
                                <div className="absolute bottom-2 right-2">
                                    <span className="text-xs text-slate-500 font-mono">
                                        {input.length}/500
                                    </span>
                                </div>
                            </div>
                            <Button
                                onClick={generateCode}
                                disabled={isLoading || !input.trim()}
                                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white self-end px-6 rounded-lg font-medium shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                size="lg"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4 mr-2" />
                                        Generate Code
                                    </>
                                )}
                            </Button>
                        </div>
                        <div className="flex justify-between items-center mt-3">
                            <p className="text-xs text-slate-500 font-mono">
                                Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-xs">Enter</kbd> to send • 
                                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-xs mx-1">Shift+Enter</kbd> for new line
                            </p>
                            <p className="text-xs text-slate-500 font-mono">
                                {messages.length} message{messages.length !== 1 ? 's' : ''} in history
                            </p>
                        </div>
                    </div>
            </Card>
        </div>
    );
}