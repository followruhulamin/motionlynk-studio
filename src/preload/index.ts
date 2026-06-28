import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom API exposed to the renderer
const api = {
  // File operations
  fileExists: (filePath: string) => ipcRenderer.invoke('file:exists', filePath),
  fileStats: (filePath: string) => ipcRenderer.invoke('file:stats', filePath),

  // Dialog
  selectFolder: () => ipcRenderer.invoke('dialog:selectFolder'),

  // Presets
  getPresets: (extensionPath: string) => ipcRenderer.invoke('presets:getAll', extensionPath),
  addPreset: (extensionPath: string, data: {
    name: string
    category: string
    categories?: string[]
    ffxSourcePath?: string
    previewSourcePath?: string
    thumbnailSourcePath?: string
  }) => ipcRenderer.invoke('presets:add', extensionPath, data),
  updatePreset: (extensionPath: string, oldId: string, changes: {
    name?: string
    category?: string
    categories?: string[]
    ffxSourcePath?: string
    previewSourcePath?: string
    thumbnailSourcePath?: string
  }) => ipcRenderer.invoke('presets:update', extensionPath, oldId, changes),
  deletePreset: (extensionPath: string, id: string) =>
    ipcRenderer.invoke('presets:delete', extensionPath, id),
  bulkDeletePresets: (extensionPath: string, ids: string[]) =>
    ipcRenderer.invoke('presets:bulkDelete', extensionPath, ids),
  bulkChangeCategory: (extensionPath: string, ids: string[], newCategory: string) =>
    ipcRenderer.invoke('presets:bulkChangeCategory', extensionPath, ids, newCategory),
  selectFile: (fileType: 'ffx' | 'preview' | 'thumbnail') =>
    ipcRenderer.invoke('presets:selectFile', fileType),
  generateId: (name: string) => ipcRenderer.invoke('presets:generateId', name),

  // Categories
  getCategories: (extensionPath: string) =>
    ipcRenderer.invoke('categories:getAll', extensionPath),
  addCategory: (extensionPath: string, name: string) =>
    ipcRenderer.invoke('categories:add', extensionPath, name),
  renameCategory: (extensionPath: string, oldName: string, newName: string) =>
    ipcRenderer.invoke('categories:rename', extensionPath, oldName, newName),
  deleteCategory: (
    extensionPath: string,
    name: string,
    action: 'move' | 'delete',
    targetCategory?: string
  ) => ipcRenderer.invoke('categories:delete', extensionPath, name, action, targetCategory),

  // Validation
  validatePresets: (extensionPath: string) =>
    ipcRenderer.invoke('validation:check', extensionPath),

  // Extension management
  getExtensionInfo: (extensionPath: string) =>
    ipcRenderer.invoke('extension:getInfo', extensionPath),
  setExtensionVersion: (extensionPath: string, newVersion: string) =>
    ipcRenderer.invoke('extension:setVersion', extensionPath, newVersion),
  setModuleVersion: (extensionPath: string, moduleId: string, newVersion: string) =>
    ipcRenderer.invoke('extension:setModuleVersion', extensionPath, moduleId, newVersion),
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}
