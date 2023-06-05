const { app, BrowserWindow, Menu, MenuItem, ipcMain, dialog, nativeTheme } = require('electron')
const path = require('path')
const fs = require('fs')
let reg_fileName = /(?!(\\))\w+\.txt$/gi
let currentFilePath = '';

const settingsFilePath = app.getPath('userData') + '/settings.json';
const TempFilePath = app.getPath('userData') + '/temp.txt';

let theme = 'dark';

//450 / 750
const createWindow = () => {
    const win = new BrowserWindow({
        frame: false,
        spellcheck: true,
        width: 800,
        height: 760,
        icon: "./img/icon.png",
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })


    win.webContents.on('context-menu', (event, params) => {
        const menu = new Menu()

        // Add each spelling suggestion
        for (const suggestion of params.dictionarySuggestions) {
            menu.append(new MenuItem({
                label: suggestion,
                click: () => win.webContents.replaceMisspelling(suggestion)
            }))
        }

        // Allow users to add the misspelled word to the dictionary
        if (params.misspelledWord) {
            menu.append(
                new MenuItem({
                    label: 'Add to dictionary',
                    click: () => win.webContents.session.addWordToSpellCheckerDictionary(params.misspelledWord)
                })
            )
        }

        menu.popup()
    })


    win.loadFile('index.html')
    nativeTheme.themeSource = 'dark';
    //win.webContents.openDevTools()
}




function handleSetTitle(event, title) {
    const webContents = event.sender
    const win = BrowserWindow.fromWebContents(webContents)
    win.setTitle(title.toString())
}


//open fil and return its contents and path
function openFile(event) {
    let filePaths = dialog.showOpenDialogSync({
        title: 'Select Text File To Open ...',
        buttonLabel: 'open?',
        properties: [
            'openFile'
        ]
    })
    if (filePaths != undefined) {
        let filePath = filePaths[0];

        let fileName = filePath.match(reg_fileName);

        let fileContents = fs.readFileSync(filePath)
        fileContents = fileContents.toString('utf8')
        console.log("data: " + fileContents)

        return {
            path: filePath,
            contents: fileContents,
            fileName: fileName
        };
    } else {
        return null;
    }
}

function loadSettings() {

    let settings = getSettingsData();
    theme = settings.theme



    
    if(settings.unsavedFilePath != ''){
        console.log('unsaved file path not empty')
        let fileName = settings.unsavedFilePath.match(reg_fileName);
        let fileContents = getTempData();
        // let fileContents = fs.readFileSync(settings.unsavedFilePath)
        // fileContents = fileContents.toString('utf8')
        // console.log("data" + fileContents)

        return {
            path: settings.unsavedFilePath,
            contents: fileContents,
            fileName: fileName,
            theme: settings.theme
        };
    } else {

        console.log('unsaved file path is empty')

        let fileContents = getTempData();

        return {
            path: '',
            contents: fileContents,
            fileName: 'new.txt',
            theme: settings.theme
        };
    }
}

function getSettingsData(){

    if(fs.existsSync(settingsFilePath)) {
        let settings = fs.readFileSync(settingsFilePath)
        settings = JSON.parse(settings.toString('utf8'))
        return settings;

    } else {
        let settings = {
            unsavedFilePath: '',
            theme: 'dark'
        };
        fs.writeFileSync(settingsFilePath, JSON.stringify(settings))
        return settings;
    }
    
}
function getTempData(){

    if(fs.existsSync(TempFilePath)) {
        let fileContents = fs.readFileSync(TempFilePath)
        fileContents = fileContents.toString('utf8')
        return fileContents;

    } else {
        fs.writeFileSync(TempFilePath, "")
        return "";
    }
    
}

function exitProgram(event, data) {
    saveSettings(data);


    const webContents = event.sender
    const win = BrowserWindow.fromWebContents(webContents)
    win.close();
}

function minimizeProgram(event) {

    const webContents = event.sender
    const win = BrowserWindow.fromWebContents(webContents)
    win.minimize();
}

function changeTheme(event, theme) {
    nativeTheme.themeSource = theme
}

function toggleTheme() {

    let newTheme;
    switch (theme) {
        case 'dark':
            newTheme = 'light';
            break;
        case 'light':
            newTheme = 'dark';
            break;
    }
    theme = newTheme;
    console.log(theme);
    nativeTheme.themeSource = theme;
    return theme;
}

function saveSettings(data) {
    let settings = getSettingsData();
    settings.theme = theme;
    
    //if theres no temp saved file
    if(data.path != ''){

        if(!testIfUnsavedChanges(data.path, data.contents)){
            //if no unsaved changes, dont write to temp file or unsavedfilePath
            console.log('no unsaved changes!')

            settings.unsavedFilePath = ''
            fs.writeFileSync(TempFilePath, "")
            fs.writeFileSync(settingsFilePath, JSON.stringify(settings))
            //console.log(settings.unsavedFilePath)
        } else {
            //if there are unsaved changes, write to temp
            console.log('there are unsaved changes!')

            settings.unsavedFilePath = data.path;
            fs.writeFileSync(settingsFilePath, JSON.stringify(settings))
            fs.writeFileSync(TempFilePath, data.contents)
        }
    } else {
        console.log('nothing to check!')
        settings.unsavedFilePath = '';

        fs.writeFileSync(settingsFilePath, JSON.stringify(settings))
        fs.writeFileSync(TempFilePath, data.contents)
    } 
}

function testIfUnsavedChanges(originalFilePath, currentContents){
    let originalContents = fs.readFileSync(originalFilePath)
    originalContents = originalContents.toString('utf8')

    if(originalContents === currentContents){
        return false // no unsaved changes
    } else {
        return true // there are unsaved changes
    }
}


//save file
function saveFile(event, textData) {
    fs.writeFileSync(textData.path, textData.contents)

    let fileName = textData.path.match(reg_fileName);
    
    return {
        path: textData.filePath,
        fileName: fileName
    };
    //handleSetTitle(event, 'bing')
}

function saveFileAs(event, contents) {
    let filePath = dialog.showSaveDialogSync({
        title: 'Select Save Location ...',
        buttonLabel: 'Save As?',
        properties: [
            'openFile'
        ],
        filters: [
            { name: 'Text', extensions: ['txt'] }
        ]
    })
    if (filePath != undefined) {
        let fileName = filePath.match(reg_fileName);

        console.log(filePath);
        fs.writeFileSync(filePath, contents)

        return {
            path: filePath,
            fileName: fileName
        };
    } else {
        return null;
    }
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0)
            createWindow()
    })

    ipcMain.handle('fileOpen', openFile)
    ipcMain.handle('loadSettings', loadSettings)
    ipcMain.handle('fileSaveAs', saveFileAs)
    ipcMain.handle('fileSave', saveFile)
    ipcMain.on('changeTitle', handleSetTitle)

    ipcMain.handle('exit', exitProgram)
    ipcMain.handle('minimize', minimizeProgram)


    ipcMain.handle('toggleTheme', toggleTheme)
    //ipcMain.on('changeTheme', changeTheme)
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})
