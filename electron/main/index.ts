import {release} from 'node:os'
import {dirname, join} from 'node:path'
import {fileURLToPath} from 'node:url'

import {app, BrowserWindow} from 'electron'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

process.env.DIST_ELECTRON = join(__dirname, '..')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL ? join(process.env.DIST_ELECTRON, '../public') : process.env.DIST
process.env.EXTRA_PATH = process.env.VITE_DEV_SERVER_URL ? join(process.env.DIST_ELECTRON, '../extra') : join(dirname(app.getPath('exe')), '/resources/extra/')

// https://www.electronjs.org/docs/latest/tutorial/security
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

const preload = join(__dirname, '../preload/index.mjs')
const url = process.env.VITE_DEV_SERVER_URL
const indexHtml = join(process.env.DIST, 'index.html')
const lotusIcon_32x32 = join(process.env.VITE_PUBLIC, 'favicon_32x32.ico')

let win: BrowserWindow | null = null

// 禁用 Windows 7 的GPU加速
if (release().startsWith('6.1')) {
  app.disableHardwareAcceleration()
}

// 为 Windows 10+ 通知设置应用程序名称
if (process.platform === 'win32') {
  app.setAppUserModelId(app.getName())
}

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

app.on('second-instance', () => {
  // 当第二个实例被执行并且调用 app.requestSingleInstanceLock() 时
  if (win) {
    win.restore()
    win.focus()
  }
})

app.on('activate', async () => {
  // MacOS: 当应用被激活时发出
  let allWindows = BrowserWindow.getAllWindows()

  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    await createMainWindow()
  }
})

app.on('window-all-closed', () => {
  win = null

  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.whenReady()
  .then(createMainWindow)
  .then(maximize)

async function createMainWindow() {
  win = new BrowserWindow({
    frame: true,
    icon: lotusIcon_32x32,
    width: 800,
    height: 800,
    minWidth: 800,
    minHeight: 800,
    webPreferences: {
      preload
    }
  })

  // 保存主窗口ID
  process.env.MAIN_WINDOW_ID = win.id.toString()

  // electron-vite-vue#298
  if (process.env.VITE_DEV_SERVER_URL) {
    return win.loadURL(url)
    // win.webContents.openDevTools()
  } else {
    return win.loadFile(indexHtml)
  }
}

function maximize() {
  win!.maximize()
  win!.webContents.send('resized', win!.getSize(), true)
}
