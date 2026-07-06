import { ElectronAPI } from '@electron-toolkit/preload'

interface StudioAPI {
  fileExists: (filePath: string) => Promise<boolean>
  fileStats: (filePath: string) => Promise<{ size: number; mtime: string } | null>
  selectFolder: () => Promise<string | null>

  getPresets: (extensionPath: string) => Promise<{
    version: string
    categories: string[]
    presets: PresetWithStatus[]
  }>
  addPreset: (extensionPath: string, data: {
    name: string
    category: string
    categories?: string[]
    ffxSourcePath?: string
    previewSourcePath?: string
    thumbnailSourcePath?: string
  }) => Promise<{ id: string; success: boolean }>
  updatePreset: (extensionPath: string, oldId: string, changes: {
    name?: string
    category?: string
    categories?: string[]
    ffxSourcePath?: string
    previewSourcePath?: string
    thumbnailSourcePath?: string
  }) => Promise<{ id: string; success: boolean }>
  deletePreset: (extensionPath: string, id: string) => Promise<{ success: boolean }>
  bulkDeletePresets: (extensionPath: string, ids: string[]) => Promise<{ success: boolean }>
  bulkChangeCategory: (extensionPath: string, ids: string[], newCategory: string) => Promise<{ success: boolean }>
  selectFile: (fileType: 'ffx' | 'preview' | 'thumbnail') => Promise<string | null>
  generateId: (name: string) => Promise<string>

  getCategories: (extensionPath: string) => Promise<{ name: string; count: number }[]>
  addCategory: (extensionPath: string, name: string) => Promise<{ success: boolean }>
  renameCategory: (extensionPath: string, oldName: string, newName: string) => Promise<{ success: boolean; affectedPresets: number }>
  deleteCategory: (extensionPath: string, name: string, action: 'move' | 'delete', targetCategory?: string) => Promise<{ success: boolean }>

  validatePresets: (extensionPath: string) => Promise<ValidationResult>

  // Extension management
  getExtensionInfo: (extensionPath: string) => Promise<{
    version: string
    bundleId: string
    bundleName: string
    modules: { id: string; name: string; version: string }[]
  }>
  setExtensionVersion: (extensionPath: string, newVersion: string) => Promise<{
    version: string
    bundleId: string
    bundleName: string
    modules: { id: string; name: string; version: string }[]
  }>
  setModuleVersion: (extensionPath: string, moduleId: string, newVersion: string) => Promise<{
    version: string
    bundleId: string
    bundleName: string
    modules: { id: string; name: string; version: string }[]
  }>

  // Expo
  getExpoLibrary: (extensionPath: string) => Promise<{ categories: string[]; expressions: any[] }>
  saveExpoLibrary: (extensionPath: string, data: any) => Promise<boolean>
  saveExpoExpression: (extensionPath: string, expression: any, previewSourcePath?: string) => Promise<boolean>
  deleteExpoExpression: (extensionPath: string, id: string) => Promise<boolean>
  selectExpoFile: () => Promise<string | null>
  validateExpoLibrary: (extensionPath: string) => Promise<any>
}

interface PresetWithStatus {
  id: string
  name: string
  category: string
  categories?: string[]
  hasFfx: boolean
  hasPreview: boolean
  hasThumbnail: boolean
  thumbnailExt: string | null
  thumbnailPath: string | null
  previewPath: string | null
  ffxPath: string | null
}

interface ValidationResult {
  totalPresets: number
  totalCategories: number
  missingFfx: string[]
  missingPreviews: string[]
  missingThumbnails: string[]
  duplicateIds: string[]
  invalidCategories: { id: string; category: string }[]
  orphanedFiles: { dir: string; file: string }[]
  lastModified: string | null
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: StudioAPI
  }
}
