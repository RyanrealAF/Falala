const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electronAPI',
  {
    openFileDialog: () => ipcRenderer.invoke('dialog:openFile'),
    onFileSelected: (callback) => ipcRenderer.on('file-selected', callback),
    onFileProcessed: (callback) => ipcRenderer.on('file-processed', callback)
  }
);