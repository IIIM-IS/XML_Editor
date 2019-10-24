// https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
var _autosave_documents = false;

function storageAvailable(type) {
  try {
    let storage = window[type],
      x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  }
  catch(e) {
    return e instanceof DOMException && (
      // everything except Firefox
      e.code === 22 ||
      // Firefox
      e.code === 1014 ||
      // test name field too, because code might not be present
      // everything except Firefox
      e.name === 'QuotaExceededError' ||
      // Firefox
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage.length !== 0;
  }
}

function getAvailableFiles() {
  let saved_files_string = localStorage.getItem("saved_files");
  if (!saved_files_string) {
    return [];
  }
  let saved_files = saved_files_string.split(';');

  return saved_files;
}

function saveEditorContentAuto() {
  let speech_id = getSpeechIdFromContent(editor.getValue())
  if (!speech_id) {
    /* don't autosave documents that don't have a name yet */
    /* speech_id = 'unknown_' + new Date().toISOString();  */
    return;
  }
  let identifier = 'auto_' + speech_id;
  saveEditorContentAs(identifier, overwrite=true);
}

function saveEditorContentAs(identifier, overwrite=false) {
  // strip semicolons since we use these for serialization
  identifier = identifier.replace(new RegExp(';', 'g'), '');
  // get saved files list
  let saved_files = localStorage.getItem("saved_files");

  let exists = false;
  if (!saved_files) {
    saved_files = identifier;
  } else {
    // make sure the saved file doesn't exist first.
    // if it does, we will overwrite it -- prompt the user
    let availables = getAvailableFiles();
    for (let i = 0; i < availables.length; ++i) {
      if (identifier == availables[i]) {
        exists = true;
        break;
      }
    }
    if (exists && !overwrite) {
      let ok = confirm("Skjal með þessu nafni er til, vista samt?");
      if (!ok) {
        return;
      }
    }

    if (!exists) {
      saved_files = saved_files + ';' + identifier;
    }
  }

  let content = editor.getValue();

  localStorage.setItem(identifier, content);

  localStorage.setItem("saved_files", saved_files);

  if (!exists) {
    initializeLocalStorage()
  }
}

function removeSavedContent(identifier) {
  // First verify an exact match exists
  let availables = getAvailableFiles();
  let found = "no";
  let saved_files_string = "";
  for (let i = 0; i < availables.length; ++i) {
    if (identifier == availables[i]) {
      found = i;
      break;
    }
  }

  if (found == "no") {
    alert("Fann ekki tiltekna vistun.");
    return;
  }

  availables.splice(found, 1);

  saved_files_string = availables.join(';');

  localStorage.setItem("saved_files", saved_files_string);
  localStorage.removeItem(identifier);
  initializeLocalStorage();
}

function loadSavedContent(identifier) {
  let content = localStorage.getItem(identifier);
  if (!content) {
    alert("Ekkert skjal fannst!");
    return;
  }
  if (editor.getValue()) {
    let ok = confirm("Yfirskrifa núverandi innihald ritils?");
    if (!ok) {
      return;
    }
  }

  setEditorContent(content);
}

function initializeLocalStorage() {
  /*
    <a id='save_file_locally'>vista skjal...</a>
    <div class='separator'/>
    */
  let ad = localStorage.getItem("autosave");
  if (ad == 'true') {
    _autosave_documents = true;
  } else {
    _autosave_documents = false;
  }

  let parent_menu = document.getElementById('local-storage-menu');
  removeAllChildren(parent_menu);

  let file_adder_label = document.createElement("label");
  file_adder_label.setAttribute("for", "file-input");
  file_adder_label.setAttribute("id", "file-input-label");
  file_adder_label.appendChild(document.createTextNode("Hlaða upp skjali"));
  parent_menu.appendChild(file_adder_label);

  let file_adder = document.createElement("input");
  file_adder.setAttribute('type', 'file');
  file_adder.setAttribute('id', 'file-input');
  file_adder.addEventListener('change', function(e) {
    var file = e.target.files[0];
    if (!file) {
      return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
      var contents = e.target.result;
      setEditorContent(contents);
    }
    reader.readAsText(file);
  });
  parent_menu.appendChild(file_adder);

  let file_downloader = document.createElement("a");
  file_downloader.setAttribute("id", "file-download");
  file_downloader.appendChild(document.createTextNode("Hlaða niður skjali"));
  let text = editor.getValue();
  let file = new Blob([text], {type: "text/xml"});
  file_downloader.setAttribute("href", URL.createObjectURL(file));
  file_downloader.setAttribute("download", getSpeechIdFromContent(text));
  parent_menu.appendChild(file_downloader);

  // add the file saver
  let link_node = document.createElement("a");
  link_node.appendChild(document.createTextNode('Vista skjal...'));
  link_node.setAttribute('href', '#');
  link_node.addEventListener('click', function() {
    let speech_id = getSpeechIdFromContent(editor.getValue())
    let identifier = prompt("Vista sem...", speech_id);
    if (identifier) {
      saveEditorContentAs(identifier);
    }
  });
  parent_menu.appendChild(link_node);

  let autosave_pre = 'Virkja';
  if (_autosave_documents) {
    autosave_pre = 'Óvirkja';
  }
  let autosave_text = autosave_pre + ' sjálfvirka skjalavistun';
  link_node = document.createElement("a");
  link_node.appendChild(document.createTextNode(autosave_text));
  link_node.setAttribute('href', '#');
  link_node.addEventListener('click', function() {
    _autosave_documents = !_autosave_documents;
    localStorage.setItem("autosave", _autosave_documents);
    initializeLocalStorage();
  });
  parent_menu.appendChild(link_node);

  let hr = document.createElement('div');
  hr.setAttribute('class', 'separator');
  parent_menu.appendChild(hr)

  let available_files = getAvailableFiles();

  for (let i = 0; i < available_files.length; ++i) {
    // create the entry here
    let link_node = document.createElement("a");
    link_node.appendChild(document.createTextNode(available_files[i]));
    link_node.setAttribute('href', '#');
    link_node.addEventListener('click', function() {
      loadSavedContent(this.textContent);
    });
    parent_menu.appendChild(link_node);
  }

  // if there was no saved content
  if (available_files.length == 0) {
    let link_node = document.createElement("a");
    link_node.appendChild(document.createTextNode("Engin vistuð skjöl."));
    parent_menu.appendChild(link_node);
  }

  hr = document.createElement('div');
  hr.setAttribute('class', 'separator');
  parent_menu.appendChild(hr)

  // add the file remover
  link_node = document.createElement("a");
  link_node.appendChild(document.createTextNode('Eyða vistun...'));
  link_node.setAttribute('href', '#');
  link_node.addEventListener('click', function() {
    let speech_id = getSpeechIdFromContent(editor.getValue())
    let auto_identifier = ''
    let avails = getAvailableFiles();
    for (let i = 0; i < avails.length; ++i) {
      if (avails[i].indexOf(speech_id) != -1) {
        auto_identifier = avails[i];
        break;
      }
    }
    let identifier = prompt("Skrá til að eyða", auto_identifier);
    if (identifier) {
      removeSavedContent(identifier);
    }
  });

  parent_menu.appendChild(link_node);

  /* Add the "clear all saved items" option */

  link_node = document.createElement("a");
  link_node.appendChild(document.createTextNode('Hreinsa vafrageymslu'));
  link_node.setAttribute('href', '#');
  link_node.addEventListener('click', function() {
    let success = confirm("Hreinsa allar stillingar og eyða öllum skjölum úr vafrageymslu?");
    if (success) {
      localStorage.clear();
    }
  });

  parent_menu.appendChild(link_node);

  if (_autosave_documents) {
    editor.on('changes', saveEditorContentAuto);
  } else {
    editor.off('changes', saveEditorContentAuto);
  }
}
