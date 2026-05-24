const electronInstaller = require('electron-winstaller');
const path = require('path');

async function buildInstaller() {
  console.log('Building installer...');
  try {
    await electronInstaller.createWindowsInstaller({
      appDirectory: path.join(__dirname, 'dist-electron', 'Pomodoro-win32-x64'),
      outputDirectory: path.join(__dirname, 'dist-electron', 'installer'),
      authors: 'Antigravity',
      exe: 'Pomodoro.exe',
      setupIcon: path.join(__dirname, 'build', 'installer-icon.ico'),
      loadingGif: path.join(__dirname, 'build', 'loading.gif'),
      setupExe: 'PomodoroSetup.exe',
      description: 'A beautiful desktop Pomodoro app',
      noMsi: true,
    });
    console.log('Installer built successfully! You can find it in dist-electron/installer');
  } catch (e) {
    console.log(`No dice: ${e.message}`);
    process.exit(1);
  }
}

buildInstaller();
