function randomNum(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

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