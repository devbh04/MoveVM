import { create } from 'zustand';

export type DeploymentHistory = {
  id: string;
  type: 'init' | 'compile' | 'deploy';
  status: 'success' | 'error';
  timestamp: Date;
  data: {
    address?: string;
    moduleName?: string;
    packageName?: string;
    transactionHash?: string;
    explorerUrls?: {
      account?: string;
      transaction?: string;
    };
    faucetUrl?: string;
    log?: string;
    error?: string;
  };
};

interface BuilderState {
  code: string;
  deploymentHistory: DeploymentHistory[];
  currentFile: string;
  files: Record<string, string>;
  setCode: (code: string) => void;
  addDeploymentHistory: (history: DeploymentHistory) => void;
  setCurrentFile: (file: string) => void;
  addFile: (name: string, content: string) => void;
  updateFile: (name: string, content: string) => void;
  deleteFile: (name: string) => void;
  loadFilesFromProject: (projectFiles: Array<{name: string, content: string, path: string, type: string}>) => void;
  clearFiles: () => void;
}

export const useBuilderStore = create<BuilderState>((set) => ({
  code: '',
  deploymentHistory: [],
  currentFile: 'sources/project.move',
  files: {
    'sources/project.move': '',
  },
  setCode: (code: string) => set({ code }),
  addDeploymentHistory: (history: DeploymentHistory) =>
    set((state: BuilderState) => ({
      deploymentHistory: [history, ...state.deploymentHistory],
    })),
  setCurrentFile: (file: string) => set({ currentFile: file }),
  addFile: (name: string, content: string) =>
    set((state: BuilderState) => ({
      files: { ...state.files, [name]: content },
    })),
  updateFile: (name: string, content: string) =>
    set((state: BuilderState) => ({
      files: { ...state.files, [name]: content },
      code: state.currentFile === name ? content : state.code,
    })),
  deleteFile: (name: string) =>
    set((state: BuilderState) => {
      const newFiles = { ...state.files };
      delete newFiles[name];
      return {
        files: newFiles,
        currentFile: Object.keys(newFiles)[0] || 'sources/project.move',
        code: state.currentFile === name ? (Object.values(newFiles)[0] || '') : state.code,
      };
    }),
  // Load all files from project data (DB)
  loadFilesFromProject: (projectFiles) =>
    set((state: BuilderState) => {
      const newFiles: Record<string, string> = {};
      
      projectFiles.forEach(file => {
        // Only load source and config files, not build files
        if ((file.type === 'source' || file.type === 'config') && !file.path.startsWith('build')) {
          // Store with full path for source files, simple name for config
          let storePath: string;
          
          if (file.name === 'Move.toml') {
            storePath = 'Move.toml';
          } else if (file.name === 'project.move' && (!file.path || file.path === '')) {
            // Migration: old project.move files without path should be treated as sources/project.move
            storePath = 'sources/project.move';
          } else if (file.path && file.path !== '') {
            storePath = `${file.path}/${file.name}`;
          } else {
            // Default to sources/ for any .move files
            storePath = file.name.endsWith('.move') ? `sources/${file.name}` : file.name;
          }
          
          newFiles[storePath] = file.content || '';
        }
      });
      
      // If sources/project.move exists, make it the current file
      const currentFile = newFiles['sources/project.move'] 
        ? 'sources/project.move' 
        : Object.keys(newFiles)[0] || 'sources/project.move';
      
      return {
        files: newFiles,
        currentFile,
        code: newFiles[currentFile] || ''
      };
    }),
  // Clear all files (for logout or project switch)
  clearFiles: () =>
    set({
      files: { 'sources/project.move': '' },
      currentFile: 'sources/project.move',
      code: '',
      deploymentHistory: []
    }),
}));
