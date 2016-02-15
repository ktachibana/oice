window.URL = window.URL || window.webkitURL;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia || navigator.msGetUserMedia;
window.AudioContext = window.AudioContext || window.webkitAudioContext;

var now = window.performance && (
    performance.now || performance.mozNow || performance.msNow ||
    performance.oNow || performance.webkitNow
);
window.getTime = function() {
    return (now && now.call(performance)) ||
        (new Date().getTime());
}

window.requestAnimationFrame = (function() {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        function(f) {
            return window.setTimeout(f, 1000 / 60);
        };
}());
window.cancelAnimationFrame = (function() {
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
        function(id) {
            window.clearTimeout(id);
        };
}());

var timeMax = 6000;
var timeColors = [
  { r:   0, g: 0, b: 255 },
  { r: 255, g: 0, b:   0 }
];

var audioContext = null;
var sampleRate = 0;

var recorder = null;

var visualCanvas = null;
var visualContext = null;
var vTimer = null;

var analyser = null;

var cFlag = false;

var aTimer = null;
var aTimeSum = 0;
var aTimeOld = 0;

var appInit = function() {
    audioContext = new AudioContext();
    sampleRate = audioContext.sampleRate;
    console.log("sample rate:" + sampleRate);

    analyser = audioContext.createAnalyser();
    analyser.fftSize = 32;
    analyser.smoothingTimeConstant = 0.3;

    visualCanvas = document.getElementById('visual');
    visualContext = visualCanvas.getContext('2d');

    if (!navigator.getUserMedia) {
        alert("WebRTC(getUserMedia) is not supported.");
        return;
    }

    navigator.getUserMedia({
        video: false,
        audio: true
    }, function(stream) {
        var input = audioContext.createMediaStreamSource(stream);

        input.connect(analyser);
        visualStart();

        recorder = new Recorder(input, {
            workerPath: './js/recorderjs/recorderWorker.js'
        });

        $('#captureButton').removeAttr('disabled');
    }, function(e) {
        alert("Mic access error!" + e);
        console.error(e);
        return;
    });
}

var visualUpdate = function() {
    if (!analyser) {
        return;
    }

    var buf = new Uint8Array(16);
    analyser.getByteFrequencyData(buf);
    var vol = 0;
    for(var i = 0; i < buf.length; i++) {
      vol += buf[i];
    }
    var vol = vol / buf.length;

    var w = visualCanvas.width;
    var h = visualCanvas.height;
    visualContext.fillStyle = "rgb(0,255,0)"
    visualContext.fillRect(0, 0, vol, h);
    visualContext.fillStyle = "rgb(0,0,0)";
    visualContext.fillRect(vol, 0, w - vol, h);
}
var visualStart = function() {
    if (vTimer) {
        return;
    }

    vTimer = setInterval(visualUpdate, 100);
}
var visualStop = function() {
    if (!vTimer) {
        return;
    }

    clearInterval(vTimer);
    vTimer = null;
}

var captureStart = function() {
    if (cFlag) { // already started.
        return;
    }

    cFlag = true;
    timerStart();

    recorder && recorder.record();

    $('#captureButton').addClass('on');
}
var captureStop = function() {
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

var wavExported = function(blob) {
    var form = new FormData();
    form.append('file', blob, 'voice.wav');
    $.ajax({
      url: '/',
      type: 'POST',
      data: form,
      dataType: 'json',
      processData: false,
      contentType: false
    }).done(function(data, _, xhr) {
      if(xhr.status == 204) return;
      $('#timeline').append(JSON.stringify(data) + "\r\n");
    });

    timerReset();
    recorder.clear();

    $('#captureButton').removeAttr('disabled');
}

var timerUpdate = function() {
    var percent = Math.floor((aTimeSum / timeMax) * 100);
    if (percent >= 100) {
        captureStop();
        percent = 100;
    }

    $('#captureTimer').css('width', percent + '%');
}
var timerLoop = function() {
    var now = getTime();
    aTimeSum += (now - aTimeOld);
    aTimeOld = now;

    timerUpdate();

    aTimer = requestAnimationFrame(timerLoop);
}
var timerStart = function() {
    aTimeOld = getTime();
    timerLoop();
}
var timerStop = function() {
    if (aTimer) {
        cancelAnimationFrame(aTimer);
        aTimer = null;
    }
}
var timerReset = function() {
    timerStop();
    aTimeSum = 0;
    timerUpdate();
}

$(document).ready(function() {
    var ua = navigator.userAgent;
    if (ua.search(/iPhone/) != -1 || ua.search(/iPad/) != -1 ||
        ua.search(/iPod/) != -1 || ua.search(/Android/) != -1) {
        $("#captureButton").bind("touchstart", function(e) {
            captureStart();
        });
        $("#captureButton").bind("touchend", function(e) {
            captureStop();
        });
    } else {
        $("#captureButton").mousedown(function() {
            captureStart();
        });
        $("#captureButton").mouseup(function() {
            captureStop();
        });
    }

    appInit();
});
