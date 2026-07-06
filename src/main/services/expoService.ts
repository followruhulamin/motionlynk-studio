import { ipcMain, dialog } from 'electron'
import { join } from 'path'
import * as fs from 'fs'

export function registerExpoHandlers(): void {
  // Read expo_library.json
  ipcMain.handle('expo:getLibrary', async (_, extensionPath: string) => {
    try {
      const dbPath = join(extensionPath, 'modules', 'expo', 'starter', 'expo_library.json')
      if (!fs.existsSync(dbPath)) {
        return { version: '1.0.0', categories: [], categoryColors: {}, expressions: [] }
      }
      const data = fs.readFileSync(dbPath, 'utf-8')
      return JSON.parse(data)
    } catch (error) {
      console.error('Failed to read expo library:', error)
      throw error
    }
  })

  // Write expo_library.json
  ipcMain.handle('expo:saveLibrary', async (_, extensionPath: string, data: any) => {
    try {
      const starterPath = join(extensionPath, 'modules', 'expo', 'starter')
      if (!fs.existsSync(starterPath)) {
        fs.mkdirSync(starterPath, { recursive: true })
      }
      const dbPath = join(starterPath, 'expo_library.json')
      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8')
      return true
    } catch (error) {
      console.error('Failed to save expo library:', error)
      throw error
    }
  })

  // Add/edit an expression (with media copying)
  ipcMain.handle('expo:saveExpression', async (_, extensionPath: string, expression: any, previewSourcePath?: string) => {
    try {
      const starterPath = join(extensionPath, 'modules', 'expo', 'starter')
      const previewsPath = join(starterPath, 'GIFs')
      const dbPath = join(starterPath, 'expo_library.json')

      if (!fs.existsSync(previewsPath)) {
        fs.mkdirSync(previewsPath, { recursive: true })
      }

      // Handle media copy
      if (previewSourcePath && fs.existsSync(previewSourcePath)) {
        const dest = join(previewsPath, `${expression.id}.gif`)
        fs.copyFileSync(previewSourcePath, dest)
      }

      // Load DB
      let db = { version: '1.0.0', categories: [], categoryColors: {}, expressions: [] as any[] }
      if (fs.existsSync(dbPath)) {
        db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
      }

      // Merge category if new
      if (!db.categories.includes(expression.category)) {
        db.categories.push(expression.category)
      }

      // Update or push expression
      const idx = db.expressions.findIndex((e: any) => e.id === expression.id)
      if (idx >= 0) {
        db.expressions[idx] = expression
      } else {
        db.expressions.unshift(expression)
      }

      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8')
      return true
    } catch (error) {
      console.error('Failed to save expo expression:', error)
      throw error
    }
  })

  // Delete an expression
  ipcMain.handle('expo:deleteExpression', async (_, extensionPath: string, id: string) => {
    try {
      const starterPath = join(extensionPath, 'modules', 'expo', 'starter')
      const dbPath = join(starterPath, 'expo_library.json')
      const previewPath = join(starterPath, 'GIFs', `${id}.gif`)

      if (fs.existsSync(previewPath)) {
        fs.unlinkSync(previewPath)
      }

      if (fs.existsSync(dbPath)) {
        const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
        db.expressions = db.expressions.filter((e: any) => e.id !== id)
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8')
      }
      return true
    } catch (error) {
      console.error('Failed to delete expo expression:', error)
      throw error
    }
  })

  // Select a preview file (GIF)
  ipcMain.handle('expo:selectFile', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'GIF Image', extensions: ['gif'] }]
    })
    if (result.canceled) return null
    return result.filePaths[0]
  })

  // Validate expo library
  ipcMain.handle('expo:validate', async (_, extensionPath: string) => {
    const starterPath = join(extensionPath, 'modules', 'expo', 'starter')
    const dbPath = join(starterPath, 'expo_library.json')
    const previewsPath = join(starterPath, 'GIFs')
    
    let db = { categories: [] as string[], expressions: [] as any[] }
    let lastModified = null
    
    try {
      if (fs.existsSync(dbPath)) {
        db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
        const stats = fs.statSync(dbPath)
        lastModified = stats.mtime.toISOString()
      }
    } catch (e) {
      console.error(e)
    }

    const missingPreviews: string[] = []
    const duplicateIds: string[] = []
    const invalidCategories: { id: string; category: string }[] = []

    const idCounts = new Map<string, number>()
    for (const exp of db.expressions) {
      idCounts.set(exp.id, (idCounts.get(exp.id) || 0) + 1)
    }
    for (const [id, count] of idCounts) {
      if (count > 1) duplicateIds.push(id)
    }

    for (const exp of db.expressions) {
      const previewFile = join(previewsPath, `${exp.id}.gif`)
      if (!fs.existsSync(previewFile)) {
        missingPreviews.push(exp.id)
      }

      if (exp.categories && Array.isArray(exp.categories)) {
        for (const cat of exp.categories) {
          if (!db.categories.includes(cat)) {
            invalidCategories.push({ id: exp.id, category: cat })
          }
        }
      } else if (exp.category && !db.categories.includes(exp.category)) {
        invalidCategories.push({ id: exp.id, category: exp.category })
      }
    }

    const orphanedFiles: { dir: string; file: string }[] = []
    const expIds = new Set(db.expressions.map((e: any) => e.id))
    
    if (fs.existsSync(previewsPath)) {
      const files = fs.readdirSync(previewsPath)
      for (const file of files) {
        if (file.endsWith('.gif')) {
          const id = file.replace('.gif', '')
          if (!expIds.has(id)) {
            orphanedFiles.push({ dir: 'GIFs', file })
          }
        }
      }
    }

    return {
      totalExpressions: db.expressions.length,
      totalCategories: db.categories.length,
      missingPreviews,
      duplicateIds,
      invalidCategories,
      orphanedFiles,
      lastModified
    }
  })
}
