import { create } from 'zustand';

export interface EditorState {
  // Syntax highlighting
  syntaxEnabled: boolean;
  setSyntaxEnabled: (enabled: boolean) => void;
  
  // IntelliSense
  intellisenseEnabled: boolean;
  setIntellisenseEnabled: (enabled: boolean) => void;
  
  // Autocomplete
  autocompleteSuggestions: string[];
  showAutocomplete: boolean;
  autocompletePosition: { line: number; column: number } | null;
  setShowAutocomplete: (show: boolean) => void;
  setAutocompletePosition: (pos: { line: number; column: number } | null) => void;
  
  // Cursor position
  cursorPosition: { line: number; column: number };
  setCursorPosition: (pos: { line: number; column: number }) => void;
  
  // Code analysis
  diagnostics: Array<{
    line: number;
    column: number;
    message: string;
    severity: 'error' | 'warning' | 'info';
  }>;
  setDiagnostics: (diagnostics: Array<{
    line: number;
    column: number;
    message: string;
    severity: 'error' | 'warning' | 'info';
  }>) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  syntaxEnabled: true,
  setSyntaxEnabled: (enabled: boolean) => set({ syntaxEnabled: enabled }),
  
  intellisenseEnabled: true,
  setIntellisenseEnabled: (enabled: boolean) => set({ intellisenseEnabled: enabled }),
  
  autocompleteSuggestions: [],
  showAutocomplete: false,
  autocompletePosition: null,
  setShowAutocomplete: (show: boolean) => set({ showAutocomplete: show }),
  setAutocompletePosition: (pos: { line: number; column: number } | null) => 
    set({ autocompletePosition: pos }),
  
  cursorPosition: { line: 1, column: 1 },
  setCursorPosition: (pos: { line: number; column: number }) => 
    set({ cursorPosition: pos }),
  
  diagnostics: [],
  setDiagnostics: (diagnostics) => set({ diagnostics }),
}));

