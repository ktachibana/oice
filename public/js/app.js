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
}

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

var timeMax = 6000;

var recorder = null;

var visualCanvas = null;
var visualContext = null;

var cFlag = false;

var aTimer = null;
var aTimeSum = 0;
var aTimeOld = 0;

Vue.config.debug = true;

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

var view = new Vue({
  el: '#vue-app',
  data: {
    text: 'foo',
    items: []
  },
  methods: {
    addItem: function (data) {
      this.items.unshift(new Item(data));
    },
    change: function() {
      this.text = 'bar';
    },
    add: function () {
      this.addItem({ skills: [{ route: '採取', point: 1 }, { }], slot: 2 });
    },
    startCapture: function() {
      recorder && recorder.record();

      //$('#captureButton').addClass('on');
    },
    stopCapture: function() {
      recorder && recorder.stop();
      recorder && recorder.exportWAV(this.wavExported);

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

      timerReset();
      recorder.clear();

      $('#captureButton').removeAttr('disabled');
    }
  }
});


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
    var level = bufSum / buf.length;
    callback(level);
  };

  return setInterval(onTimer, 100);
};

var updateLevelCanvas = function(levelAsByte) {
  var w = visualCanvas.width;
  var h = visualCanvas.height;
  visualContext.fillStyle = "rgb(0,255,0)";
  visualContext.fillRect(0, 0, levelAsByte, h);
  visualContext.fillStyle = "rgb(0,0,0)";
  visualContext.fillRect(levelAsByte, 0, w - levelAsByte, h);
};

var appInit = function () {
  visualCanvas = document.getElementById('visual');
  visualContext = visualCanvas.getContext('2d');

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

    startMicLevelDetection(input, updateLevelCanvas);


    recorder = new Recorder(input, {
      workerPath: './js/recorderjs/recorderWorker.js'
    });

    $('#captureButton').removeAttr('disabled');
  }, function (e) {
    alert("Mic access error!" + e);
    console.error(e);
  });
};


var captureStart = function () {
  if (cFlag) { // already started.
    return;
  }

  cFlag = true;
  timerStart();

  recorder && recorder.record();

  $('#captureButton').addClass('on');
}
var captureStop = function () {
  if (!cFlag) { // already stopped.
    return;
  }

  timerStop();
  cFlag = false;

  recorder && recorder.stop();
  recorder && recorder.exportWAV(wavExported);

  $('#captureButton').removeClass('on');
  $('#captureButton').attr('disabled', 'disabled');
}

var wavExported = function (blob) {
  var form = new FormData();
  form.append('file', blob);
  $.ajax({
    url: '/',
    type: 'POST',
    data: form,
    dataType: 'json',
    processData: false,
    contentType: false
  }).done(function (data, _, xhr) {
    if (xhr.status == 204) return;
    console.log(data)
    view.addItem(data);
  });

  timerReset();
  recorder.clear();

  $('#captureButton').removeAttr('disabled');
}

var timerUpdate = function () {
  var percent = Math.floor((aTimeSum / timeMax) * 100);
  if (percent >= 100) {
    captureStop();
    percent = 100;
  }

  $('#captureTimer').css('width', percent + '%');
}
var timerLoop = function () {
  var now = getTime();
  aTimeSum += (now - aTimeOld);
  aTimeOld = now;

  timerUpdate();

  aTimer = requestAnimationFrame(timerLoop);
}
var timerStart = function () {
  aTimeOld = getTime();
  timerLoop();
}
var timerStop = function () {
  if (aTimer) {
    cancelAnimationFrame(aTimer);
    aTimer = null;
  }
}
var timerReset = function () {
  timerStop();
  aTimeSum = 0;
  timerUpdate();
}

$(document).ready(function () {
  var ua = navigator.userAgent;
  if (ua.search(/iPhone/) != -1 || ua.search(/iPad/) != -1 ||
    ua.search(/iPod/) != -1 || ua.search(/Android/) != -1) {
    $("#captureButton").bind("touchstart", function (e) {
      captureStart();
    });
    $("#captureButton").bind("touchend", function (e) {
      captureStop();
    });
  } else {
    $("#captureButton").mousedown(function () {
      captureStart();
    });
    $("#captureButton").mouseup(function () {
      captureStop();
    });
  }

  appInit();
});
