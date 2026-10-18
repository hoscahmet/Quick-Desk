import { contextBridge, ipcRenderer } from 'electron'

const api = {
  getData: () => ipcRenderer.invoke('storage:get'),
  saveData: (data: unknown) => ipcRenderer.invoke('storage:set', data),
  toggleAlwaysOnTop: () => ipcRenderer.invoke('window:toggle-always-on-top'),
  isAlwaysOnTop: () => ipcRenderer.invoke('window:is-always-on-top'),
  toggleCompact: () => ipcRenderer.invoke('window:toggle-compact'),
  copyToClipboard: (text: string) => ipcRenderer.invoke('clipboard:write', text),
  readClipboard: () => ipcRenderer.invoke('clipboard:read')
}

try {
  contextBridge.exposeInMainWorld('api', api)
} catch (error) {
  console.error(error)
}

export type QuickDeskAPI = typeof api
