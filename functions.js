module.exports = {
  startMicLevelDetection: function(source, callback) {
    const analyser = source.context.createAnalyser();
    analyser.fftSize = 32;
    analyser.smoothingTimeConstant = 0.3;
    source.connect(analyser);

    const buf = new Uint8Array(16);
    const onTimer = () => {
      analyser.getByteFrequencyData(buf);

      const bufSum = buf.reduce((sum, value) => sum + value);
      const level = Math.floor(bufSum / buf.length);
      callback(level);
    };

    return setInterval(onTimer, 100);
  },

  startLimitTimer: function(limitTimeInMSec, options) {
    options = options || {};
    const limitCallback = options.limit || function() {};
    const progressCallback = options.progress || function(percent) {};

    let timer = null;
    let timeFromStart = 0;
    let timeAtPrevFrame = window.performance.now();

    const stop = () => {
      if (timer) {
        cancelAnimationFrame(timer);
        timer = null;
      }
    };

    const updateFrame = () => {
      const now = window.performance.now();
      timeFromStart += (now - timeAtPrevFrame);
      timeAtPrevFrame = now;

      const percent = Math.floor((timeFromStart / limitTimeInMSec) * 100);
      if (100 <= percent) {
        stop();
        progressCallback(100);
        limitCallback();
        return;
      }

      progressCallback(percent);

      timer = requestAnimationFrame(updateFrame);
    };
    updateFrame();

    return stop;
  },

  openMic: function() {
    return new Promise((resolve, reject) => {
      if (!navigator.getUserMedia) {
        reject(new Error("WebRTC(getUserMedia) is not supported."));
        return;
      }

      navigator.getUserMedia({
        video: false,
        audio: true
      }, (stream) => {
        const audioContext = new AudioContext();
        const input = audioContext.createMediaStreamSource(stream);
        resolve(input);
      }, (e) => {
        reject(e);
      });
    });
  }
};
