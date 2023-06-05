
const text_area = document.getElementById('text-area');
const btn_open = document.getElementById('btn-open');
const btn_save = document.getElementById('btn-save');
const btn_saveas = document.getElementById('btn-saveas');
const btn_new = document.getElementById('btn-new');
const btn_theme = document.getElementById('btn-theme');
const btn_exit = document.getElementById('btn-exit');
const btn_minimize = document.getElementById('btn-minimize');

const link_styles = document.getElementById('styles-mode');
//const title = document.getElementsByTagName('title');
//btn_save.setAttribute('disabled', '')
let currentFilePath = '';




// window.electronAPI.changeTheme((event) => {
//     console.log('boop');
// })

function changeCurrentFilePath(newPath){
  
  if(newPath){
    //btn_save.removeAttribute('disabled')
    //console.log('G newpath is: '+newPath)
  } else {
    //btn_save.setAttribute('disabled', '')
    //console.log('N newpath is: '+newPath)
  }

  currentFilePath = newPath;
}

function changeTheme(theme){
  switch(theme){
    case 'dark':
      link_styles.setAttribute('href', './css/style_mode_dark.css');
    break;
    case 'light':
      link_styles.setAttribute('href', './css/style_mode_light.css');
    break;
  }
}

async function loadSettings() {
  console.log('loading settings');
  const data = await window.electronAPI.loadSettings()
  if(data == null){
    return;
  }
  console.log(data)
  text_area.value = data.contents;
  //console.log('filename is '+ data.fileName)
  //title.innerText = 'dd';

  changeCurrentFilePath(data.path);
  changeTheme(data.theme);

  //console.log('path: '+data.path);

  if(data.path != ''){
    console.log('say unsaved');
    window.electronAPI.changeTitle(data.fileName + ' (unsaved)')
  } else {
    console.log('say normal');
    window.electronAPI.changeTitle(data.fileName)
  }
}

btn_open.addEventListener('click', async () => {
  const data = await window.electronAPI.fileOpen()
  if(data == null){
    return;
  }
  console.log(data)
  text_area.value = data.contents;
  console.log('filename is '+ data.fileName)
  //title.innerText = 'dd';
  changeCurrentFilePath(data.path);
  window.electronAPI.changeTitle(data.fileName)
  //changeTheme('dark');
})


btn_save.addEventListener('click', async () => {

  if(currentFilePath != ''){
    console.log(text_area.value);

    let data = {
      path: currentFilePath,
      contents: text_area.value
    };
    const newData = await window.electronAPI.fileSave(data)
    window.electronAPI.changeTitle(newData.fileName)
  } else {
    saveas(event);
  }
  
})


btn_saveas.addEventListener('click', async () => {

  saveas(event);

  // const data = await window.electronAPI.fileSaveAs(text_area.value)
  // console.log('saved as new!')
  // //title.innerText = newPath.fileName;
  // changeCurrentFilePath(data.path);
  // window.electronAPI.changeTitle(data.fileName)
})

async function saveas(event){
  const data = await window.electronAPI.fileSaveAs(text_area.value)
  if(data == null){
    return;
  }
  console.log('saved as new!')
  //title.innerText = newPath.fileName;
  changeCurrentFilePath(data.path);
  window.electronAPI.changeTitle(data.fileName)
}


btn_new.addEventListener('click', async () => {
  changeCurrentFilePath("");
  text_area.value = "";
  window.electronAPI.changeTitle("new.txt")
})


btn_theme.addEventListener('click', async () => {
  const theme = await window.electronAPI.toggleTheme()
  changeTheme(theme);
})

btn_exit.addEventListener('click', async () => {
  let data = {
    path: currentFilePath,
    contents: text_area.value
  };

  window.electronAPI.exit(data)
})

btn_minimize.addEventListener('click', async () => {

  window.electronAPI.minimize()
})


loadSettings();