const myCtx = new AudioContext();
const analyser = myCtx.createAnalyser();
analyser.fftSize = 1024;

const saw = myCtx.createOscillator();
saw.type = "sawtooth";
saw.frequency.value = 100;

const filter = myCtx.createBiquadFilter();
filter.type = "lowpass";
filter.q = 100;
filter.frequency.value = 100;

saw.connect(filter);
filter.connect(myCtx.destination);

const rms = function (sampleArray) {
  let sum = 0;
  sampleArray.forEach((sampleAmp) => {
    sum += sampleAmp * sampleAmp;
  });
  let mean = sum / sampleArray.length;
  return Math.sqrt(mean);
};

let runningAverage = new Array(20);
runningAverage.fill(0);

const a2db = function (amp) {
  return 20 * Math.log(amp);
};

const dataSmooth = function (newDatum) {
  //get rid of oldest data point
  runningAverage.shift();
  runningAverage.push(newDatum);
  let sum = 0;
  runningAverage.forEach((val) => {
    sum += val;
  });
  return sum / runningAverage.length;
};

const ampTrack = function () {
  const data = new Float32Array(analyser.fftSize);
  analyser.getFloatTimeDomainData(data);
  let currentdB = a2db(dataSmooth(rms(data)));
  let cutoff = dataSmooth(rms(data)) * 5000 + 100;
  filter.frequency.linearRampToValueAtTime(cutoff, myCtx.currentTime + 0.1);
  document.getElementById("dBDisp").innerText = `${currentdB.toFixed(2)} dB FS`;

  requestAnimationFrame(ampTrack);
};

document.getElementById("start").addEventListener("click", async () => {
  const micInput = await navigator.mediaDevices.getUserMedia({
    audio: true,
  });
  const micSource = myCtx.createMediaStreamSource(micInput);
  micSource.connect(analyser);
  // micSource.connect(filter);
  myCtx.resume();
  saw.start();
  ampTrack();
});
