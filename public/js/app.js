window.URL = window.URL || window.webkitURL;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia || navigator.msGetUserMedia;
window.AudioContext = window.AudioContext || window.webkitAudioContext;

var now = window.performance && (
    performance.now || performance.mozNow || performance.msNow ||
    performance.oNow || performance.webkitNow
  );
window.getTime = function () {
  return (now && now.call(performance)) ||
    (new Date().getTime());
};

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

var startMicLevelDetection = function(source, callback) {
  var analyser = source.context.createAnalyser();
  analyser.fftSize = 32;
  analyser.smoothingTimeConstant = 0.3;
  source.connect(analyser);

  var buf = new Uint8Array(16);
  var onTimer = function () {
    analyser.getByteFrequencyData(buf);

    var bufSum = 0;
    for (var i = 0; i < buf.length; i++) {
      bufSum += buf[i];
    }
    var level = Math.floor(bufSum / buf.length);
    callback(level);
  };

  return setInterval(onTimer, 100);
};

var startLimitTimer = function(limitTimeInMSec, options) {
  options = options || {};
  var limitCallback = options.limit || function() {};
  var progressCallback = options.progress || function(percent) {};

  var timer = null;
  var timeFromStart = 0;
  var timeAtPrevFrame = getTime();

  var stop = function () {
    if (timer) {
      cancelAnimationFrame(timer);
      timer = null;
    }
  };

  var updateFrame = function () {
    var now = getTime();
    timeFromStart += (now - timeAtPrevFrame);
    timeAtPrevFrame = now;

    var percent = Math.floor((timeFromStart / limitTimeInMSec) * 100);
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
};


var Skill = function (attrs) {
  attrs = attrs || {};
  this.route = attrs.route || '';
  this.point = attrs.point || null;
};

var Item = function (attrs) {
  this.skills = attrs.skills.map(function (skill) {
    return new Skill(skill);
  });
  this.slot = attrs.slot || 0;

  this.slotMarks = "◯".repeat(this.slot);
};

$(document).ready(function () {
  //var ua = navigator.userAgent;
  //if (ua.search(/iPhone/) != -1 || ua.search(/iPad/) != -1 ||
  //  ua.search(/iPod/) != -1 || ua.search(/Android/) != -1) {
  //  $("#captureButton").bind("touchstart", function (e) {
  //    captureStart();
  //  });
  //  $("#captureButton").bind("touchend", function (e) {
  //    captureStop();
  //  });
  //}

  if (!navigator.getUserMedia) {
    alert("WebRTC(getUserMedia) is not supported.");
    return;
  }

  navigator.getUserMedia({
    video: false,
    audio: true
  }, function (stream) {
    var audioContext = new AudioContext();
    var input = audioContext.createMediaStreamSource(stream);

    Vue.config.debug = true;
    var view = new Vue({
      el: '#vue-app',
      data: {
        recorder: null,
        items: [],
        micLevel: 0,
        timerStopper: null,
        timerProgress: 0
      },
      created: function() {
        var self = this;
        startMicLevelDetection(input, function(micLevel) {
          self.micLevel = micLevel;
        });

        this.recorder = new Recorder(input, {
          workerPath: './js/recorderjs/recorderWorker.js'
        });
      },
      attached: function () {
        this.$els.keyboard.focus();
      },
      computed: {
        micLevelIcon: function() {
          var c = 256 - this.micLevel;
          return {
            glyphicon: this.micLevel == 0 ? 'volume-off' : 'volume-up',
            style: {
              backgroundColor: 'rgb(' + c + ', ' + c + ', ' + c + ')'
            }
          };
        }
      },
      methods: {
        keyDown: function(e) {
          console.log('down', e);
        },
        keyUp: function (e) {
          console.log('up', e);
        },
        addItem: function (data) {
          this.items.unshift(new Item(data));
        },
        startCapture: function() {
          if(this.timerStopper) return;

          var self = this;

          this.recorder.record();
          this.timerStopper = startLimitTimer(5000, {
            progress: function(percent) {
              self.timerProgress = percent;
            },
            limit: function() {
              self.stopCapture();
            }
          });

          //$('#captureButton').addClass('on');
        },
        stopCapture: function() {
          this.timerStopper();
          this.timerStopper = null;
          this.timerProgress = 0;
          this.recorder.stop();
          this.recorder.exportWAV(this.wavExported);

          //$('#captureButton').removeClass('on');
          //$('#captureButton').attr('disabled', 'disabled');
        },
        wavExported: function (blob) {
          var form = new FormData();
          form.append('file', blob);

          var self = this;
          $.ajax({
            url: '/',
            type: 'POST',
            data: form,
            dataType: 'json',
            processData: false,
            contentType: false
          }).done(function (data, _, xhr) {
            if (xhr.status == 204) return;
            self.addItem(data);
          });

          this.recorder.clear();

          $('#captureButton').removeAttr('disabled');
        }
      }
    });

    $('#captureButton').removeAttr('disabled');
  }, function (e) {
    alert("Mic access error!" + e);
    console.error(e);
  });
});
