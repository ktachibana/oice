import EventEmitter from 'events';
import Recorder from 'recorderjs';
import fn from './functions';
import recognizeSkill from './recognizeSkill';
import model from './models';
import store from 'store';

export default class Application extends EventEmitter {
  constructor(micInput) {
    super();
    this.micInput = micInput;
    this.recorder = null;
    this.timerStopper = null;

    this.recordedVoice = null;
    this.candidateCharm = null;
    this.charms = this.load() || [];
    this.timerProgress = 0;
  }

  emitChanged() {
    this.emit('changed');
  }

  startCapture() {
    if(this.timerStopper) return;

    this.recorder = new Recorder(this.micInput);
    this.recorder.record();

    this.timerStopper = fn.startLimitTimer(5000, {
      progress: (percent) => {
        this.timerProgress = percent;
        this.emitChanged();
      },
      limit: () => {
        this.stopCapture();
      }
    });
  }

  stopCapture() {
    if(!this.timerStopper) return;

    this.timerStopper();
    this.timerStopper = null;
    this.timerProgress = 0;

    this.recorder.stop();
    this.emitChanged();

    this.recorder.exportWAV(blob => {
      if(this.recordedVoice) URL.revokeObjectURL(this.recordedVoice);
      this.recordedVoice = URL.createObjectURL(blob);
      this.emitChanged();

      recognizeSkill(blob).then(charmData => {
        if(charmData) {
          this.candidateCharm = new model.Charm(charmData);
        }
        this.emitChanged();
      });
    });
  }

  decideCharm() {
    if(this.candidateCharm) {
      this.charms = [this.candidateCharm, ...this.charms];
      this.save();
      this.candidateCharm = null;
      this.recordedVoice = null;
      this.emitChanged();
    }
  }

  deleteCharm(delIndex) {
    this.charms = this.charms.filter((_, index) => index != delIndex);
    this.save();
    this.emitChanged();
  }

  save() {
    store.set('charms', this.serializable);
  }

  load() {
    const charms = store.get('charms');
    if(!charms) return;
    return charms.map(charm => new model.Charm(charm));
  }

  get csv() {
    return this.charms.map(charm => charm.cols.join(',')).join("\r\n");
  }

  get serializable() {
    return this.charms.map(charm => charm.serializable);
  }

  exportBackup() {
    return JSON.stringify(this.serializable);
  }

  importBackup(json) {
    this.charms = JSON.parse(json).map(charmAttrs => new model.Charm(charmAttrs));
    this.save();
    this.emitChanged();
  }
}
