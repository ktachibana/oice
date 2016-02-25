window.URL =
  window.URL ||
  window.webkitURL;

navigator.getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia;

window.AudioContext =
  window.AudioContext ||
  window.webkitAudioContext;

window.performance = window.performance || {};
window.performance.now =
  window.performance.now ||
  window.performance.mozNow ||
  window.performance.msNow ||
  window.performance.oNow ||
  window.performance.webkitNow ||
  function() { return (new Date().getTime()); };

window.requestAnimationFrame = (function () {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    function (f) {
      return window.setTimeout(f, 1000 / 60);
    };
}());

window.cancelAnimationFrame = (function () {
  return window.cancelAnimationFrame ||
    window.cancelRequestAnimationFrame ||
    window.webkitCancelAnimationFrame ||
    window.webkitCancelRequestAnimationFrame ||
    window.mozCancelAnimationFrame ||
    window.mozCancelRequestAnimationFrame ||
    window.msCancelAnimationFrame ||
    window.msCancelRequestAnimationFrame ||
    window.oCancelAnimationFrame ||
    window.oCancelRequestAnimationFrame ||
    function (id) {
      window.clearTimeout(id);
    };
}());
