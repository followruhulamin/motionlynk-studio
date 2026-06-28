import { useState, useEffect, useCallback } from 'react'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import KineticManager from './components/kinetic/KineticManager'
import ExtensionManager from './components/extension/ExtensionManager'

export default function App() {
  const [extensionPath, setExtensionPath] = useState<string>(
    () => localStorage.getItem('extensionPath') || ''
  )
  const [activeModule, setActiveModule] = useState<string>('kinetic')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (extensionPath) {
      localStorage.setItem('extensionPath', extensionPath)
    }
  }, [extensionPath])

  const triggerRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  const handlePathChange = (newPath: string) => {
    setExtensionPath(newPath)
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="app-shell">
      <Header />
      <div className="app-body">
        <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} />
        <main className="app-main">
          {activeModule === 'kinetic' && (
            <KineticManager
              key={refreshKey}
              extensionPath={extensionPath}
              onExtensionPathChange={handlePathChange}
              onRefresh={triggerRefresh}
            />
          )}
          {activeModule === 'extension' && (
            <ExtensionManager
              extensionPath={extensionPath}
            />
          )}
        </main>
      </div>
    </div>
  )
}
