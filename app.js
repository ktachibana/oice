import $ from 'jquery';
import Vue from 'vue';
import Recorder from 'recorderjs';
import recognizeSkill from './recognizeSkill';
import './vendors';

var startMicLevelDetection = function(source, callback) {
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
};

var startLimitTimer = function(limitTimeInMSec, options) {
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
};

class Skill {
  constructor(attrs) {
    attrs = attrs || {};
    this.route = attrs.route || '';
    this.point = attrs.point || null;
    this.cols = [this.route, (this.point || '').toString()];
  }
}
Skill.empty = new Skill({ route: '', point: null });

class Charm {
  constructor (attrs) {
    this.skills = attrs.skills.map((skill) => new Skill(skill));
    if(this.skills.length < 2) this.skills.push(Skill.empty);
    this.slot = attrs.slot || 0;

    this.slotMarks = "◯".repeat(this.slot);

    const skillCols = this.skills.reduce((array, skill) => array.concat(skill.cols), []);
    this.cols = ['', this.slot.toString()].concat(skillCols);
  }
}

$(document).ready(() => {
  if (!navigator.getUserMedia) {
    alert("WebRTC(getUserMedia) is not supported.");
    return;
  }

  navigator.getUserMedia({
    video: false,
    audio: true
  }, (stream) => {
    const audioContext = new AudioContext();
    const input = audioContext.createMediaStreamSource(stream);

    Vue.config.debug = true;

    Vue.component('skill', {
      template: '#skill-template',
      props: ['skill']
    });

    Vue.component('charm', {
      template: '#charm-template',
      props: ['charm', 'onDelete'],
      computed: {
        isDeletable: function() {
          return !!this.onDelete;
        }
      }
    });

    new Vue({
      el: '#vue-app',
      data: {
        recorder: null,
        recordedVoice: null,
        candidateCharm: null,
        charms: [],
        micLevel: 0,
        timerStopper: null,
        timerProgress: 0
      },
      created: function() {
        startMicLevelDetection(input, (micLevel) => {
          this.micLevel = micLevel;
        });
      },
      attached: function () {
        this.$els.keyboard.focus();
      },
      computed: {
        micLevelIcon: function() {
          const c = 256 - this.micLevel;
          return {
            glyphicon: this.micLevel == 0 ? 'volume-off' : 'volume-up',
            style: {
              backgroundColor: 'rgb(' + c + ', ' + c + ', ' + c + ')'
            }
          };
        },
        csv: function() {
          return this.charms.map(charm => charm.cols.join(',')).join("\r\n");
        }
      },
      methods: {
        selectAllCsv: function() {
          this.$els.csvTextArea.select();
        },
        addCharm: function(data) {
          this.charms.unshift(new Charm(data));
        },
        decideCharm: function() {
          if(this.candidateCharm) {
            this.addCharm(this.candidateCharm);
            this.candidateCharm = null;
            this.recordedVoice = null;
          }
        },
        deleteCharm: function(index) {
          return () => { this.charms.splice(index, 1); };
        },
        getFocus: function() {
          this.$els.keyboard.focus();
        },
        startCapture: function() {
          if(this.timerStopper) return;

          this.recorder = new Recorder(input);
          this.recorder.record();

          this.timerStopper = startLimitTimer(5000, {
            progress: (percent) => {
              this.timerProgress = percent;
            },
            limit: () => {
              this.stopCapture();
            }
          });
        },
        stopCapture: function() {
          if(!this.timerStopper) return;

          this.timerStopper();
          this.timerStopper = null;
          this.timerProgress = 0;
          this.recorder.stop();
          this.recorder.exportWAV(this.wavExported);
        },
        wavExported: function (blob) {
          const form = new FormData();
          form.append('file', blob);

          if(this.recordedVoice) URL.revokeObjectURL(this.recordedVoice);
          this.recordedVoice = URL.createObjectURL(blob);

          recognizeSkill(blob).then((charmData) => {
            if(charmData) this.candidateCharm = new Charm(charmData);
          });
        }
      }
    });
  }, (e) => {
    alert("Mic access error!" + e);
    console.error(e);
  });
});
