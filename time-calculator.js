var readout = document.querySelector('.readout');
var pReadout = document.querySelector('.plain-readout');
var inputs = [];
var calcObj = {};

function addSubtract(opr) {
  // Remove trailing colons.
  if(readout.innerText[readout.innerText.length - 1] === ':') {
    readout.innerText = readout.innerText.substring(0, readout.innerText.length -1);
  }

  var segments = ['s', 'm', 'h', 'd'];

  input = input.map(function(num) {
    return Number(num);
  });
}


function equals() {
  console.log('equals function');
}

function plainReadout() {
  if(!readout.innerText.length) return pReadout.innerText = '';

  var segments = ['sec', 'min', 'hr', 'day'];
  var input = readout.innerText.split(':').reverse().map(function(num, i) {
    return Number(num) + segments[i];
  });

  pReadout.innerText = input.reverse().join(' ');
}

document.body.addEventListener('click', function(e) {
  if(e.target.className === 'delete') readout.innerText = readout.innerText.substring(0, readout.innerText.length -1);
  if(e.target.className === 'clear') readout.innerText = '';
  if(e.target.className === 'add') addSubtract('add');
  if(e.target.className === 'subtract') addSubtract('subtract');
  if(e.target.className === 'number') {
    if(e.target.id === 'colon') {
      if(readout.innerText.split(':').length === 4) return plainReadout(); // Prevent colons after 4 time sections.
      if(readout.innerText[readout.innerText.length - 1] === ':') return plainReadout(); // Prevent double colons.
      if(!readout.innerText) return plainReadout();
      readout.innerText += ':';
    } else {
      readout.innerText += e.target.innerText;
    }
  }

  plainReadout();
});

document.body.addEventListener('keydown', function(e) {
  // Prevent auto-repeat.
  if(calcObj.key === e.which) return;
  calcObj.key = e.which;

  var num = document.querySelector('#number' + (e.which - 48));

  // Any number key.
  if(num) {
    num.classList.add('active');
    readout.innerText += num.innerText;

  // :
  } else if(e.which === 186 && e.shiftKey) {
    document.querySelector('#colon').classList.add('active');
    if(readout.innerText.split(':').length === 4) return; // Prevent colons after 4 time sections.
    if(readout.innerText[readout.innerText.length - 1] === ':') return; // Prevent double colons.
    if(!readout.innerText) return;
    readout.innerText += ':';

  // Backspace / delete.
  } else if(e.which === 8) {
    document.querySelector('.delete').classList.add('active');
    readout.innerText = readout.innerText.substring(0, readout.innerText.length -1);
    plainReadout();

  // ESC
  } else if(e.which === 27) {
    document.querySelector('.clear').classList.add('active');
    readout.innerText = '';
    plainReadout();
    inputs.length = 0;

  // +
  } else if(e.which === 187 && e.shiftKey) {
    document.querySelector('.add').classList.add('active');
    addSubtract('add');

  // -
  } else if(e.which === 189 && !e.shiftKey) {
    document.querySelector('.subtract').classList.add('active');
    addSubtract('subtract');

  // =
  } else if(e.which === 187 && !e.shiftKey) {
    document.querySelector('.equals').classList.add('active');
    equals();
  }

  if(num) plainReadout();
});

document.body.addEventListener('keyup', function(e) {
  calcObj.key = '';

  var actives = document.querySelectorAll('.active');
  [].map.call(actives, function(el) {
    el.classList.remove('active');
  });
});