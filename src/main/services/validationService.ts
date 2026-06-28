import { ipcMain } from 'electron'
import * as path from 'path'
import { readPresetsJson, getPresetsDir, fileExists, listFiles, getFileStats } from './fileService'

export interface ValidationResult {
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

export function registerValidationHandlers(): void {
  ipcMain.handle('validation:check', (_event, extensionPath: string): ValidationResult => {
    const manifest = readPresetsJson(extensionPath)
    const presetsDir = getPresetsDir(extensionPath)

    const missingFfx: string[] = []
    const missingPreviews: string[] = []
    const missingThumbnails: string[] = []
    const duplicateIds: string[] = []
    const invalidCategories: { id: string; category: string }[] = []

    // Check for duplicate IDs
    const idCounts = new Map<string, number>()
    for (const preset of manifest.presets) {
      idCounts.set(preset.id, (idCounts.get(preset.id) || 0) + 1)
    }
    for (const [id, count] of idCounts) {
      if (count > 1) duplicateIds.push(id)
    }

    // Check each preset for file existence and valid categories
    for (const preset of manifest.presets) {
      const ffxPath = path.join(presetsDir, 'ffx', preset.id + '.ffx')
      const previewPath = path.join(presetsDir, 'previews', preset.id + '.mp4')

      if (!fileExists(ffxPath)) missingFfx.push(preset.id)
      if (!fileExists(previewPath)) missingPreviews.push(preset.id)

      // Check thumbnail (.png, .jpg, .jpeg, .webp)
      const thumbExts = ['.png', '.jpg', '.jpeg', '.webp']
      const hasThumb = thumbExts.some((ext) =>
        fileExists(path.join(presetsDir, 'thumbnails', preset.id + ext))
      )
      if (!hasThumb) missingThumbnails.push(preset.id)

      // Check category validity
      if (preset.categories && Array.isArray(preset.categories)) {
        for (const cat of preset.categories) {
          if (!manifest.categories.includes(cat)) {
            invalidCategories.push({ id: preset.id, category: cat })
          }
        }
      } else if (!manifest.categories.includes(preset.category)) {
        invalidCategories.push({ id: preset.id, category: preset.category })
      }
    }

    // Find orphaned files (files in folders not referenced by any preset)
    const orphanedFiles: { dir: string; file: string }[] = []
    const presetIds = new Set(manifest.presets.map((p) => p.id))

    const ffxFiles = listFiles(path.join(presetsDir, 'ffx'), '.ffx')
    for (const f of ffxFiles) {
      const id = path.basename(f, '.ffx')
      if (!presetIds.has(id)) {
        orphanedFiles.push({ dir: 'ffx', file: f })
      }
    }

    const previewFiles = listFiles(path.join(presetsDir, 'previews'), '.mp4')
    for (const f of previewFiles) {
      const id = path.basename(f, '.mp4')
      if (!presetIds.has(id)) {
        orphanedFiles.push({ dir: 'previews', file: f })
      }
    }

    // Last modified for presets.json
    const jsonStats = getFileStats(path.join(presetsDir, 'presets.json'))

    return {
      totalPresets: manifest.presets.length,
      totalCategories: manifest.categories.length,
      missingFfx,
      missingPreviews,
      missingThumbnails,
      duplicateIds,
      invalidCategories,
      orphanedFiles,
      lastModified: jsonStats?.mtime || null
    }
  })
}
