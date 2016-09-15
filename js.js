/* COFFEE TIMER */

/* constants */
var
  BTN_1_ID = 'btn-1',
  BEING_TOUCHED = 'being-touched',

  TIMER_IDLE = 0,
  TIMER_PHASE_1 = 1,
  TIMER_PHASE_2 = 2,
  TIMER_LIMBO = 3,
  TIMER_DONE = 4,

  PHASE_1_MS = 2 * 60 * 1000,
  PHASE_2_MS = 2 * 60 * 1000,
  AUTO_RESET_MS = 10 * 1000;

/* sound data */
var
  TWO_MIN = 'twominutes',
  ADD_MORE = 'addmorewater',
  READY = 'coffeeready';

var soundUrls = {
  'twominutes': 'audio/twominutesandcounting.mp3',
  'addmorewater': 'audio/addmorewater.mp3',
  'coffeeready': 'audio/coffeeready.mp3'
};

var
  twoMinutesBuffer = null, addWaterBuffer = null, coffeeReadyBuffer = null,
  soundBuffers = {
    'twominutes': twoMinutesBuffer,
    'addmorewater': addWaterBuffer,
    'coffeeready': coffeeReadyBuffer
  };

/* variables */
var
  timerState = TIMER_IDLE,
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

ready(function() {

  /* Load the sound files */
  Object.keys(soundUrls).forEach(function(key) {
    var request = new XMLHttpRequest(), url = soundUrls[key];
    request.open('GET', url);
    request.responseType = 'arraybuffer';
    // Decode asynchronously
    request.onload = function() {
      audioCtx.decodeAudioData(request.response, function(buffer) {
        soundBuffers[key] = buffer;
      }, function() {
        console.log('error loading ' + url);
      });
    };
    request.send();
  });

  /* Set up button listeners */
  var button = document.getElementById(BTN_1_ID);
  button.addEventListener('touchstart', toggleBeingTouched);
  button.addEventListener('touchend', function(e) {
    toggleBeingTouched(e);
    e.preventDefault();
    stateSwitch();
  });
  button.addEventListener('mouseup', stateSwitch);

  /* Listen to document touchstart to unlock audio context on iOS */
  document.addEventListener('touchstart', function() {
    var buffer = myContext.createBuffer(1, 1, 22050);
    var source = myContext.createBufferSource();
    source.buffer = buffer;
    source.connect(myContext.destination);
    source.noteOn(0);

  }, false);
});

function stateSwitch() {
  switch(timerState) {
    case TIMER_IDLE:
      startPhase1();
      break;
    case TIMER_PHASE_1:break;
    case TIMER_PHASE_2:break;
    case TIMER_LIMBO:
      startPhase2();
      break;
    case TIMER_DONE:break;
    default:break;
  }
}

/* Start timer for phase 1 */
function startPhase1() {
  setTimeout(finishPhase1, PHASE_1_MS);
  timerState = TIMER_PHASE_1;
  speak(TWO_MIN);
}

/* Go into limbo state until user presses the button again */
function finishPhase1() {
  timerState = TIMER_LIMBO;
  blink();
  speak(ADD_MORE);
}

/* Start timer for phase 2 */
function startPhase2() {
  setTimeout(finishPhase2, PHASE_2_MS);
  stopBlink();
  speak(TWO_MIN);
}

/* Coffee is ready. Will reset to idle state after AUTO_RESET_MS */
function finishPhase2() {
  timerState = TIMER_DONE;
  addClass(document.body, 'warmblue');
  speak(READY);
  setTimeout(function() {
    if (timerState != TIMER_IDLE) {
      reset();
    }
  }, AUTO_RESET_MS);
}

/* Become idle */
function reset() {
  timerState = TIMER_IDLE;
  removeClass(document.body, 'blinking');
  removeClass(document.body, 'warmblue');
}

/* Play the sound file buffered at provided key */
function speak(key) {
  var source = audioCtx.createBufferSource();
  source.buffer = soundBuffers[key];
  source.connect(audioCtx.destination);
  source.start(0);
}

/* Toggle touch class on button */
function toggleBeingTouched(event) {
  var el = event.target;
  toggleClass(el, BEING_TOUCHED);
}

/* Blink background */
function blink() {
  addClass(document.body, 'blinking');
}

function stopBlink() {
  removeClass(document.body, 'blinking');
}


/* Pure JS helpers */

function ready(fn) {
  if (document.readyState != 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

function hasClass(el, cls) {
  if (el.classList)
    return el.classList.contains(cls);
  else
    return new RegExp('(^| )' + cls + '( |$)', 'gi').test(el.className);
}

function addClass(el, cls) {
  if (el.classList)
    el.classList.add(cls);
  else
    el.className += ' ' + cls;
}

function removeClass(el, cls) {
  if (el.classList)
    el.classList.remove(cls);
  else
    el.className = el.className.replace(new RegExp('(^|\\b)' + cls.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
}

function toggleClass(el, cls) {
  if (hasClass(el, cls)) {
    removeClass(el, cls);
  } else {
    addClass(el, cls);
  }
}