import { contextBridge, ipcRenderer } from 'electron'

const api = {
  getData: () => ipcRenderer.invoke('storage:get'),
  saveData: (data: unknown) => ipcRenderer.invoke('storage:set', data),
  toggleAlwaysOnTop: () => ipcRenderer.invoke('window:toggle-always-on-top'),
  isAlwaysOnTop: () => ipcRenderer.invoke('window:is-always-on-top'),
  toggleCompact: () => ipcRenderer.invoke('window:toggle-compact'),
  copyToClipboard: (text: string) => ipcRenderer.invoke('clipboard:write', text),
  readClipboard: () => ipcRenderer.invoke('clipboard:read'),
  security: {
    getStatus: () => ipcRenderer.invoke('security:status'),
    setPassword: (password: string) => ipcRenderer.invoke('security:set-password', password),
    unlock: (password: string) => ipcRenderer.invoke('security:unlock', password),
    lock: () => ipcRenderer.invoke('security:lock'),
    changePassword: (oldPass: string, newPass: string) =>
      ipcRenderer.invoke('security:change-password', { oldPass, newPass }),
    removePassword: (password: string) => ipcRenderer.invoke('security:remove-password', password)
  }
}

try {
  contextBridge.exposeInMainWorld('api', api)
} catch (error) {
  console.error(error)
}

export type QuickDeskAPI = typeof api
