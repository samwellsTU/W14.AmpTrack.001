const myCtx = new AudioContext();
const analyser = myCtx.createAnalyser();
analyser.fftSize = 1024;

const saw = myCtx.createOscillator();
saw.type = "sawtooth";
saw.frequency.value = 100;

const filter = myCtx.createBiquadFilter();
filter.type = "lowpass";
filter.q = 50;
filter.frequency.value = 100;

saw.connect(filter);
filter.connect(myCtx.destination);

document.getElementById("start").addEventListener("click", async () => {
  const micInput = await navigator.mediaDevices.getUserMedia({
    audio: true,
  });
  myCtx.resume();
  saw.start();
});
