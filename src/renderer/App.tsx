import { useState, useEffect } from 'react'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import KineticManager from './components/kinetic/KineticManager'
import ExtensionManager from './components/extension/ExtensionManager'
import ExpoManager from './components/expo/ExpoManager'

export default function App() {
  const [extensionPath, setExtensionPath] = useState<string>(
    () => localStorage.getItem('extensionPath') || ''
  )
  const [activeModule, setActiveModule] = useState<string>(() => {
    return localStorage.getItem('extensionPath') ? 'kinetic' : 'extension'
  })
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (extensionPath) {
      localStorage.setItem('extensionPath', extensionPath)
    }
  }, [extensionPath])


  const handlePathChange = (newPath: string) => {
    setExtensionPath(newPath)
    if (!newPath) {
      setActiveModule('extension')
    }
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="app-shell">
      <Header />
      <div className="app-body">
        <Sidebar 
          activeModule={activeModule} 
          onModuleChange={setActiveModule} 
          hasExtensionPath={!!extensionPath}
        />
        <main className="app-main">
          {activeModule === 'kinetic' && (
            <KineticManager
              key={refreshKey}
              extensionPath={extensionPath}
              onExtensionPathChange={handlePathChange}
            />
          )}
          {activeModule === 'extension' && (
            <ExtensionManager
              extensionPath={extensionPath}
              onExtensionPathChange={handlePathChange}
            />
          )}
          {activeModule === 'expo' && (
            <ExpoManager
              extensionPath={extensionPath}
            />
          )}
        </main>
      </div>
    </div>
  )
}
