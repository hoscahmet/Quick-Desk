import { app, BrowserWindow, ipcMain, clipboard, shell, nativeImage } from 'electron'
import { join } from 'node:path'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import crypto from 'node:crypto'

let mainWindow: BrowserWindow | null = null
let cachedDataFilePath: string | null = null
let currentSessionKey: Buffer | null = null

function getDataFilePath(): string {
  if (!cachedDataFilePath) {
    cachedDataFilePath = join(app.getPath('userData'), 'quickdesk-data.json')
  }
  return cachedDataFilePath
}

interface EncryptedVault {
  isEncrypted: true
  version: number
  kdf: 'pbkdf2-sha512'
  iterations: number
  salt: string
  iv: string
  authTag: string
  ciphertext: string
  settings?: Record<string, unknown>
}

function deriveKey(password: string, salt: Buffer, iterations = 100000): Buffer {
  return crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha512')
}

function encryptVaultData(
  data: unknown,
  key: Buffer
): { iv: string; authTag: string; ciphertext: string } {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const jsonStr = JSON.stringify(data)
  const encrypted = Buffer.concat([cipher.update(jsonStr, 'utf-8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return {
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    ciphertext: encrypted.toString('hex')
  }
}

function decryptVaultData(
  ciphertextHex: string,
  key: Buffer,
  ivHex: string,
  authTagHex: string
): any {
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'))
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'))
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(ciphertextHex, 'hex')),
    decipher.final()
  ])
  return JSON.parse(decrypted.toString('utf-8'))
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
      ],
      accounts: [
        {
          id: 'acc_1',
          title: 'GitHub',
          username: 'developer@example.com',
          password: 'ghp_exampleTokenOrPassword123!',
          category: 'Geliştirici',
          website: 'https://github.com',
          notes: 'Kişisel geliştirici hesabı ve repo erişimi',
          updatedAt: Date.now()
        }
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
  const iconPath = join(__dirname, '../../resources/icon.png')
  const appIcon = existsSync(iconPath) ? nativeImage.createFromPath(iconPath) : undefined

  mainWindow = new BrowserWindow({
    width: 940,
    height: 680,
    minWidth: 420,
    minHeight: 460,
    backgroundColor: '#0b0f19',
    titleBarStyle: isMac ? 'hiddenInset' : 'default',
    trafficLightPosition: isMac ? { x: 16, y: 16 } : undefined,
    icon: appIcon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    },
    show: false
  })

  if (isMac && app.dock && appIcon && !appIcon.isEmpty()) {
    app.dock.setIcon(appIcon)
  }

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

// Storage IPC Handlers
ipcMain.handle('storage:get', async () => {
  try {
    ensureDataFile()
    const raw = readFileSync(getDataFilePath(), 'utf-8')
    const parsed = JSON.parse(raw)

    if (parsed && parsed.isEncrypted) {
      if (!currentSessionKey) {
        return {
          isLocked: true,
          isEncrypted: true,
          settings: parsed.settings || { language: 'tr' }
        }
      }
      try {
        return decryptVaultData(parsed.ciphertext, currentSessionKey, parsed.iv, parsed.authTag)
      } catch {
        return {
          isLocked: true,
          isEncrypted: true,
          settings: parsed.settings || { language: 'tr' }
        }
      }
    }

    return parsed
  } catch (err) {
    console.error('Failed to read data file:', err)
    return null
  }
})

