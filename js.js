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

  loadSounds();

  var button = document.getElementById(BTN_1_ID);
  button.addEventListener('touchstart', toggleBeingTouched);
  button.addEventListener('touchend', function(e) {
    toggleBeingTouched(e);
    e.preventDefault();
    stateSwitch();
  });
  button.addEventListener('mouseup', stateSwitch);
});

function stateSwitch() {
  switch(timerState) {
    case TIMER_IDLE:
      startPhase1();
      break;
    case TIMER_PHASE_1:
      break;
    case TIMER_PHASE_2:
      break;
    case TIMER_LIMBO:
      startPhase2();
      break;
    case TIMER_DONE:
      break;
    default:
      break;
  }
}

function loadSounds() {
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
  speak(ADD_MORE);
}

/* Start timer for phase 2 */
function startPhase2() {
  setTimeout(finishPhase2, PHASE_2_MS);
  speak(TWO_MIN);
}

/* Coffee is ready. Will reset to idle state after AUTO_RESET_MS */
function finishPhase2() {
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
}

/* Play the sound file buffered at provided key */
function speak(key) {
  var source = audioCtx.createBufferSource();
  source.buffer = soundBuffers[key];
  source.connect(audioCtx.destination);
  source.start(0);
}

/* Pure JS to toggle touch class on button */
function toggleBeingTouched(event) {
  var el = event.target;

  var beingTouchedAlready;
  if (el.classList)
    beingTouchedAlready = el.classList.contains(BEING_TOUCHED);
  else
    beingTouchedAlready = new RegExp('(^| )' + BEING_TOUCHED + '( |$)', 'gi').test(el.className);

  if (!beingTouchedAlready) {
    if (el.classList)
      el.classList.add(BEING_TOUCHED);
    else
      el.className += ' ' + BEING_TOUCHED;
  } else {
    if (el.classList)
      el.classList.remove(BEING_TOUCHED);
    else
      el.className = el.className.replace(new RegExp('(^|\\b)' + BEING_TOUCHED.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
  }
}

/* DOM ready */
function ready(fn) {
  if (document.readyState != 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}
