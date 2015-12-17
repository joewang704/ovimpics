let startTime;
let currentTime = 0;
let timeinterval;

function startTimer() {
  startTime = Date.now();
}

function getTimeRemaining(){
  return {
    milliseconds: (new Date(Date.now() - startTime)).getMilliseconds(),
    seconds: Math.floor(((Date.now() - startTime)/1000) % 60),
  }
}

export function initializeClock(id) {
  startTimer();
  const clock = document.getElementById(id);
  timeinterval = setInterval(function(){
    const t = getTimeRemaining();
    clock.innerHTML = t.seconds + '.' + t.milliseconds;
    if(t.seconds >= 60){
      // end timer
      // TODO: timeout player when too high
      clearInterval(timeinterval);
    }
  }, 60);
}

export function endTimer() {
  clearInterval(timeinterval);
}
