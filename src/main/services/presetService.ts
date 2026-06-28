import { ipcMain, dialog } from 'electron'
import * as path from 'path'
import {
  readPresetsJson,
  writePresetsJson,
  getPresetsDir,
  fileExists,
  copyFile,
  renameFile,
  deleteFile,
  type PresetEntry
} from './fileService'

/**
 * Generate a filesystem-safe ID from a preset name.
 */
function generateId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, '')
    .replace(/[\s-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
}

/**
 * Find the thumbnail extension for a preset ID.
 */
function findThumbnailExt(presetsDir: string, id: string): string | null {
  const extensions = ['.png', '.jpg', '.jpeg', '.webp']
  for (const ext of extensions) {
    if (fileExists(path.join(presetsDir, 'thumbnails', id + ext))) {
      return ext
    }
  }
  return null
}

export interface PresetWithStatus extends PresetEntry {
  hasFfx: boolean
  hasPreview: boolean
  hasThumbnail: boolean
  thumbnailExt: string | null
  thumbnailPath: string | null
  previewPath: string | null
  ffxPath: string | null
}

export function registerPresetHandlers(): void {
  /**
   * Get all presets with file status information.
   */
  ipcMain.handle('presets:getAll', (_event, extensionPath: string) => {
    const manifest = readPresetsJson(extensionPath)
    const presetsDir = getPresetsDir(extensionPath)

    const presetsWithStatus: PresetWithStatus[] = manifest.presets.map((preset) => {
      const ffxPath = path.join(presetsDir, 'ffx', preset.id + '.ffx')
      const previewPath = path.join(presetsDir, 'previews', preset.id + '.mp4')
      const thumbExt = findThumbnailExt(presetsDir, preset.id)
      const thumbnailPath = thumbExt
        ? path.join(presetsDir, 'thumbnails', preset.id + thumbExt)
        : null

      return {
        ...preset,
        hasFfx: fileExists(ffxPath),
        hasPreview: fileExists(previewPath),
        hasThumbnail: thumbExt !== null,
        thumbnailExt: thumbExt,
        thumbnailPath,
        previewPath: fileExists(previewPath) ? previewPath : null,
        ffxPath: fileExists(ffxPath) ? ffxPath : null
      }
    })

    return {
      version: manifest.version,
      categories: manifest.categories,
      presets: presetsWithStatus
    }
  })

  /**
   * Add a new preset.
   */
  ipcMain.handle(
    'presets:add',
    async (
      _event,
      extensionPath: string,
      data: {
        name: string
        category: string
        categories?: string[]
        ffxSourcePath?: string
        previewSourcePath?: string
        thumbnailSourcePath?: string
      }
    ) => {
      const manifest = readPresetsJson(extensionPath)
      const presetsDir = getPresetsDir(extensionPath)
      const id = generateId(data.name)

      // Check uniqueness
      if (manifest.presets.some((p) => p.id === id)) {
        throw new Error(`A preset with ID "${id}" already exists.`)
      }

      // Copy files with standardized names
      if (data.ffxSourcePath) {
        copyFile(data.ffxSourcePath, path.join(presetsDir, 'ffx', id + '.ffx'))
      }

      if (data.previewSourcePath) {
        copyFile(data.previewSourcePath, path.join(presetsDir, 'previews', id + '.mp4'))
      }

      if (data.thumbnailSourcePath) {
        const ext = path.extname(data.thumbnailSourcePath)
        copyFile(data.thumbnailSourcePath, path.join(presetsDir, 'thumbnails', id + ext))
      }

      // Append to manifest
      manifest.presets.push({
        id,
        name: data.name,
        category: data.categories && data.categories.length > 0 ? data.categories[0] : data.category,
        categories: data.categories || [data.category]
      })

      writePresetsJson(extensionPath, manifest)
      return { id, success: true }
    }
  )

  /**
   * Update an existing preset.
   */
  ipcMain.handle(
    'presets:update',
    async (
      _event,
      extensionPath: string,
      oldId: string,
      changes: {
        name?: string
        category?: string
        categories?: string[]
        ffxSourcePath?: string
        previewSourcePath?: string
        thumbnailSourcePath?: string
      }
    ) => {
      const manifest = readPresetsJson(extensionPath)
      const presetsDir = getPresetsDir(extensionPath)
      const idx = manifest.presets.findIndex((p) => p.id === oldId)

      if (idx === -1) {
        throw new Error(`Preset "${oldId}" not found.`)
      }

      const preset = manifest.presets[idx]
      let newId = oldId

      // If name changed, regenerate ID and rename all files
      if (changes.name && changes.name !== preset.name) {
        newId = generateId(changes.name)

        if (newId !== oldId && manifest.presets.some((p) => p.id === newId)) {
          throw new Error(`A preset with ID "${newId}" already exists.`)
        }

        if (newId !== oldId) {
          // Rename FFX
          const oldFfx = path.join(presetsDir, 'ffx', oldId + '.ffx')
          if (fileExists(oldFfx)) {
            renameFile(oldFfx, path.join(presetsDir, 'ffx', newId + '.ffx'))
          }

          // Rename preview
          const oldPreview = path.join(presetsDir, 'previews', oldId + '.mp4')
          if (fileExists(oldPreview)) {
            renameFile(oldPreview, path.join(presetsDir, 'previews', newId + '.mp4'))
          }

          // Rename thumbnail (detect extension)
          const thumbExt = findThumbnailExt(presetsDir, oldId)
          if (thumbExt) {
            const oldThumb = path.join(presetsDir, 'thumbnails', oldId + thumbExt)
            renameFile(oldThumb, path.join(presetsDir, 'thumbnails', newId + thumbExt))
          }
        }

        preset.name = changes.name
        preset.id = newId
      }

      if (changes.categories) {
        preset.categories = changes.categories
        preset.category = changes.categories[0] || 'Default'
      } else if (changes.category) {
        preset.category = changes.category
        preset.categories = [changes.category]
      }

      // Replace files if new sources provided
      if (changes.ffxSourcePath) {
        copyFile(changes.ffxSourcePath, path.join(presetsDir, 'ffx', newId + '.ffx'))
      }
      if (changes.previewSourcePath) {
        copyFile(changes.previewSourcePath, path.join(presetsDir, 'previews', newId + '.mp4'))
      }
      if (changes.thumbnailSourcePath) {
        const ext = path.extname(changes.thumbnailSourcePath)
        copyFile(changes.thumbnailSourcePath, path.join(presetsDir, 'thumbnails', newId + ext))
      }

      manifest.presets[idx] = preset
      writePresetsJson(extensionPath, manifest)
      return { id: newId, success: true }
    }
  )

  /**
   * Delete a preset and all associated files.
   */
  ipcMain.handle('presets:delete', async (_event, extensionPath: string, id: string) => {
    const manifest = readPresetsJson(extensionPath)
    const presetsDir = getPresetsDir(extensionPath)

    manifest.presets = manifest.presets.filter((p) => p.id !== id)

    // Delete associated files
    deleteFile(path.join(presetsDir, 'ffx', id + '.ffx'))
    deleteFile(path.join(presetsDir, 'previews', id + '.mp4'))

    const thumbExt = findThumbnailExt(presetsDir, id)
    if (thumbExt) {
      deleteFile(path.join(presetsDir, 'thumbnails', id + thumbExt))
    }

    writePresetsJson(extensionPath, manifest)
    return { success: true }
  })

  /**
   * Bulk delete presets.
   */
  ipcMain.handle('presets:bulkDelete', async (_event, extensionPath: string, ids: string[]) => {
    const manifest = readPresetsJson(extensionPath)
    const presetsDir = getPresetsDir(extensionPath)

    for (const id of ids) {
      deleteFile(path.join(presetsDir, 'ffx', id + '.ffx'))
      deleteFile(path.join(presetsDir, 'previews', id + '.mp4'))
      const thumbExt = findThumbnailExt(presetsDir, id)
      if (thumbExt) {
        deleteFile(path.join(presetsDir, 'thumbnails', id + thumbExt))
      }
    }

    manifest.presets = manifest.presets.filter((p) => !ids.includes(p.id))
    writePresetsJson(extensionPath, manifest)
    return { success: true }
  })

  /**
   * Bulk change category.
   */
  ipcMain.handle(
    'presets:bulkChangeCategory',
    async (_event, extensionPath: string, ids: string[], newCategory: string) => {
      const manifest = readPresetsJson(extensionPath)

      for (const preset of manifest.presets) {
        if (ids.includes(preset.id)) {
          preset.category = newCategory
          preset.categories = [newCategory]
        }
      }

      writePresetsJson(extensionPath, manifest)
      return { success: true }
    }
  )

  /**
   * Open file dialog for selecting preset files.
   */
  ipcMain.handle(
    'presets:selectFile',
    async (_event, fileType: 'ffx' | 'preview' | 'thumbnail') => {
      const filters: Record<string, { name: string; extensions: string[] }[]> = {
        ffx: [{ name: 'FFX Preset', extensions: ['ffx'] }],
        preview: [{ name: 'Video', extensions: ['mp4'] }],
        thumbnail: [{ name: 'Image', extensions: ['png', 'jpg', 'jpeg', 'webp'] }]
      }

      const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: filters[fileType] || []
      })

      if (result.canceled) return null
      return result.filePaths[0]
    }
  )

  /**
   * Generate ID preview from name.
   */
  ipcMain.handle('presets:generateId', (_event, name: string) => {
    return generateId(name)
  })
}
