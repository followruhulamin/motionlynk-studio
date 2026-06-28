import { ipcMain } from 'electron'
import * as fs from 'fs'
import * as path from 'path'

interface ExtensionInfo {
  version: string
  bundleId: string
  bundleName: string
  modules: { id: string; name: string; version: string }[]
}

function readVersion(extensionPath: string): ExtensionInfo {
  const manifestPath = path.join(extensionPath, 'CSXS', 'manifest.xml')
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`manifest.xml not found at ${manifestPath}`)
  }

  const xml = fs.readFileSync(manifestPath, 'utf-8')

  // Extract version from ExtensionBundleVersion attribute
  const versionMatch = xml.match(/ExtensionBundleVersion="([^"]+)"/)
  const bundleIdMatch = xml.match(/ExtensionBundleId="([^"]+)"/)
  const bundleNameMatch = xml.match(/ExtensionBundleName="([^"]+)"/)

  const version = versionMatch?.[1] ?? '0.0.1'
  const bundleId = bundleIdMatch?.[1] ?? ''
  const bundleName = bundleNameMatch?.[1] ?? ''

  // Read module versions
  const modulesDir = path.join(extensionPath, 'modules')
  const modules: ExtensionInfo['modules'] = []

  if (fs.existsSync(modulesDir)) {
    const entries = fs.readdirSync(modulesDir, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      const modJsonPath = path.join(modulesDir, entry.name, 'module.json')
      if (fs.existsSync(modJsonPath)) {
        try {
          const json = JSON.parse(fs.readFileSync(modJsonPath, 'utf-8'))
          modules.push({
            id: json.id ?? entry.name,
            name: json.name ?? entry.name,
            version: json.version ?? '1.0.0',
          })
        } catch {
          // skip malformed
        }
      }
    }
  }

  return { version, bundleId, bundleName, modules }
}

function writeExtensionVersion(extensionPath: string, newVersion: string): void {
  // 1. Update CSXS/manifest.xml
  const manifestPath = path.join(extensionPath, 'CSXS', 'manifest.xml')
  if (fs.existsSync(manifestPath)) {
    let xml = fs.readFileSync(manifestPath, 'utf-8')

    // Update ExtensionBundleVersion attribute
    xml = xml.replace(/ExtensionBundleVersion="[^"]+"/g, `ExtensionBundleVersion="${newVersion}"`)

    // Update all Extension panel Version attributes (but NOT CSXS runtime version or Host version)
    // We target only <Extension Id="..." Version="x.x.x"/> entries
    xml = xml.replace(
      /(<Extension Id="com\.ruhul\.motionlynk[^"]*"\s+Version=")[^"]+(")/g,
      `$1${newVersion}$2`
    )

    fs.writeFileSync(manifestPath, xml, 'utf-8')
  }

  // 2. Update host/index.html — the v0.0.1 version span
  const indexHtmlPath = path.join(extensionPath, 'host', 'index.html')
  if (fs.existsSync(indexHtmlPath)) {
    let html = fs.readFileSync(indexHtmlPath, 'utf-8')
    // Replace the version in the sidebar-version span
    html = html.replace(
      /(<span[^>]*id="sidebar-version"[^>]*>)v[\d.]+(<\/span>)/,
      `$1v${newVersion}$2`
    )
    // Also try generic pattern v\d+.\d+.\d+ near version spans
    html = html.replace(
      /(<span[^>]*class="sidebar-version"[^>]*>)v[\d.]+(<\/span>)/,
      `$1v${newVersion}$2`
    )
    fs.writeFileSync(indexHtmlPath, html, 'utf-8')
  }
}

function writeModuleVersion(extensionPath: string, moduleId: string, newVersion: string): void {
  const modulesDir = path.join(extensionPath, 'modules')
  const modJsonPath = path.join(modulesDir, moduleId, 'module.json')
  if (fs.existsSync(modJsonPath)) {
    try {
      const json = JSON.parse(fs.readFileSync(modJsonPath, 'utf-8'))
      json.version = newVersion
      fs.writeFileSync(modJsonPath, JSON.stringify(json, null, 2), 'utf-8')
    } catch (err) {
      throw new Error(`Failed to write module.json for ${moduleId}: ${(err as Error).message}`)
    }
  } else {
    throw new Error(`module.json not found for module "${moduleId}"`)
  }
}

export function registerExtensionHandlers(): void {
  ipcMain.handle('extension:getInfo', async (_event, extensionPath: string) => {
    return readVersion(extensionPath)
  })

  ipcMain.handle('extension:setVersion', async (_event, extensionPath: string, newVersion: string) => {
    // Validate semver-like pattern (1-3 numbers with dots allowed)
    if (!/^\d+(\.\d+){0,2}$/.test(newVersion)) {
      throw new Error('Invalid version format. Use X, X.X, or X.X.X (e.g. 1.2.3)')
    }
    writeExtensionVersion(extensionPath, newVersion)
    return readVersion(extensionPath)
  })

  ipcMain.handle(
    'extension:setModuleVersion',
    async (_event, extensionPath: string, moduleId: string, newVersion: string) => {
      // Validate semver-like pattern (1-3 numbers with dots allowed)
      if (!/^\d+(\.\d+){0,2}$/.test(newVersion)) {
        throw new Error('Invalid version format. Use X, X.X, or X.X.X (e.g. 1.2.3)')
      }
      writeModuleVersion(extensionPath, moduleId, newVersion)
      return readVersion(extensionPath)
    }
  )
}
