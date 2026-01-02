import React, { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { Upload, Settings, Zap, ExternalLink, Copy, Code } from "lucide-react";
import SimpleChatbot from "./SimpleChatbot";

interface DeploymentPanelProps {
  generatedCode?: string;
  onCodeChange?: (code: string) => void;
  isChatbotOpen?: boolean;
  onChatbotClose?: () => void;
  projectId?: string;
  blocks?: any[]; 
}

export default function ManualDeploymentPanel({ 
  generatedCode, 
  onCodeChange, 
  isChatbotOpen = false,
  onChatbotClose,
  projectId 
}: DeploymentPanelProps) {
    // State variables adapted from the App component and existing DeploymentPanel
    const [moveCode, setMoveCode] = useState(generatedCode || '// Write your Move smart contract here\n// Or use the AI Assistant to generate it');
    const [response, setResponse] = useState('Ready to deploy. Click Initialize to start.');
    const [loading, setLoading] = useState(false);

    // Sync with parent code changes
    useEffect(() => {
      if (generatedCode !== undefined) {
        setMoveCode(generatedCode);
      }
    }, [generatedCode]);

    // Notify parent of local code changes
    const handleCodeChange = (newCode: string) => {
      setMoveCode(newCode);
      if (onCodeChange) {
        onCodeChange(newCode);
      }
    };


    const [integrationFunctions, setIntegrationFunctions] = useState<string[]>([]);
    const [showIntegrationFunctions, setShowIntegrationFunctions] = useState(false);
    
        /**
     * Handles getting frontend integration functions.
     */
    const getFrontendIntegrationFunctions = async () => {
        setLoading(true);
        setResponse('⏳ Getting Frontend Integration Functions...');
        setInfoContainerClass('info-container');

        try {
            const res = await fetch('http://localhost:3000/integration-functions');
            const data = await res.json();
            
            if (data.success) {
                setIntegrationFunctions(data.integrationFunctions);
                setShowIntegrationFunctions(true);
                setResponse(`✅ Frontend Integration Functions Generated\n\nGenerated ${data.integrationFunctions.length} integration blocks`);
                setInfoContainerClass('info-container success');
            } else {
                setResponse(`❌ Failed to Generate Integration Functions\n\n${data.error || ''}`);
                setInfoContainerClass('info-container error');
                setShowIntegrationFunctions(false);
            }
        } catch (error: any) {
            setResponse(`❌ Request Error:\n${error.message}`);
            console.error(error);
            setInfoContainerClass('info-container error');
            setShowIntegrationFunctions(false);
        } finally {
            setLoading(false);
        }
    };

    // Existing DeploymentPanel specific states
    const [moduleName, setModuleName] = useState('None');
    const [packageName, setPackageName] = useState('None');
    const [contractAddress, setContractAddress] = useState('None');

    const [initStatus, setInitStatus] = useState<'pending' | 'processing' | 'complete'>('pending');
    const [compileStatus, setCompileStatus] = useState<'pending' | 'processing' | 'complete'>('pending');
    const [deployStatus, setDeployStatus] = useState<'pending' | 'processing' | 'complete'>('pending');

    const [compileButtonDisabled, setCompileButtonDisabled] = useState(true);
    const [deployButtonDisabled, setDeployButtonDisabled] = useState(true);

    const [infoContainerClass, setInfoContainerClass] = useState('info-container'); // For visual feedback on response

    const [networkType, setNetworkType] = useState('testnet');
    const [privateKeyInput, setPrivateKeyInput] = useState(''); 
    const [faucetUrl, setFaucetUrl] = useState('');
    const [projectData, setProjectData] = useState<any>(null);

    // Load project deployment data on mount
    useEffect(() => {
        if (projectId) {
            loadProjectData(projectId);
        }
    }, [projectId]);

    const loadProjectData = async (id: string) => {
        try {
            const response = await fetch(`http://localhost:3000/projects/${id}`);
            const data = await response.json();
            
            if (data.success && data.project) {
                setProjectData(data.project);
                
                // Restore deployment state from saved data
                if (data.project.initData) {
                    setInitStatus('complete');
                    setCompileButtonDisabled(false);
                    setContractAddress(data.project.initData.address || 'None');
                    if (data.project.initData.faucetUrl) {
                        setFaucetUrl(data.project.initData.faucetUrl);
                    }
                }
                
                if (data.project.compileData && data.project.compileData.success) {
                    setCompileStatus('complete');
                    setDeployButtonDisabled(false);
                }
                
                if (data.project.deployData && data.project.deployData.success) {
                    setDeployStatus('complete');
                    if (data.project.deployData.address) {
                        setContractAddress(data.project.deployData.address);
                    }
                }
                
                // Set network type if available
                if (data.project.networkType) {
                    setNetworkType(data.project.networkType);
                }
            }
        } catch (error) {
            console.error('Error loading project data:', error);
        }
    };

    /**
     * Updates the status icon for a specific operation.
     * @param statusType 'init', 'compile', or 'deploy'
     * @param status 'pending', 'processing', or 'complete'
     */
    const updateStatusIcon = (statusType: 'init' | 'compile' | 'deploy', status: 'pending' | 'processing' | 'complete') => {
        if (statusType === 'init') setInitStatus(status);
        if (statusType === 'compile') setCompileStatus(status);
        if (statusType === 'deploy') setDeployStatus(status);
    };

    /**
     * Updates module, package, and contract address information.
     */
    const updateInfo = (moduleName: string, packageName: string, address: string) => {
        setModuleName(moduleName || 'Unknown');
        setPackageName(packageName || 'Unknown');
        setContractAddress(address || 'Unknown');
    };

    /**
     * Handles the initialization of the Movement project.
     * Corresponds to handleInit and submitInit from the App component.
     */
    const initializeProject = async () => {
        if (!moveCode.trim()) {
            setResponse('Error: Please enter Move code before initializing.');
            setInfoContainerClass('info-container error');
            return;
        }

        setLoading(true);
        updateStatusIcon('init', 'processing');
        setResponse('⏳ Initializing...');
        setInfoContainerClass('info-container'); // Reset class for new operation

        try {
            const res = await fetch('http://localhost:3000/init', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    moveCode, 
                    networkType, 
                    privateKey: privateKeyInput.trim(),
                    projectId 
                }),
            });

            const data = await res.json();
            console.log(data); // Debugging output from App component
            
            let addressLink = '';
            if (data.address) {
                const generatedFaucetUrl = `https://faucet.movementnetwork.xyz/?address=${data.address}`;
                addressLink = `\nAddress: ${data.address}\nFaucet: ${generatedFaucetUrl}`;
                setFaucetUrl(generatedFaucetUrl);
            } else {
                setFaucetUrl(''); // Clear faucet URL if address is not returned
            }

            setResponse(
                data.success
                    ? `✅ Initialized\n\n${data.log || ''}${addressLink}`
                    : `❌ Init Failed\n\n${data.error || ''}\n${data.log || ''}`
            );
            setInfoContainerClass(data.success ? 'info-container success' : 'info-container error');
            updateInfo(data.moduleName, data.packageName, data.address);

            if (data.success) {
                updateStatusIcon('init', 'complete');
                setCompileButtonDisabled(false); // Enable compile after successful init
            } else {
                updateStatusIcon('init', 'pending');
                setCompileButtonDisabled(true);
                setDeployButtonDisabled(true);
            }

        } catch (error: any) {
            setResponse(`❌ Request Error:\n${error.message}`);
            console.error(error); // Detailed error logging
            updateStatusIcon('init', 'pending');
            setInfoContainerClass('info-container error');
            setCompileButtonDisabled(true);
            setDeployButtonDisabled(true);
            setFaucetUrl(''); // Clear faucet URL on error
        } finally {
            setLoading(false);
            setPrivateKeyInput(''); // Reset private key input after operation, as per App's behavior
        }
    };

    /**
     * Handles the compilation of the Move package.
     * Corresponds to handleCompile from the App component.
     */
    const compilePackage = async () => {
        if (!moveCode.trim()) {
            setResponse('Error: Please enter Move code before compiling.');
            setInfoContainerClass('info-container error');
            return;
        }

        setLoading(true);
        updateStatusIcon('compile', 'processing');
        setResponse('⏳ Compiling...');
        setInfoContainerClass('info-container'); // Reset class

        try {
            const res = await fetch('http://localhost:3000/compile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ moveCode, projectId }),
            });

            const data = await res.json();
            console.log(data); // Debugging output from App component
            console.log(data.error); // Debugging output from App component
            setResponse(
                data.success
                    ? `✅ Compiled Successfully\n\n${data.log}`
                    : `❌ Compilation Failed\n\n${data.error}`
            );
            setInfoContainerClass(data.success ? 'info-container success' : 'info-container error');
            updateInfo(data.moduleName, data.packageName, data.address); // Update info potentially

            if (data.success) {
                updateStatusIcon('compile', 'complete');
                setDeployButtonDisabled(false); // Enable deploy after successful compile
            } else {
                updateStatusIcon('compile', 'pending');
                setDeployButtonDisabled(true);
            }

        } catch (error: any) {
            setResponse(`❌ Request Error:\n${error.message}`);
            console.error(error);
            updateStatusIcon('compile', 'pending');
            setInfoContainerClass('info-container error');
            setDeployButtonDisabled(true);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handles the deployment of the Move package.
     * Corresponds to handleDeploy from the App component.
     */
    const deployPackage = async () => {
        if (!moveCode.trim()) {
            setResponse('Error: Please enter Move code before deploying.');
            setInfoContainerClass('info-container error');
            return;
        }

        setLoading(true);
        updateStatusIcon('deploy', 'processing');
        setResponse('⏳ Deploying...');
        setInfoContainerClass('info-container'); // Reset class

        try {
            const res = await fetch('http://localhost:3000/deploy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ moveCode, projectId }),
            });

            const data = await res.json();
            
            // Build response message with explorer links
            let responseMessage = '';
            if (data.success) {
                responseMessage = `✅ Deployed Successfully\n\n${data.log || ''}`;
                
                // Add explorer links if available
                if (data.explorerUrls?.account) {
                    responseMessage += `\n\n📦 View Module on Explorer:\n${data.explorerUrls.account}`;
                }
                if (data.explorerUrls?.transaction) {
                    responseMessage += `\n\n📝 Transaction:\n${data.explorerUrls.transaction}`;
                }
                if (data.senderAddress) {
                    responseMessage += `\n\n📍 Account Address: ${data.senderAddress}`;
                }
                if (data.moduleName) {
                    responseMessage += `\n\n📚 Module Name: ${data.moduleName}`;
                }
            } else {
                responseMessage = `❌ Deployment Failed\n\n${data.error || ''}\n${data.log || ''}`;
            }
            
            setResponse(responseMessage);
            setInfoContainerClass(data.success ? 'info-container success' : 'info-container error');
            updateInfo(data.moduleName, data.packageName, data.senderAddress || data.address);

            if (data.success) {
                updateStatusIcon('deploy', 'complete');
                // If deployment is successful, it implies init and compile were also successful for this flow
                updateStatusIcon('init', 'complete');
                updateStatusIcon('compile', 'complete');
                // Update contract address if available
                if (data.senderAddress) {
                    setContractAddress(data.senderAddress);
                }
            } else {
                updateStatusIcon('deploy', 'pending');
            }

        } catch (error: any) {
            setResponse(`❌ Request Error:\n${error.message}`);
            console.error(error);
            updateStatusIcon('deploy', 'pending');
            setInfoContainerClass('info-container error');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handles the removal of Movement configurations/files.
     * Corresponds to handleRemoveMovement from the App component.
     */
    const removeMovementFiles = async () => {
        setLoading(true);
        setResponse('⏳ Removing Movement...');
        setInfoContainerClass('info-container'); // Reset class

        try {
            const res = await fetch('http://localhost:3000/remove-movement');
            const data = await res.json();
            setResponse(
                data.success
                    ? `✅ Removed Movement\n\n${data.log || ''}`
                    : `❌ Remove Failed\n\n${data.error || ''}\n${data.log || ''}`
            );
            setInfoContainerClass(data.success ? 'info-container success' : 'info-container error');
            
            // Reset statuses and related info after removing movement (implies a clean slate)
            updateStatusIcon('init', 'pending');
            updateStatusIcon('compile', 'pending');
            updateStatusIcon('deploy', 'pending');
            setCompileButtonDisabled(true);
            setDeployButtonDisabled(true);
            setFaucetUrl('');
            setContractAddress('None');
            setModuleName('None');
            setPackageName('None');

        } catch (err: any) {
            setResponse(`❌ Request Error:\n${err.message}`);
            console.error(err);
            setInfoContainerClass('info-container error');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Returns style object for status icons based on their status.
     */
    const getStatusIconStyle = (status: 'pending' | 'processing' | 'complete') => {
        const baseStyle = {
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            marginRight: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold' as const,
        };

        switch (status) {
            case 'complete':
                return { ...baseStyle, backgroundColor: '#28a745' };
            case 'processing':
                return { ...baseStyle, backgroundColor: '#ffc107', color: '#212529' };
            default: // 'pending'
                return { ...baseStyle, backgroundColor: '#6c757d' };
        }
    };

    return (
        <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 to-slate-800">
            {/* Chatbot Modal */}
            <SimpleChatbot 
                isOpen={isChatbotOpen} 
                onClose={onChatbotClose || (() => {})}
                onCodeGenerated={handleCodeChange}
            />

            {/* Code Editor Section */}
            <div className="h-[800px] p-6 overflow-hidden">
                <Card className="h-full border-none shadow-none">
                    <CardHeader className="border border-slate-700 rounded-2xl py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                                    <Code className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg text-slate-200">Move Smart Contract</CardTitle>
                                    <p className="text-xs text-slate-400 font-mono">Edit or generate using AI</p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigator.clipboard.writeText(moveCode)}
                                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                            >
                                <Copy className="w-4 h-4 mr-2" />
                                Copy Code
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="h-full p-0">
                            <textarea
                                className="w-full h-full p-4 bg-slate-950 text-slate-200 border-0 focus:outline-none font-mono text-sm rounded-2xl resize-none"
                                value={moveCode}
                                onChange={(e) => handleCodeChange(e.target.value)}
                                placeholder="// Write your Move smart contract here..."
                                spellCheck={false}
                            />
                    </CardContent>
                </Card>
            </div>
            
            <div className="flex-1 overflow-hidden px-6 pb-6">
                <Tabs defaultValue="deploy" className="h-full flex flex-col">
                    <div className="py-2">
                        <TabsList className="bg-slate-800 border-slate-700">
                            <TabsTrigger value="deploy" className="data-[state=active]:bg-cyan-600">Deploy</TabsTrigger>
                            <TabsTrigger value="manage" className="data-[state=active]:bg-cyan-600">Manage</TabsTrigger>
                            <TabsTrigger value="history" className="data-[state=active]:bg-cyan-600">History</TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        <TabsContent value="deploy" className="h-full m-0">
                            <div className="h-full overflow-y-auto">
                                <div className="space-y-6">
                                    <Card className="bg-slate-900/50 border-slate-700">
                                        <CardHeader className="border-b border-slate-700">
                                            <CardTitle className="text-base flex items-center text-slate-200">
                                                <Upload className="w-5 h-5 mr-2 text-cyan-400" />
                                                Contract Deployment Pipeline
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-6">
                                            <div className="space-y-6">
                                                
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label className="text-slate-300">Network Type</Label>
                                                        <Select value={networkType} onValueChange={setNetworkType} disabled={loading}>
                                                            <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-200 mt-2">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-slate-800 border-slate-600">
                                                                <SelectItem value="testnet">Testnet</SelectItem>
                                                                <SelectItem value="devnet">Devnet</SelectItem>
                                                                <SelectItem value="mainnet">Mainnet</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div>
                                                        <Label className="text-slate-300">Private Key (Optional)</Label>
                                                        <Input
                                                            type="password"
                                                            placeholder="Auto-generate if empty"
                                                            value={privateKeyInput}
                                                            onChange={(e) => setPrivateKeyInput(e.target.value)}
                                                            disabled={loading}
                                                            className="bg-slate-800 border-slate-600 text-slate-200 mt-2"
                                                        />
                                                    </div>
                                                </div>

                                                {faucetUrl && (
                                                    <div className="p-4 bg-emerald-900/30 border border-emerald-700/50 rounded-lg">
                                                        <p className="text-sm text-emerald-300 font-mono">
                                                            Faucet URL: <a
                                                                href={faucetUrl}
                                                                target="_blank" 
                                                                rel="noopener noreferrer" 
                                                                className="text-emerald-400 underline hover:text-emerald-300"
                                                            >{faucetUrl}</a>
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="space-y-3 p-4 bg-slate-800/50 rounded-lg">
                                                    <h4 className="text-sm font-semibold text-slate-300 mb-3">Deployment Status</h4>
                                                    <div className="flex items-center space-x-3">
                                                        <div style={getStatusIconStyle(initStatus)} className="flex-shrink-0"></div>
                                                        <span className="text-sm text-slate-300">Initialize Project</span>
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        <div style={getStatusIconStyle(compileStatus)} className="flex-shrink-0"></div>
                                                        <span className="text-sm text-slate-300">Compile Package</span>
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        <div style={getStatusIconStyle(deployStatus)} className="flex-shrink-0"></div>
                                                        <span className="text-sm text-slate-300">Deploy to Network</span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-3">
                                                    <Button 
                                                        onClick={initializeProject} 
                                                        disabled={loading}
                                                        className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500"
                                                    >
                                                        Initialize
                                                    </Button>
                                                    <Button
                                                        onClick={compilePackage}
                                                        disabled={compileButtonDisabled || loading}
                                                        className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500"
                                                    >
                                                        Compile
                                                    </Button>
                                                    <Button
                                                        onClick={deployPackage}
                                                        disabled={deployButtonDisabled || loading}
                                                        className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500"
                                                    >
                                                        Deploy
                                                    </Button>
                                                    <Button
                                                        onClick={removeMovementFiles}
                                                        disabled={loading}
                                                        variant="outline"
                                                        className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                                                    >
                                                        Reset
                                                    </Button>
                                                    <Button
                                                        onClick={getFrontendIntegrationFunctions}
                                                        disabled={loading}
                                                        variant="outline"
                                                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                                    >
                                                        Get Integration Code
                                                    </Button>
                                                </div>

                                                <div>
                                                    <Label className="text-slate-300 mb-2 block">Response Log</Label>
                                                    <pre
                                                        className={`text-sm ${infoContainerClass.includes('error') ? 'text-red-400' : 'text-slate-300'}`}
                                                        style={{
                                                            backgroundColor: '#0f172a',
                                                            padding: '1em',
                                                            whiteSpace: 'pre-wrap',
                                                            border: '1px solid #334155',
                                                            borderRadius: '8px',
                                                            fontFamily: 'monospace',
                                                            fontSize: '13px',
                                                            maxHeight: '200px',
                                                            overflowY: 'auto'
                                                        }}
                                                    >{response}</pre>
                                                </div>

                                                {showIntegrationFunctions && integrationFunctions.length > 0 && (
                                                    <div className="space-y-4">
                                                        <Label className="text-slate-300">Frontend Integration Functions</Label>
                                                        {integrationFunctions.map((func, index) => (
                                                            <div key={index} className="space-y-2">
                                                                <Label className="text-xs font-medium text-cyan-400">
                                                                    {index === 0 ? 'Imports & Setup' : 
                                                                     index === 1 ? 'Module Address' : 
                                                                     `Function Integration ${index - 1}`}
                                                                </Label>
                                                                <div className="relative">
                                                                    <pre
                                                                        className="text-xs"
                                                                        style={{
                                                                            backgroundColor: '#0f172a',
                                                                            color: '#94a3b8',
                                                                            padding: '1em',
                                                                            paddingRight: '3em',
                                                                            whiteSpace: 'pre-wrap',
                                                                            border: '1px solid #334155',
                                                                            borderRadius: '8px',
                                                                            fontFamily: 'monospace',
                                                                            maxHeight: '300px',
                                                                            overflowY: 'auto',
                                                                        }}
                                                                    >{func}</pre>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="absolute top-2 right-2 h-7 px-2 bg-slate-800 border-slate-600"
                                                                        onClick={() => navigator.clipboard.writeText(func)}
                                                                    >
                                                                        <Copy className="w-3 h-3" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="manage" className="h-full m-0">
                            <div className="h-full overflow-y-auto">
                                <div className="p-4">
                                    <Card className="bg-slate-900/50 border-slate-700">
                                        <CardHeader className="border-b border-slate-700">
                                            <CardTitle className="text-base flex items-center text-slate-200">
                                                <Settings className="w-5 h-5 mr-2 text-purple-400" />
                                                Contract Management
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-6">
                                        <div className="space-y-4">
                                            <div className="p-4 bg-blue-900/30 border border-blue-700/50 rounded-lg">
                                                <h4 className="font-medium text-blue-300 mb-2">Deployed Contracts</h4>
                                                <p className="text-sm text-blue-200">Manage and interact with your deployed smart contracts.</p>
                                            </div>

                                            {/* Latest Response Display */}
                                            {response && response !== 'Ready to deploy. Click Initialize to start.' && (
                                                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                                                    <h4 className="text-sm font-semibold text-slate-300 mb-2">Latest Response</h4>
                                                    <pre
                                                        className={`text-xs ${infoContainerClass.includes('error') ? 'text-red-400' : 'text-slate-300'}`}
                                                        style={{
                                                            whiteSpace: 'pre-wrap',
                                                            fontFamily: 'monospace',
                                                            maxHeight: '150px',
                                                            overflowY: 'auto'
                                                        }}
                                                    >{response}</pre>
                                                </div>
                                            )}

                                            {/* Deployment Status Summary */}
                                            <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                                                <h4 className="text-sm font-semibold text-slate-300 mb-3">Deployment Status</h4>
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-slate-400">Initialize</span>
                                                        <Badge variant="outline" className={initStatus === 'complete' ? 'border-green-500 text-green-400' : 'border-slate-600 text-slate-400'}>
                                                            {initStatus === 'complete' ? 'Complete' : initStatus === 'processing' ? 'Processing' : 'Pending'}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-slate-400">Compile</span>
                                                        <Badge variant="outline" className={compileStatus === 'complete' ? 'border-green-500 text-green-400' : 'border-slate-600 text-slate-400'}>
                                                            {compileStatus === 'complete' ? 'Complete' : compileStatus === 'processing' ? 'Processing' : 'Pending'}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-slate-400">Deploy</span>
                                                        <Badge variant="outline" className={deployStatus === 'complete' ? 'border-green-500 text-green-400' : 'border-slate-600 text-slate-400'}>
                                                            {deployStatus === 'complete' ? 'Complete' : deployStatus === 'processing' ? 'Processing' : 'Pending'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>

                                            {contractAddress && contractAddress !== 'None' ? (
                                                <div className="space-y-3">
                                                    <div className="p-4 border border-slate-700 rounded-lg bg-slate-800/50">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <span className="font-medium text-sm text-slate-200">Smart Contract</span>
                                                            <Badge variant="outline" className="border-emerald-500 text-emerald-400">Active</Badge>
                                                        </div>
                                                        <div className="text-xs text-slate-400 mb-3 font-mono">{contractAddress}</div>
                                                        <div className="flex space-x-2">
                                                            <Button variant="outline" size="sm" asChild className="border-slate-600 text-slate-300">
                                                                <a href={`https://explorer.movementnetwork.xyz/account/${contractAddress}?network=bardock+testnet`} target="_blank" rel="noopener noreferrer">
                                                                    <ExternalLink className="w-3 h-3 mr-1" />
                                                                    View
                                                                </a>
                                                            </Button>
                                                            <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                                                                <Settings className="w-3 h-3 mr-1" />
                                                                Manage
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-12 text-slate-400">
                                                    <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                                    <p className="text-sm">No active contracts. Deploy one to get started!</p>
                                                </div>
                                            )}
                                        </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="history" className="h-full m-0">
                            <div className="h-full overflow-y-auto">
                                <div className="p-4">
                                    <Card className="bg-slate-900/50 border-slate-700">
                                        <CardHeader className="border-b border-slate-700">
                                            <CardTitle className="text-base text-slate-200">Deployment History</CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-6">
                                            <div className="max-h-[400px] overflow-y-auto">
                                            <div className="space-y-3">
                                                {/* Init History */}
                                                {projectData?.initData && (
                                                    <div className="p-4 border border-slate-700 rounded-lg bg-slate-800/50">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="font-medium text-sm text-slate-200">Initialization</span>
                                                            <Badge variant="outline" className="border-cyan-500 text-cyan-400">Success</Badge>
                                                        </div>
                                                        <div className="text-xs text-slate-400 mb-1">
                                                            {projectData.initData.timestamp ? new Date(projectData.initData.timestamp).toLocaleString() : 'N/A'}
                                                        </div>
                                                        {projectData.initData.address && (
                                                            <div className="text-xs text-slate-400 mb-2 font-mono break-all">
                                                                Address: {projectData.initData.address}
                                                            </div>
                                                        )}
                                                        {projectData.initData.faucetUrl && (
                                                            <Button variant="outline" size="sm" asChild className="border-slate-600 text-slate-300">
                                                                <a href={projectData.initData.faucetUrl} target="_blank" rel="noopener noreferrer">
                                                                    <ExternalLink className="w-3 h-3 mr-1" />
                                                                    Get Testnet Funds
                                                                </a>
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Compile History */}
                                                {projectData?.compileData && (
                                                    <div className="p-4 border border-slate-700 rounded-lg bg-slate-800/50">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="font-medium text-sm text-slate-200">Compilation</span>
                                                            <Badge variant="outline" className={projectData.compileData.success ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'}>
                                                                {projectData.compileData.success ? 'Success' : 'Failed'}
                                                            </Badge>
                                                        </div>
                                                        <div className="text-xs text-slate-400 mb-2">
                                                            {projectData.compileData.timestamp ? new Date(projectData.compileData.timestamp).toLocaleString() : 'N/A'}
                                                        </div>
                                                        {projectData.compileData.log && (
                                                            <pre className="text-xs text-slate-400 font-mono mt-2 max-h-20 overflow-y-auto bg-slate-900/50 p-2 rounded">
                                                                {projectData.compileData.log.substring(0, 200)}{projectData.compileData.log.length > 200 ? '...' : ''}
                                                            </pre>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Deploy History */}
                                                {projectData?.deployData && projectData.deployData.success ? (
                                                    <div className="p-4 border border-slate-700 rounded-lg bg-slate-800/50">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="font-medium text-sm text-slate-200">Deployment</span>
                                                            <Badge variant="outline" className="border-emerald-500 text-emerald-400">Success</Badge>
                                                        </div>
                                                        <div className="text-xs text-slate-400 mb-1">
                                                            Deployed to Movement {networkType} • {projectData.deployData.timestamp ? new Date(projectData.deployData.timestamp).toLocaleString() : 'N/A'}
                                                        </div>
                                                        {projectData.deployData.address && (
                                                            <div className="text-xs text-slate-400 mb-3 font-mono break-all">{projectData.deployData.address}</div>
                                                        )}
                                                        {projectData.deployData.transactionHash && (
                                                            <div className="text-xs text-slate-400 mb-3 font-mono break-all">
                                                                TX: {projectData.deployData.transactionHash}
                                                            </div>
                                                        )}
                                                        {projectData.deployData.explorerUrl && (
                                                            <Button variant="outline" size="sm" asChild className="border-slate-600 text-slate-300">
                                                                <a href={projectData.deployData.explorerUrl} target="_blank" rel="noopener noreferrer">
                                                                    <ExternalLink className="w-3 h-3 mr-1" />
                                                                    View on Explorer
                                                                </a>
                                                            </Button>
                                                        )}
                                                    </div>
                                                ) : null}

                                                {/* No history message */}
                                                {!projectData?.initData && !projectData?.compileData && !projectData?.deployData && (
                                                    <div className="text-center py-12 text-slate-400">
                                                        <Upload className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                                        <p className="text-sm">No deployment history yet</p>
                                                        <p className="text-xs mt-2">Initialize your project to get started</p>
                                                    </div>
                                                )}
                                            </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}