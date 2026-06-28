import { ipcMain } from 'electron'
import * as fs from 'fs'
import * as path from 'path'

export interface PresetsManifest {
  version: string
  categories: string[]
  presets: PresetEntry[]
}

export interface PresetEntry {
  id: string
  name: string
  category: string
  categories?: string[]
}

/**
 * Resolves the AE_Presets directory path for the kinetic module.
 */
export function getPresetsDir(extensionPath: string): string {
  return path.join(extensionPath, 'modules', 'kinetic', 'presets', 'AE_Presets')
}

/**
 * Read and parse presets.json from the extension folder.
 */
export function readPresetsJson(extensionPath: string): PresetsManifest {
  const presetsDir = getPresetsDir(extensionPath)
  const jsonPath = path.join(presetsDir, 'presets.json')

  if (!fs.existsSync(jsonPath)) {
    return { version: '1.0.0', categories: [], presets: [] }
  }

  const raw = fs.readFileSync(jsonPath, 'utf8')
  return JSON.parse(raw) as PresetsManifest
}

/**
 * Write presets.json back to disk with consistent formatting.
 */
export function writePresetsJson(extensionPath: string, data: PresetsManifest): void {
  const presetsDir = getPresetsDir(extensionPath)
  const jsonPath = path.join(presetsDir, 'presets.json')
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 4), 'utf8')
}

/**
 * Check if a file exists.
 */
export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath)
}

/**
 * Copy a file to a destination, creating directories if needed.
 */
export function copyFile(src: string, dest: string): void {
  const dir = path.dirname(dest)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.copyFileSync(src, dest)
}

/**
 * Rename/move a file.
 */
export function renameFile(oldPath: string, newPath: string): void {
  const dir = path.dirname(newPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.renameSync(oldPath, newPath)
}

/**
 * Delete a file if it exists.
 */
export function deleteFile(filePath: string): void {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }
}

/**
 * List files in a directory matching an extension.
 */
export function listFiles(dir: string, ext?: string): string[] {
  if (!fs.existsSync(dir)) return []
  const files = fs.readdirSync(dir)
  if (!ext) return files
  return files.filter((f) => f.endsWith(ext))
}

/**
 * Get file stats (for last modified etc.)
 */
export function getFileStats(filePath: string): { size: number; mtime: string } | null {
  if (!fs.existsSync(filePath)) return null
  const stats = fs.statSync(filePath)
  return { size: stats.size, mtime: stats.mtime.toISOString() }
}

/**
 * Register IPC handlers for file operations.
 */
export function registerFileHandlers(): void {
  ipcMain.handle('file:exists', (_event, filePath: string) => {
    return fileExists(filePath)
  })

  ipcMain.handle('file:stats', (_event, filePath: string) => {
    return getFileStats(filePath)
  })
}
