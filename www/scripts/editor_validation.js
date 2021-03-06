var _validation_disabled = false;

function toggleAutovalidate() {
  _validation_disabled = !_validation_disabled;
}

function validateSuccess() {
  $("#validation-status").text("Löglegt XML");
  $("#validation-status").css('color', 'green');
  $("#validation-error").css('display', 'none');
  // Resize the editor height
  resetEditorHeight();
}

function validateFailure(result) {
  $("#validation-status").text("XML Villa!");
  $("#validation-status").css('color', 'red');
  $("#validation-error").css('display', 'block');
  $("#validation-message").text(result);

  // Resize the editor based on the height of the validation window
  resetEditorHeight();
}


// Validation code taken from W3schools on XML validation
var xt="",h3OK=1
function checkErrorXML(x) {
  xt=""
  h3OK=1
  checkXML(x)
}

function checkXML(n) {
  let l,i,nam
  nam=n.nodeName
  if (nam=="h3") {
    if (h3OK==0) {
      return;
    }
    h3OK=0
  }
  if (nam=="#text") {
    xt=xt + n.nodeValue + "\n"
  }
  l=n.childNodes.length
  for (i=0;i<l;i++) {
    checkXML(n.childNodes[i])
  }
}

function validateXMLW3(content) {
  // code for IE // TODO: Can we remove this? Since IE doesn't seem to work anyway
  if (window.ActiveXObject) {
    var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
    xmlDoc.async=false;
    xmlDoc.loadXML();
    if(xmlDoc.parseError.errorCode!=0) {
      txt="Error Code: " + xmlDoc.parseError.errorCode + "\n";
      txt=txt+"Error Reason: " + xmlDoc.parseError.reason;
      txt=txt+"Error Line: " + xmlDoc.parseError.line;
      return txt;
    } else {
      return "OK";
    }
    // code for Mozilla, Firefox, Opera, etc.
  } else if (document.implementation.createDocument) {
    try {
      let text=content;
      let parser=new DOMParser();
      var xmlDoc=parser.parseFromString(text,"application/xml");
    } catch(err) {
      return "Exception: " + err.message;
    }

    if (xmlDoc.getElementsByTagName("parsererror").length>0) {
      checkErrorXML(xmlDoc.getElementsByTagName("parsererror")[0]);
      return xt;
    } else {
      return "OK";
    }
  }
  return false;
}

var autovalidator = debounce(function() {

  if (_validation_disabled) {
    status_container = $("#validation-status");
    status_container.text("Slökkt er á tæknilegri villuleitun");
    status_container.css('color', 'orangered');
    $("#validation-error").css('display', 'none');
    return;
  }
  let tags = parseTags(); // from editor_tools.js
  if (validateSchema(tags)) {
    /* schema validation failed, don't do any other validation */
    return;
  }
  result = validateXMLW3(editor.getValue());
  if (result == "OK") {
    validateSuccess();
  } else {
    validateFailure(result);
  }
}, 1000);

// Returns true if an error is found
function validateSchema(tags) {
  function isTagOk(tag_label) {
    let meta_char = tag_label[0]
    if (meta_char == '?' || meta_char == '!') {
      // It's a meta tag or a comment, we will allow it
      return true;
    }
    let slash_index = tag_label.indexOf('/')
    if (slash_index > 0) {
      tag_label = tag_label.substr(0, slash_index);
    }
    let found = schema_tags[tag_label];
    if (!found) {
      return false;
    }
    return true;
  }

  function handleTagNotFound(tag) {
    let problem_line = Number(tag.line) + 1;
    validateFailure("Óþekkt tag: <" + tag.tag_label + "> í línu " + problem_line);
  }

  // assumes a schema_tags variable
  if (!schema_tags) {
    return;
  }

  // first prototype: just validate that tags are legal
  for (let i = 0; i < tags.length; ++i) {
    // check the opening tag, 
    // if the opening tags are OK
    // then bad closing tags will not match
    let tag = tags[i].tag_open
    let label = tag.tag_label;
    if (!isTagOk(label)) {
      handleTagNotFound(tag);
      return true;
    }
  }
}

function validateInsertionAtCursor(tag_label) {
  if (_validation_disabled) {
    // validation is not enabled, do not validate here either
    return true;
  }
  let selection = ''
  if (editor.somethingSelected()) {
    selection = editor.getSelection();
  }
  let element = '<' + tag_label + '>' + selection + '</' + tag_label + '>';
  let cursor_loc = editor.getCursor('from');

  // validate the replacement
  let content_before = editor.getValue();

  let cursor_index = editor.getDoc().indexFromPos(cursor_loc);

  let content_after = [content_before.slice(0, cursor_index), element, content_before.slice(cursor_index)].join('');

  let result = validateXMLW3(content_after) == "OK";

  return result;
}
