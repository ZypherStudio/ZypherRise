const { app, BrowserWindow, ipcMain, shell } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');
const https = require('https');
const os = require('os');
const { Client, Authenticator } = require('minecraft-launcher-core');
const msmc = require('msmc');

let mainWindow;

app.name = 'ZypherRise';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1050,
    height: 700,
    title: 'ZypherRise Launcher',
    frame: false,
    transparent: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Allow localhost API calls from renderer
    },
    resizable: false,
    show: false,
    icon: path.join(__dirname, 'assets', 'logo.png')
  });

  mainWindow.loadFile('index.html');

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
  mainWindow.once('ready-to-show', () => {
      mainWindow.show();
      // Uygulama açıldığında güncellemeleri kontrol et
      autoUpdater.checkForUpdatesAndNotify();
  });
}

// Auto-Updater Events
autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update-msg', { type: 'available', text: 'Yeni güncelleme bulundu! İndiriliyor...' });
});

autoUpdater.on('download-progress', (progressObj) => {
    mainWindow.webContents.send('update-progress', progressObj.percent);
});

autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update-msg', { type: 'downloaded', text: 'Güncelleme hazır. Yeniden başlat ve kur.' });
});

autoUpdater.on('error', (err) => {
    console.error('Update Error:', err);
});

app.whenReady().then(() => {
  if (process.platform === 'darwin') {
      app.dock.setIcon(path.join(__dirname, 'assets', 'logo.png'));
  }
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

// APP IPC
ipcMain.on('close-app', () => app.quit());
ipcMain.on('minimize-app', () => mainWindow.minimize());
ipcMain.handle('get-total-mem', () => os.totalmem());
ipcMain.on('restart-app', () => autoUpdater.quitAndInstall());

// MICROSOFT LOGIN
ipcMain.handle('ms-login', async () => {
    try {
        const result = await msmc.fastLaunch("electron", (update) => {
            console.log("MS Auth İlerlemesi:", update);
        });
        if (msmc.errorCheck(result)) {
            return { success: false, error: result.type };
        }
        return { success: true, profile: result.getAuth("minecraft") };
    } catch (e) {
        return { success: false, error: e.message };
    }
});

// MOD UTILITIES
function getModsDir() {
    return path.join(app.getPath('userData'), 'minecraft', 'mods');
}

// MOD INSTALLER
ipcMain.handle('install-mod', async (event, data) => {
    return new Promise((resolve) => {
        const modsDir = getModsDir();
        if (!fs.existsSync(modsDir)) {
            fs.mkdirSync(modsDir, { recursive: true });
        }
        const dest = path.join(modsDir, data.filename);
        const file = fs.createWriteStream(dest);

        const handleResponse = (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                https.get(response.headers.location, handleResponse);
            } else {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve({ success: true, filename: data.filename });
                });
            }
        };

        https.get(data.url, handleResponse).on('error', (err) => {
            fs.unlink(dest, () => {});
            resolve({ success: false, error: err.message });
        });
    });
});

// LIST INSTALLED MODS
ipcMain.handle('list-mods', async () => {
    const modsDir = getModsDir();
    if (!fs.existsSync(modsDir)) return { success: true, mods: [] };
    try {
        const files = fs.readdirSync(modsDir).filter(f => f.endsWith('.jar'));
        const mods = files.map(f => {
            const stat = fs.statSync(path.join(modsDir, f));
            return {
                filename: f,
                size: stat.size,
                date: stat.mtime.toISOString()
            };
        });
        return { success: true, mods };
    } catch(e) {
        return { success: false, mods: [] };
    }
});

// DELETE MOD
ipcMain.handle('delete-mod', async (event, filename) => {
    const modsDir = getModsDir();
    const filePath = path.join(modsDir, filename);
    // Security: only allow deleting .jar files within mods dir
    if (!filePath.startsWith(modsDir) || !filename.endsWith('.jar')) {
        return { success: false, error: 'Geçersiz dosya.' };
    }
    try {
        fs.unlinkSync(filePath);
        return { success: true };
    } catch(e) {
        return { success: false, error: e.message };
    }
});

// GET MODS PATH
ipcMain.handle('get-mods-path', () => {
    return getModsDir();
});

// LAUNCHER LOGIC
const launcher = new Client();

ipcMain.handle('launch-game', async (event, data) => {
  const { username, version, authProfile, memory, javaPath, fpsBoost, autoJoin, engine } = data;
  const launchVersion = version || "1.20.4";

  let auth = authProfile ? authProfile : Authenticator.getAuth(username);

  // FPS Boost Arguments
  let customArgs = [];
  if (fpsBoost) {
      customArgs.push('-XX:+UseG1GC', '-XX:+UnlockExperimentalVMOptions', '-XX:MaxGCPauseMillis=50', '-XX:+DisableExplicitGC', '-XX:TargetSurvivorRatio=90', '-XX:G1NewSizePercent=50', '-XX:G1MaxNewSizePercent=80', '-XX:InitiatingHeapOccupancyPercent=10');
  }
  
  // Auto-Join MCLC format
  let serverConfig = null;
  if(autoJoin) {
      serverConfig = {
          host: "play.zypherrise.com",
          port: 25565
      };
  }

  const opts = {
    authorization: auth,
    root: path.join(app.getPath('userData'), 'minecraft'),
    version: {
      number: launchVersion,
      type: "release"
    },
    memory: {
      max: memory || "4G",
      min: "2G"
    },
    customArgs: customArgs
  };

  // ENGINE LOGIC: Handle Mod Loaders
  if (engine === 'fabric') {
    // MCLC will look for fabric in the versions folder
    // Note: For a production launcher, you'd download the fabric meta first.
    // Here we'll assume the version string or loader logic is handled.
    opts.version.type = "release"; 
    // If you have a specific fabric version format, apply it here.
  } else if (engine === 'forge') {
    // Forge usually requires a specific version or a jar path.
    // For now, we'll flag it as a non-vanilla launch.
    opts.version.type = "release";
  }

  if(serverConfig) {
      opts.server = serverConfig;
  }

  if (javaPath && javaPath.trim() !== '') {
      opts.javaPath = javaPath;
  }

  try {
    launcher.launch(opts);

    launcher.on('debug', (e) => console.log(`[DEBUG] ${e}`));
    launcher.on('data', (e) => console.log(`[DATA] ${e}`));
    launcher.on('progress', (e) => {
      mainWindow.webContents.send('launcher-progress', e);
    });
    launcher.on('close', (e) => {
      mainWindow.webContents.send('launcher-closed', e);
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: error.message };
  }
});
