function timeCalculator() {
  var readout = document.querySelector('.readout');
  var pReadout = document.querySelector('.plain-readout');
  var calcContainer = document.querySelector('.calc-container');
  var nums = [];

  generateNumbers(); // Generates the page's number-filled background.


  ///////////////////////////
  // CALCULATOR OPERATIONS //
  ///////////////////////////

  function operate(opr) {
    var segments = ['s', 'm', 'h', 'd'];
    var input = readout.textContent;
    if(!input) return; // Do nothing for blank readouts.
    if(input[input.length - 1] === ':') input = input.substring(0, input.length -1); // Remove trailing colons.
    if(nums.complete && opr === '=') return;
    if(nums.complete) nums = []; // Reset for operators after calculation.

    // Convert user input into an array of numbers.
    function toNumber(num) { return Number(num); }
    input = input.split(':').reverse().map(toNumber);

    // Convert input to a total of seconds.
    var seconds = null;
    var values = [1, 60, 3600, 86400];
    for(var i = 0; i < input.length; i++) {
      seconds += input[i] * values[i];
    }

    if(nums.operating) {
      if(opr === '=') {
        if(nums.length < 4) return;
        nums.pop();
        return equals();
      }

      nums.pop();
      return nums.push(opr);
    } else if(opr === '=') {
      nums.push(seconds);
      return equals();
    }

    nums.operating = true;
    nums.push(seconds); // Number.
    nums.push(opr); // Operator.
  }

  function equals() {
    var segments = ['s', 'm', 'h', 'd'];
    var total = {s: null, m: null, h: null, d: null};
    var seconds = null;
    nums.complete = true;

    // Remove trailing operator.
    var last = nums[nums.length - 1];
    if(last === '+' || last === '-') nums.pop();

    // Convert number to be subtracted to negatives
    // and total up the numbers.
    function toNegatives(num, i) {
      if(Number(num)) {
        nums[i - 1] === '-' ? seconds -= num : seconds += num;
      }
    }
    nums.map(toNegatives);

    segments.reverse(); // Order necessary for convertSum below.

    // Convert lump-sum seconds to d:h:m:s format.
    function convertSum(num, i) {
      var l = segments[i];

      if(Math.abs(seconds) >= num) { // Math.abs() necessary for negative times.
        total[l] = Math.floor(seconds / num);
        seconds %= num;
      } else {
        if(l === 'd') return total[l] = null;
        total[segments[i - 1]] === null ? total[l] = null : total[l] = 0;
      }
    }
    [86400, 3600, 60].map(convertSum);
    // |      |    |
    // d      h    m --> in seconds.
    total.s = seconds;

    // Display answer.
    readout.textContent = '';
    function displayAnswer(seg) { if(total[seg] !== null) readout.textContent += total[seg] + ':'; }
    segments.map(displayAnswer);
    readout.textContent = readout.textContent.slice(0, -1);
    plainReadout();
  }

  function plainReadout() {
    if(!readout.textContent.length) return pReadout.textContent = '';

    var segments = ['sec', 'min', 'hr', 'day'];
    function addSegments(num, i) { return Number(num) + segments[i]; }
    var input = readout.textContent.split(':').reverse().map(addSegments);

    pReadout.textContent = input.reverse().join(' ');
  }

  function reset() {
    nums = [];
    readout.textContent = '';
    pReadout.textContent = '';
  }

  function clearActives() {
    var actives = calcContainer.querySelectorAll('.active');
    function byeActive(el) { el.classList.remove('active'); }
    [].map.call(actives, byeActive); // Call .map on array-like object 'actives'.
  }


  ///////////
  // MOUSE //
  ///////////

  // CLICK
  document.body.addEventListener('click', click);
  function click(e) {
    var classes = e.target.classList;
    var id = e.target.id;

    // Untrack keypress button.
    if(classes.contains('button')) nums.button = false;

    // If following an completed calculation...
    if(nums.complete) {
      if(id === 'colon' || id === 'delete' || id === 'equals') return;
      if(classes.contains('number')) reset();
    }

    // If we're expecting a number after an operator.
    if(nums.operating) {
      if(id === 'colon' || id === 'delete') return;
      if(classes.contains('number')) readout.textContent = '';
    }

    // CLR
    if(id === 'clear') reset();

    // DEL
    if(id === 'delete') readout.textContent = readout.textContent.substring(0, readout.textContent.length -1);

    // + | - | =
    if(id === 'add' || id === 'subtract' || id === 'equals') operate(e.target.textContent);

    // :
    if(id === 'colon') {
      if(readout.textContent.split(':').length === 4) return plainReadout(); // Prevent colons after 4 time sections.
      if(readout.textContent[readout.textContent.length - 1] === ':') return plainReadout(); // Prevent double colons.
      if(!readout.textContent) return plainReadout();
      readout.textContent += ':';
    }

    // Numbers.
    if(classes.contains('number')) {
      nums.operating = false;
      readout.textContent += e.target.textContent;
    }

    plainReadout();
  }

  // MOUSEDOWN
  document.body.addEventListener('mousedown', mousedown);
  function mousedown(e) {
    var classes = e.target.classList;
    clearActives();
    if(classes.contains('button')) classes.add('active');
  }

  // MOUSEUP
  document.body.addEventListener('mouseup', mouseup);
  function mouseup(e) {
    var classes = e.target.classList;
    clearActives();
    if(classes.contains('active')) classes.remove('active');
  }


  //////////////
  // KEYBOARD //
  //////////////

  // KEYDOWN
  document.body.addEventListener('keydown', keydown);
  function keydown(e) {
    // Prevent auto-repeat, allow for delete key.
    if(nums.button === e.which && e.which !== 8) return;
    nums.button = e.which;

    // After a calculation, prevent these keypresses:
    // :, backspace / delete, =, enter.
    if(nums.complete) {
      var badKey = [186, 8, 187, 13].some(function(n) {
        if(e.which === 187 && e.shiftKey) return false; // Allow '+'.
        return n === e.which;
      });
      if(badKey) return;
    }

    var num = calcContainer.querySelector('.number' + (e.which - 48));

    // Any number key.
    if(num) {
      // If we're expecting a number after an operator.
      if(nums.operating) {
        nums.operating = false;
        readout.textContent = '';
      }

      if(nums.complete) {
        nums = [];
        readout.textContent = '';
      }

      // Normal number-press behavior.
      num.classList.add('active');
      readout.textContent += num.textContent;
      plainReadout();

    // :
    } else if(e.which === 186 && e.shiftKey) {
      calcContainer.querySelector('#colon').classList.add('active');

      if(nums.operating) return; // Do nothing if operating.
      if(!readout.textContent) return; // Do nothing for blank readout.
      if(readout.textContent.split(':').length === 4) return; // Prevent colons after 4 time sections.
      if(readout.textContent[readout.textContent.length - 1] === ':') return; // Prevent double colons.

      readout.textContent += ':';

    // Backspace / delete.
    } else if(e.which === 8) {
      calcContainer.querySelector('#delete').classList.add('active');

      if(nums.operating) return; // Do nothing if operating.
      readout.textContent = readout.textContent.split('').slice(0, -1).join('');
      plainReadout();

    // ESC
    } else if(e.which === 27) {
      calcContainer.querySelector('#clear').classList.add('active');
      reset();

    // +
    } else if(e.which === 187 && e.shiftKey) {
      calcContainer.querySelector('#add').classList.add('active');
      operate('+');

    // -
    } else if(e.which === 189 && !e.shiftKey) {
      calcContainer.querySelector('#subtract').classList.add('active');
      operate('-');

    // = | enter
    } else if((e.which === 187 && !e.shiftKey) || e.which === 13) {
      calcContainer.querySelector('#equals').classList.add('active');
      operate('=');
    }
  }

  // KEYUP
  document.body.addEventListener('keyup', keyup);
  function keyup() {
    clearActives();
    nums.button = false;
  }


  /////////////////////
  // PAGE BACKGROUND //
  /////////////////////

  function randomNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  function generateNumbers() {
    for(var i = 0; i < 50; i ++) {
      var div = document.createElement('div');
      div.className = 'random';
      div.textContent = randomNum(1, 50);
      div.style.top = randomNum(1, 100) + '%';
      div.style.left = randomNum(1, 100) + '%';
      div.style.fontSize = randomNum(3, 20) + 'vw';
      div.style.transform = 'rotate(' + randomNum(-45, 45) + 'deg)'

      document.querySelector('.randoms').appendChild(div);
    }
  }


  //////////////////////
  // REMOVE LISTENERS //
  //////////////////////

  document.body.addEventListener('killTimeCalc', killCalcListeners);
  function killCalcListeners(e) {
    document.body.removeEventListener(e.type, killCalcListeners);

    ['click', 'mousedown', 'mouseup', 'keydown', 'keyup'].map(function(event) {
      document.body.removeEventListener(event, eval(event));
    });
  }
}
