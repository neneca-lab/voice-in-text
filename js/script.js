try {
  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  var reconhecimento = new SpeechRecognition();
}
catch(e) {
  console.error(e);
  $('.no-browser-support').show();
  $('.app').hide();
}


var noteTextarea = $('#note-textarea');
var instrucoes = $('#inst-gravacao');
var listaNotas = $('ul#notas');

var noteContent = '';

var notas = getAllNotes();
renderNotes(notas);

// ler nota

let btn = document.querySelector('#read-note-btn')

btn.addEventListener("click" , () => {
  let text = document.querySelector("#note-textarea").value 
  let voz = new SpeechSynthesisUtterance(text)

  voz.lang = 'pt-BR'
  voz.pitch = 1
  voz.volume = 1
  voz.rate = 1

  speechSynthesis.speak(voz)

})


// reconhecimento de voz
reconhecimento.continuous = true;

// toda vez q a API captura uma linha, esse bloco é chamado 
reconhecimento.onresult = function(event) {

  var current = event.resultIndex;

  var transcript = event.results[current][0].transcript;

  var mobileRepeatBug = (current == 1 && transcript == event.results[0][0].transcript);

  if(!mobileRepeatBug) {
    noteContent += transcript;
    noteTextarea.val(noteContent);
  }
};

reconhecimento.onstart = function() { 
  instrucoes.text('Reconhecimento de voz ativado. Tente falar no microfone.');
}

reconhecimento.onspeechend = function() {
  instrucoes.text('Você ficou quieto por um tempo, então o reconhecimento de voz foi desativado.');
}

reconhecimento.onerror = function(event) {
  if(event.error == 'no-speech') {
    instrucoes.text('Nenhuma fala foi detectada. Tente novamente.');  
  };
}



// Botões e entrada do aplicativo 


$('#inicia-reconhecimento').on('click', function(e) {
  if (noteContent.length) {
    noteContent += ' ';
  }
  reconhecimento.start();
});


$('#pausa-reconhecimento').on('click', function(e) {
  reconhecimento.stop();
  instrucoes.text('Reconhecimento de voz pausado');
});
c

$('#read-note-btn').on('click', function(e){
  reconhecimento.stop();

  if(!noteContent.length){
    instrucoes.text('Não foi possível ler a nota, por favor digite algo.');
  }
})

$('#save-note-btn').on('click', function(e) {
  reconhecimento.stop();

  if(!noteContent.length) {
    instrucoes.text('Não foi possível salvar a nota vazia. Adicione uma mensagem à sua nota.');
  }
  else {
    // Salvando a nota.
    saveNote(new Date().toLocaleString(), noteContent);

    // redefinindo as variaveis e atualizando a UI
    noteContent = '';
    renderNotes(getAllNotes());
    noteTextarea.val('');
    instrucoes.text('Nota salva com sucesso.');
  }
      
})


listaNotas.on('click', function(e) {
  e.preventDefault();
  var target = $(e.target);

  // ouça a nota
  if(target.hasClass('listen-note')) {
    var content = target.closest('.note').find('.content').text();
    readOutLoud(content);
  }

  // apaga a nota.
  if(target.hasClass('delete-note')) {
    var dateTime = target.siblings('.date').text();  
    deleteNote(dateTime);
    target.closest('.note').remove();
  }
});




  // Fala
function readOutLoud(message) {
	 var speech = new SpeechSynthesisUtterance();

  // define os atributos de texto para voz.
	speech.text = message;
	speech.volume = 1;
	speech.rate = 1;
	speech.pitch = 1;
  
	window.speechSynthesis.speak(speech);
}  


function renderNotes(notas) {
  var html = '';
  if(notas.length) {
    notas.forEach(function(notas) {
      html+= `<li class="note">
        <p class="header">
          <span class="date">${notas.date}</span>
          <a href="#" class="listen-note" style="color: #4A1AD9;" title="Lista de notas">Ler nota</a>
          <a href="#" class="delete-note" style="color: #4A1AD9;" title="Delete">Apagar</a>
        </p>
        <p class="content">${notas.content}</p>
      </li>`;    
    });
  }
  else {
    html = '<li><p class="content">Você ainda não possui notas</p></li>';
  }
  listaNotas.html(html);
}


function saveNote(dateTime, content) {
  localStorage.setItem('note-' + dateTime, content);
}


function getAllNotes() {
  var notas = [];
  var key;
  for (var i = 0; i < localStorage.length; i++) {
    key = localStorage.key(i);

    if(key.substring(0,5) == 'note-') {
      notas.push({
        date: key.replace('note-',''),
        content: localStorage.getItem(localStorage.key(i))
      });
    } 
  }
  return notas;
}


function deleteNote(dateTime) {
  localStorage.removeItem('note-' + dateTime); 
}

