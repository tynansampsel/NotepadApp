const { context, ipcRenderer, contextBridge } = require('electron');
contextBridge.exposeInMainWorld('electronAPI',{
    
    fileOpen: () => ipcRenderer.invoke('fileOpen'),
    loadSettings: () => ipcRenderer.invoke('loadSettings'),
    fileSaveAs: (contents) => ipcRenderer.invoke('fileSaveAs', contents),
    fileSave: (savePath) => ipcRenderer.invoke('fileSave', savePath),
    exit: (data) => ipcRenderer.invoke('exit',data),
    minimize: () => ipcRenderer.invoke('minimize'),
    changeTheme: () => ipcRenderer.send('changeTheme', theme),
    changeTitle: (title) => ipcRenderer.send('changeTitle', title),
    toggleTheme: () => ipcRenderer.invoke('toggleTheme')
})