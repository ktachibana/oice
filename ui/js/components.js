import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import Recorder from 'recorderjs';
import { startMicLevelDetection, startLimitTimer } from './functions';
import recognizeSkill from './recognizeSkill';
import model from './models';

class Charm extends React.Component {
  renderSkill(skill) {
    return [
      <td>{skill.route}</td>,
      <td>{skill.point}</td>
    ];
  }

  render() {
    return (
      <tr>
        {this.renderSkill(this.props.charm.skills[0])}
        {this.renderSkill(this.props.charm.skills[1])}
        <td>{"◯".repeat(this.props.charm.slot)}</td>
        {this.props.onDelete ?
          <td><a onClick={this.props.onDelete.bind(this)}><span className="glyphicon glyphicon-remove"/></a></td> :
          null}
      </tr>
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.recorder = null;
    this.timerStopper = null;

    this.state = {
      recordedVoice: null,
      candidateCharm: null,
      charms: [],
      micLevel: 0,
      timerProgress: 0
    };
  }

  componentDidMount() {
    startMicLevelDetection(this.props.micInput, (micLevel) => {
      this.setState({ micLevel: micLevel });
    });

    this.focusKeyboard();
  }

  focusKeyboard() {
    this.refs.keyboard.focus();
  }

  get micLevelIcon() {
    const c = 256 - this.state.micLevel;
    return {
      glyphicon: this.state.micLevel == 0 ? 'volume-off' : 'volume-up',
      style: {
        backgroundColor: 'rgb(' + c + ', ' + c + ', ' + c + ')'
      }
    };
  }

  startCapture() {
    if(this.timerStopper) return;

    this.recorder = new Recorder(this.props.micInput);
    this.recorder.record();

    this.timerStopper = startLimitTimer(5000, {
      progress: (percent) => {
        this.setState({ timerProgress: percent });
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
    this.setState({ timerProgress: 0 });

    this.recorder.stop();
    this.recorder.exportWAV(blob => {
      const form = new FormData();
      form.append('file', blob);

      if(this.state.recordedVoice) URL.revokeObjectURL(this.state.recordedVoice);
      this.setState({ recordedVoice: URL.createObjectURL(blob) });

      recognizeSkill(blob).then(charmData => {
        if(charmData) this.setState({ candidateCharm: new model.Charm(charmData) });
      });
    });
  }

  decideCharm() {
    if(this.state.candidateCharm) {
      this.setState({
        charms: [this.state.candidateCharm, ...this.state.charms],
        candidateCharm: null,
        recordedVoice: null
      });
    }
  }

  deleteCharm(delIndex) {
    this.setState({
      charms: this.state.charms.filter((_, index) => index != delIndex)
    });
  }

  onKeyDown(e) {
    if(e.key === 'Shift') {
      this.startCapture();
    }
  }

  onKeyUp(e) {
    if(e.key === 'Shift') {
      this.stopCapture();
    }
  }

  onKeyPress(e) {
    if(e.key == 'Enter') {
      this.decideCharm();
    }
  }

  onClickKeyboard(e) {
    this.focusKeyboard();
  }

  renderCandidateCharmIfEnable() {
    if(this.state.candidateCharm) {
      return (
        <table className="table table-bordered">
          <Charm charm={this.state.candidateCharm}/>
        </table>
      );
    }
  }

  selectAllCsv() {
    this.refs.csvTextArea.select();
  }

  get csv() {
    return this.state.charms.map(charm => charm.cols.join(',')).join("\r\n");
  }

  render() {
    return (
      <div>
        <span className={classNames('mic-level', 'glyphicon', `glyphicon-${this.micLevelIcon.glyphicon}`)} style={this.micLevelIcon.style} />
        <span className="clearfix" />

        <div className="timer">
          <div className="capture-timer" style={ { width: this.state.timerProgress + '%' } }></div>
        </div>

        <button type="button"
                ref="keyboard"
                className="btn btn-default btn-lg"
                onKeyDown={this.onKeyDown.bind(this)}
                onKeyUp={this.onKeyUp.bind(this)}
                onKeyPress={this.onKeyPress.bind(this)}
                onClick={this.onClickKeyboard.bind(this)}>Focus & Speak</button>

        <div>
          {this.state.candidateCharm ?
            <table className="table table-bordered">
              <tbody>
                <Charm charm={this.state.candidateCharm}/>
              </tbody>
            </table> : null}
          {this.state.recordedVoice ?
            <audio src={this.state.recordedVoice} controls /> : null}
        </div>

        <table className="table table-striped table-hover table-condensed">
          <tbody>
            {this.state.charms.map((charm, index) =>
              <Charm charm={charm} key={index} onDelete={() => { this.deleteCharm(index) }} />
            )}
          </tbody>
        </table>

        <textarea cols="30" rows="10" value={this.csv} onFocus={this.selectAllCsv.bind(this)} ref="csvTextArea" readOnly />
      </div>
    );
  }
}

module.exports = function(micInput, nodeId) {
  ReactDOM.render(<App micInput={micInput}/>, document.getElementById(nodeId));
};
