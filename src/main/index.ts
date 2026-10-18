import { app, BrowserWindow, ipcMain, clipboard, shell } from 'electron'
import { join } from 'node:path'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

let mainWindow: BrowserWindow | null = null
let cachedDataFilePath: string | null = null

function getDataFilePath(): string {
  if (!cachedDataFilePath) {
    cachedDataFilePath = join(app.getPath('userData'), 'quickdesk-data.json')
  }
  return cachedDataFilePath
}

function ensureDataFile(): void {
  const filePath = getDataFilePath()
  if (!existsSync(filePath)) {
    const initialData = {
      settings: {
        language: 'tr'
      },
      notes: [
        {
          id: 'note_1',
          title: 'Modern QuickDesk\'e Hoş Geldiniz! 🚀',
          content: '# QuickDesk (React + Vite + TypeScript)\n\nEndüstri standardı modern mimari ile yeniden derlendi!\n\n### Özellikler:\n- ⚡ **electron-vite + React 19 + TypeScript**\n- 🎨 **Tailwind CSS v4** ile modern koyu tema\n- 📌 **Always on Top (Pin)** & Kompakt Yüzen Not Modu\n- 🛠️ **JSON Beautify / Minify, Base64, URL & Kasa Araçları**\n- 📋 **Kod Parçacıkları (Snippet Vault)**\n- ⏱️ **Pomodoro Odak Sayacı & Görev Takibi**\n\nİyi çalışmalar!',
          updatedAt: Date.now()
        }
      ],
      activeNoteId: 'note_1',
      snippets: [
        {
          id: 'snip_1',
          title: 'Git: Son Commit\'i Geri Al',
          category: 'Git',
          code: 'git reset --soft HEAD~1'
        },
        {
          id: 'snip_2',
          title: 'Docker: Kullanılmayanları Temizle',
          category: 'Docker',
          code: 'docker system prune -a --volumes'
        },
        {
          id: 'snip_3',
          title: 'Tailwind Flex Center',
          category: 'CSS',
          code: 'display: flex; align-items: center; justify-content: center;'
        }
      ],
      todos: [
        { id: 'todo_1', text: 'QuickDesk React arayüzünü incele', done: true },
        { id: 'todo_2', text: 'Yeni bir kod parçacığı (snippet) ekle', done: false },
        { id: 'todo_3', text: 'Pomodoro ile 25 dakika odaklan', done: false }
      ]
    }

    try {
      writeFileSync(filePath, JSON.stringify(initialData, null, 2), 'utf-8')
    } catch (err) {
      console.error('Error initializing data file:', err)
    }
  }
}

function createWindow(): void {
  const isMac = process.platform === 'darwin'

  mainWindow = new BrowserWindow({
    width: 940,
    height: 680,
    minWidth: 420,
    minHeight: 460,
    backgroundColor: '#0b0f19',
    titleBarStyle: isMac ? 'hiddenInset' : 'default',
    trafficLightPosition: isMac ? { x: 16, y: 16 } : undefined,
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    },
    show: false
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer based on electron-vite cli
  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// App Lifecycle
app.whenReady().then(() => {
  ensureDataFile()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC Handlers
ipcMain.handle('storage:get', async () => {
  try {
    ensureDataFile()
    const raw = readFileSync(getDataFilePath(), 'utf-8')
    return JSON.parse(raw)
  } catch (err) {
    console.error('Failed to read data file:', err)
    return null
  }
})

ipcMain.handle('storage:set', async (_event, data) => {
  try {
    writeFileSync(getDataFilePath(), JSON.stringify(data, null, 2), 'utf-8')
    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return { success: false, error: message }
  }
})

ipcMain.handle('window:toggle-always-on-top', () => {
  if (!mainWindow) return false
  const current = mainWindow.isAlwaysOnTop()
  mainWindow.setAlwaysOnTop(!current, 'floating')
  return !current
})

ipcMain.handle('window:is-always-on-top', () => {
  if (!mainWindow) return false
  return mainWindow.isAlwaysOnTop()
})

let isCompact = false
let previousBounds: Electron.Rectangle | null = null

ipcMain.handle('window:toggle-compact', () => {
  if (!mainWindow) return false
  if (!isCompact) {
    previousBounds = mainWindow.getBounds()
    mainWindow.setBounds({
      width: 420,
      height: 540,
      x: previousBounds.x + (previousBounds.width - 420),
      y: previousBounds.y
    })
    mainWindow.setAlwaysOnTop(true, 'floating')
    isCompact = true
  } else {
    if (previousBounds) {
      mainWindow.setBounds(previousBounds)
    } else {
      mainWindow.setBounds({ width: 940, height: 680 })
    }
    isCompact = false
  }
  return isCompact
})

ipcMain.handle('clipboard:write', (_event, text: string) => {
  clipboard.writeText(text)
  return true
})

ipcMain.handle('clipboard:read', () => {
  return clipboard.readText()
})
