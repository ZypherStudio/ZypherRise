const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('launcherAPI', {
  launch: (data) => ipcRenderer.invoke('launch-game', data),
  msLogin: () => ipcRenderer.invoke('ms-login'),
  installMod: (data) => ipcRenderer.invoke('install-mod', data),
  onProgress: (callback) => ipcRenderer.on('launcher-progress', (event, data) => callback(data)),
  onClosed: (callback) => ipcRenderer.on('launcher-closed', (event, data) => callback(data)),
  closeApp: () => ipcRenderer.send('close-app'),
  minimizeApp: () => ipcRenderer.send('minimize-app'),
  getTotalMem: () => ipcRenderer.invoke('get-total-mem'),
  onUpdateMsg: (callback) => ipcRenderer.on('update-msg', (event, data) => callback(data)),
  onUpdateProgress: (callback) => ipcRenderer.on('update-progress', (event, data) => callback(data)),
  restartApp: () => ipcRenderer.send('restart-app')
});
