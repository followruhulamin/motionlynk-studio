import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { existsSync } from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { registerPresetHandlers } from './services/presetService'
import { registerCategoryHandlers } from './services/categoryService'
import { registerValidationHandlers } from './services/validationService'
import { registerFileHandlers } from './services/fileService'
import { registerExtensionHandlers } from './services/extensionService'
import { registerExpoHandlers } from './services/expoService'

// Resolve icon path correctly for both dev and production.
// In production, process.resourcesPath points to Contents/Resources (outside app.asar).
// In dev, fall back to the local resources/ folder.
function resolveIcon(): string | undefined {
  if (is.dev) {
    const devIcon = join(__dirname, '../../resources/icon.png')
    return existsSync(devIcon) ? devIcon : undefined
  }
  const prodIcon = join(process.resourcesPath, 'resources', 'icon.png')
  return existsSync(prodIcon) ? prodIcon : undefined
}

function createWindow(): void {
  const resolvedIcon = resolveIcon()
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    show: false,
    backgroundColor: '#0d0d11',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 12, y: 10 },
    ...(resolvedIcon ? { icon: resolvedIcon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.setName('MotionLynk Studio')
if (process.platform === 'darwin') {
  const dockIcon = resolveIcon()
  if (dockIcon) app.dock.setIcon(dockIcon)
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.motionlynk.studio')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Register all IPC handlers
  registerFileHandlers()
  registerPresetHandlers()
  registerCategoryHandlers()
  registerValidationHandlers()
  registerExtensionHandlers()
  registerExpoHandlers()

  // Extension path selector
  ipcMain.handle('dialog:selectFolder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: 'Select MotionLynk Extension Folder'
    })
    if (result.canceled) return null
    return result.filePaths[0]
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
