function createSymbolInserter(container_id, symbols) {

  let container = document.createElement('div');
  container.setAttribute('id', container_id);
  container.setAttribute('style', 'border: 1px teal dotted;');
  let main_symbol_container = document.getElementById('symbol-inserter-container');
  main_symbol_container.appendChild(container);
  // create buttons for each symbol
  for (let i = 0; i < symbols.length; ++i) {
    let btn = document.createElement('button');
    btn.appendChild(document.createTextNode(symbols[i]));
    btn.setAttribute('class', 'insert-symbol button');
    btn.addEventListener('click', function() {
      insertElementAtCursor(this.textContent, 1);
    });
    container.appendChild(btn);
  }

  return container;
}

function createPhonemeInserter(parent_name) {
//symbols=" ɣ ;ɲ̊ ;ɪː ;a ;aː ;ai ;aiː ;au ;auː ;c ;cʰ ;ç ;ð ;ɛ ;ɛː ;ei ;eiː ;f ;h ;i ;ʏi ;iː ;j ;k ;kʰ ;l ;l̥ ;m ;m̥ ;n ;n̥ ;ŋ ;ŋ̊ ;ɔ ;ɔː ;œ ;œː ;œy ;œyː ;ɔi ;ou ;ouː ;p ;pʰ ;r ;r̥ ;s ;t ;tʰ ;u ;uː ;v ;x ;θ ".split(";");
  symbols="ɣ ;ɪ ;ɲ ;ʏ ;ɲ̊ ;ɪː ;ʏː ;a ;aː ;ai ;aiː ;au ;auː ;c ;cʰ ;ç ;ð ;ɛ ;ɛː ;ei ;eiː ;f ;h ;i ;ʏi ;iː ;j ;k ;kʰ ;l ;l̥ ;m ;m̥ ;n ;n̥ ;ŋ ;ŋ̊ ;ɔ ;ɔː ;œ ;œː ;œy ;œyː ;ɔi ;ou ;ouː ;p ;pʰ ;r ;r̥ ;s ;t ;tʰ ;u ;uː ;v ;x ;θ ".split(";");

 
  return createSymbolInserter(parent_name, symbols);
}

function createSpecialCharacterInserter(parent_name) {

  let cont_upper = 'special-characters-inserter-uppercase';
  let cont_lower = 'special-characters-inserter-lowercase';

  let symbols_upper = "ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÚÛÜÙÝßÞ".split("");
  let symbols_lower = "àáâãäåæçèéêëìíîïðñòóôõöøúûüùýÿþ".split("");

  let parent_container = document.getElementById(parent_name);
  let lower = createSymbolInserter(cont_upper, symbols_upper);
  let upper = createSymbolInserter(cont_lower, symbols_lower);
  parent_container.appendChild(upper);
  parent_container.appendChild(lower);
}
