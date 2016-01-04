var readout = document.querySelector('.readout');
var pReadout = document.querySelector('.plain-readout');
var result = {s: 0, m: 0, h: 0, d: 0, times: 0};

function operate(opr) {
  // Remove trailing colons.
  if(readout.textContent[readout.textContent.length - 1] === ':') {
    readout.textContent = readout.textContent.substring(0, readout.textContent.length -1);
  }

  // Prevent consecutive operators.
  if(result.operating) return result.operator = opr;

  var numbers = readout.textContent.split(':');
  var segments = ['s', 'm', 'h', 'd'].slice(0, numbers.length).reverse();
  var one = result.operator === 'add' || !result.times ? 1 : -1;

  // Create an object representing the users input:
  // ex: {d: 1, h: 16:, m: 7, s: 32}
  console.log('before:',result);
  numbers.map(function(num, i) {
    result[segments[i]] += Number(num) * one;
  });
  console.log('after:',result);

  // Equals:
  if(opr === 'equals') return equals();

  result.operating = true;
  result.operator = opr;
  result.times++;
}

function equals() {
  result = {s: 0, m: 0, h: 0, d: 0, times: 0};
  readout.textContent = '';
  var segments = ['d', 'h', 'm', 's'];

  for(i in segments) {
    if(result[segments[i]] > 0) readout.textContent += result[segments[i]];
  }

  result.equals = true;
}

function plainReadout() {
  if(!readout.textContent.length) return pReadout.textContent = '';

  var segments = ['sec', 'min', 'hr', 'day'];
  var input = readout.textContent.split(':').reverse().map(function(num, i) {
    return Number(num) + segments[i];
  });

  pReadout.textContent = input.reverse().join(' ');
}

function reset(num) {
  console.log('reset');
  readout.textContent = '';
  plainReadout();
  result = {s: 0, m: 0, h: 0, d: 0, times: 0};
}

function clearActives() {
  var actives = document.querySelectorAll('.active');
  [].map.call(actives, function(el) {
    el.classList.remove('active');
  });
}


///////////
// MOUSE //
///////////

// CLICK
document.body.addEventListener('click', function(e) {
  var el = e.target;

  // Untrack keypress button.
  if(el.classList.contains('button')) result.button = '';

  // Reset the calculator if following an equals.
  if(result.equals) {
    if(el.id === 'colon' || el.id === 'delete' || el.id === 'equals') return;
    if(el.classList.contains('number')) reset();
  }

  // If we're expecting a number after an operator.
  if(result.operating) {
    if(el.id === 'colon' || el.id === 'delete') return;
    if(el.classList.contains('number')) readout.textContent = '';
  }

  // Reset the calculator.
  if(el.id === 'clear') reset();

  // Remove a single character from the readout.
  if(el.id === 'delete') readout.textContent = readout.textContent.substring(0, readout.textContent.length -1);

  // Perform a math operation.
  if(el.id === 'add' || el.id === 'subtract') operate(el.id);

  // Calculate an answer.
  if(el.id === 'equals') operate('equals');

  // Colon logic.
  if(el.id === 'colon') {
    if(readout.textContent.split(':').length === 4) return plainReadout(); // Prevent colons after 4 time sections.
    if(readout.textContent[readout.textContent.length - 1] === ':') return plainReadout(); // Prevent double colons.
    if(!readout.textContent) return plainReadout();
    readout.textContent += ':';
  }

  // Number button logic.
  if(el.classList.contains('number')) {
    result.operating = '';
    readout.textContent += el.textContent;
  }

  plainReadout();
});

// MOUSEDOWN
document.body.addEventListener('mousedown', function(e) {
  clearActives();
  if(e.target.classList.contains('button')) e.target.classList.add('active');
});

// MOUSEUP
document.body.addEventListener('mouseup', function(e) {
  clearActives();
  if(e.target.classList.contains('active')) e.target.classList.remove('active');
});


//////////////
// KEYBOARD //
//////////////

// KEYDOWN
document.body.addEventListener('keydown', function(e) {
  // Prevent auto-repeat, allow for delete key.
  if(result.button === e.which && e.which !== 8) return;
  result.button = e.which;

  var num = document.querySelector('#number' + (e.which - 48));

  // Any number key.
  if(num) {

    // If we're expecting a number after an operator.
    if(result.operator) {
      result.operator = '';
      readout.textContent = '';
    }

    // Normal number-press behavior.
    num.classList.add('active');
    readout.textContent += num.textContent;
    plainReadout();

  // :
  } else if(e.which === 186 && e.shiftKey) {
    document.querySelector('#colon').classList.add('active');

    if(result.operator) return; // Do nothing if operating.
    if(!readout.textContent) return;
    if(readout.textContent.split(':').length === 4) return; // Prevent colons after 4 time sections.
    if(readout.textContent[readout.textContent.length - 1] === ':') return; // Prevent double colons.
    readout.textContent += ':';

  // Backspace / delete.
  } else if(e.which === 8) {
    document.querySelector('#delete').classList.add('active');

    if(result.operator) return; // Do nothing if operating.
    readout.textContent = readout.textContent.substring(0, readout.textContent.length -1);
    plainReadout();

  // ESC
  } else if(e.which === 27) {
    document.querySelector('#clear').classList.add('active');
    reset();

  // +
  } else if(e.which === 187 && e.shiftKey) {
    document.querySelector('#add').classList.add('active');
    operate('add');

  // -
  } else if(e.which === 189 && !e.shiftKey) {
    document.querySelector('#subtract').classList.add('active');
    operate('subtract');

  // =
  } else if(e.which === 187 && !e.shiftKey) {
    document.querySelector('#equals').classList.add('active');
    equals();
  }
});

// KEYUP
document.body.addEventListener('keyup', function(e) {
  clearActives();
  result.button = '';
});