import { ipcMain } from 'electron'
import { readPresetsJson, writePresetsJson } from './fileService'

export function registerCategoryHandlers(): void {
  /**
   * Get all categories with preset counts.
   */
  ipcMain.handle('categories:getAll', (_event, extensionPath: string) => {
    const manifest = readPresetsJson(extensionPath)

    const categoriesWithCounts = manifest.categories.map((cat) => ({
      name: cat,
      count: manifest.presets.filter((p) => {
        if (p.categories && Array.isArray(p.categories)) {
          return p.categories.includes(cat)
        }
        return p.category === cat
      }).length
    }))

    return categoriesWithCounts
  })

  /**
   * Add a new category.
   */
  ipcMain.handle('categories:add', (_event, extensionPath: string, name: string) => {
    const manifest = readPresetsJson(extensionPath)

    if (manifest.categories.includes(name)) {
      throw new Error(`Category "${name}" already exists.`)
    }

    manifest.categories.push(name)
    writePresetsJson(extensionPath, manifest)
    return { success: true }
  })

  /**
   * Rename a category and cascade to all presets.
   */
  ipcMain.handle(
    'categories:rename',
    (_event, extensionPath: string, oldName: string, newName: string) => {
      const manifest = readPresetsJson(extensionPath)

      const idx = manifest.categories.indexOf(oldName)
      if (idx === -1) {
        throw new Error(`Category "${oldName}" not found.`)
      }

      if (manifest.categories.includes(newName)) {
        throw new Error(`Category "${newName}" already exists.`)
      }

      // Update categories array
      manifest.categories[idx] = newName

      // Cascade: update all presets referencing old category
      for (const preset of manifest.presets) {
        if (preset.category === oldName) {
          preset.category = newName
        }
        if (preset.categories && Array.isArray(preset.categories)) {
          preset.categories = preset.categories.map((cat) => (cat === oldName ? newName : cat))
        }
      }

      writePresetsJson(extensionPath, manifest)
      return {
        success: true,
        affectedPresets: manifest.presets.filter((p) => {
          if (p.categories && Array.isArray(p.categories)) {
            return p.categories.includes(newName)
          }
          return p.category === newName
        }).length
      }
    }
  )

  /**
   * Delete a category.
   * action: 'move' → move presets to targetCategory
   * action: 'delete' → delete all presets in this category
   */
  ipcMain.handle(
    'categories:delete',
    (
      _event,
      extensionPath: string,
      name: string,
      action: 'move' | 'delete',
      targetCategory?: string
    ) => {
      const manifest = readPresetsJson(extensionPath)

      const idx = manifest.categories.indexOf(name)
      if (idx === -1) {
        throw new Error(`Category "${name}" not found.`)
      }

      if (action === 'move' && targetCategory) {
        // Move all presets to target category
        for (const preset of manifest.presets) {
          if (preset.category === name) {
            preset.category = targetCategory
          }
          if (preset.categories && Array.isArray(preset.categories)) {
            if (preset.categories.includes(name)) {
              const filtered = preset.categories.filter((cat) => cat !== name)
              if (!filtered.includes(targetCategory)) {
                filtered.push(targetCategory)
              }
              preset.categories = filtered
            }
          }
        }
      } else if (action === 'delete') {
        // Remove the category from the preset. If a preset has other categories left, keep it.
        // If it was only in this category, remove the preset entirely.
        manifest.presets = manifest.presets.filter((p) => {
          if (p.categories && Array.isArray(p.categories)) {
            if (p.categories.includes(name)) {
              p.categories = p.categories.filter((cat) => cat !== name)
              p.category = p.categories[0] || ''
              return p.categories.length > 0
            }
            return true
          }
          return p.category !== name
        })
      }

      // Remove category from the array
      manifest.categories.splice(idx, 1)

      writePresetsJson(extensionPath, manifest)
      return { success: true }
    }
  )
}