ipcMain.handle('storage:set', async (_event, data) => {
  try {
    const filePath = getDataFilePath()
    let isEncrypted = false
    let existingSalt: string | null = null
    let existingIterations = 100000

    if (existsSync(filePath)) {
      try {
        const raw = readFileSync(filePath, 'utf-8')
        const parsed = JSON.parse(raw)
        if (parsed && parsed.isEncrypted) {
          isEncrypted = true
          existingSalt = parsed.salt
          existingIterations = parsed.iterations || 100000
        }
      } catch {
        // ignore read error
      }
    }

    if (isEncrypted) {
      if (!currentSessionKey) {
        return { success: false, error: 'CANNOT_WRITE_WHILE_LOCKED' }
      }
      const encrypted = encryptVaultData(data, currentSessionKey)
      const vault: EncryptedVault = {
        isEncrypted: true,
        version: 1,
        kdf: 'pbkdf2-sha512',
        iterations: existingIterations,
        salt: existingSalt || crypto.randomBytes(32).toString('hex'),
        iv: encrypted.iv,
        authTag: encrypted.authTag,
        ciphertext: encrypted.ciphertext,
        settings: data.settings || { language: 'tr' }
      }
      writeFileSync(filePath, JSON.stringify(vault, null, 2), 'utf-8')
      return { success: true }
    } else {
      writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
      return { success: true }
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return { success: false, error: message }
  }
})

// Security IPC Handlers
ipcMain.handle('security:status', () => {
  try {
    ensureDataFile()
    const raw = readFileSync(getDataFilePath(), 'utf-8')
    const parsed = JSON.parse(raw)
    const isEncrypted = Boolean(parsed && parsed.isEncrypted)
    return {
      hasPassword: isEncrypted,
      isLocked: isEncrypted ? currentSessionKey === null : false,
      isEncrypted
    }
  } catch (err) {
    console.error('Failed to get security status:', err)
    return { hasPassword: false, isLocked: false, isEncrypted: false }
  }
})

ipcMain.handle('security:unlock', (_event, password: string) => {
  try {
    ensureDataFile()
    const raw = readFileSync(getDataFilePath(), 'utf-8')
    const parsed = JSON.parse(raw) as EncryptedVault

    if (!parsed || !parsed.isEncrypted) {
      return { success: true, data: parsed }
    }

    const salt = Buffer.from(parsed.salt, 'hex')
    const iterations = parsed.iterations || 100000
    const key = deriveKey(password, salt, iterations)

    try {
      const decrypted = decryptVaultData(parsed.ciphertext, key, parsed.iv, parsed.authTag)
      currentSessionKey = key
      return { success: true, data: decrypted }
    } catch {
      return { success: false, error: 'INVALID_PASSWORD' }
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return { success: false, error: msg }
  }
})

ipcMain.handle('security:lock', () => {
  currentSessionKey = null
  return { success: true }
})

ipcMain.handle('security:set-password', (_event, password: string) => {
  try {
    ensureDataFile()
    const filePath = getDataFilePath()
    const raw = readFileSync(filePath, 'utf-8')
    const parsed = JSON.parse(raw)

    if (parsed && parsed.isEncrypted && !currentSessionKey) {
      return { success: false, error: 'LOCKED' }
    }

    let plainData = parsed
    if (parsed && parsed.isEncrypted && currentSessionKey) {
      plainData = decryptVaultData(parsed.ciphertext, currentSessionKey, parsed.iv, parsed.authTag)
    }

    const salt = crypto.randomBytes(32)
    const key = deriveKey(password, salt, 100000)
    const encrypted = encryptVaultData(plainData, key)

    const encryptedVault: EncryptedVault = {
      isEncrypted: true,
      version: 1,
      kdf: 'pbkdf2-sha512',
      iterations: 100000,
      salt: salt.toString('hex'),
      iv: encrypted.iv,
      authTag: encrypted.authTag,
      ciphertext: encrypted.ciphertext,
      settings: plainData.settings || { language: 'tr' }
    }

    writeFileSync(filePath, JSON.stringify(encryptedVault, null, 2), 'utf-8')
    currentSessionKey = key
    return { success: true }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return { success: false, error: msg }
  }
})

ipcMain.handle('security:change-password', (_event, { oldPass, newPass }: { oldPass: string; newPass: string }) => {
  try {
    ensureDataFile()
    const filePath = getDataFilePath()
    const raw = readFileSync(filePath, 'utf-8')
    const parsed = JSON.parse(raw) as EncryptedVault

    if (!parsed || !parsed.isEncrypted) {
      return { success: false, error: 'NOT_ENCRYPTED' }
    }

    const oldSalt = Buffer.from(parsed.salt, 'hex')
    const oldIterations = parsed.iterations || 100000
    const oldKey = deriveKey(oldPass, oldSalt, oldIterations)

    let decrypted: any
    try {
      decrypted = decryptVaultData(parsed.ciphertext, oldKey, parsed.iv, parsed.authTag)
    } catch {
      return { success: false, error: 'INVALID_OLD_PASSWORD' }
    }

    const newSalt = crypto.randomBytes(32)
    const newKey = deriveKey(newPass, newSalt, 100000)
    const encrypted = encryptVaultData(decrypted, newKey)

    const updatedVault: EncryptedVault = {
      isEncrypted: true,
      version: 1,
      kdf: 'pbkdf2-sha512',
      iterations: 100000,
      salt: newSalt.toString('hex'),
      iv: encrypted.iv,
      authTag: encrypted.authTag,
      ciphertext: encrypted.ciphertext,
      settings: decrypted.settings || parsed.settings || { language: 'tr' }
    }

    writeFileSync(filePath, JSON.stringify(updatedVault, null, 2), 'utf-8')
    currentSessionKey = newKey
    return { success: true }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return { success: false, error: msg }
  }
})

ipcMain.handle('security:remove-password', (_event, password: string) => {
  try {
    ensureDataFile()
    const filePath = getDataFilePath()
    const raw = readFileSync(filePath, 'utf-8')
    const parsed = JSON.parse(raw) as EncryptedVault

    if (!parsed || !parsed.isEncrypted) {
      return { success: true }
    }

    const salt = Buffer.from(parsed.salt, 'hex')
    const iterations = parsed.iterations || 100000
    const key = deriveKey(password, salt, iterations)

    let decrypted: any
    try {
      decrypted = decryptVaultData(parsed.ciphertext, key, parsed.iv, parsed.authTag)
    } catch {
      return { success: false, error: 'INVALID_PASSWORD' }
    }

    writeFileSync(filePath, JSON.stringify(decrypted, null, 2), 'utf-8')
    currentSessionKey = null
    return { success: true }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return { success: false, error: msg }
  }
})

// Window & Clipboard Handlers
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
