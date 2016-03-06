import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import { startMicLevelDetection } from './functions';
import Application from './application'

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

class MicDetection extends React.Component {
  constructor(props) {
    super(props);
    this.state = { micLevel: 0 };
  }

  componentDidMount() {
    startMicLevelDetection(this.props.micInput, (micLevel) => {
      this.setState({ micLevel: micLevel });
    });
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

  render() {
    const icon = this.micLevelIcon;
    return (
      <span className={classNames('mic-level', 'glyphicon', `glyphicon-${icon.glyphicon}`)} style={icon.style} />
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.app = props.app;
    this.state = this.toState();
    this.state.micLevel = 0;
  }

  toState() {
    return {
      recordedVoice: this.app.recordedVoice,
      candidateCharm: this.app.candidateCharm,
      charms: this.app.charms,
      timerProgress: this.app.timerProgress
    };
  }

  appChanged() {
    this.setState(this.toState());
  }

  componentDidMount() {
    this.app.on('changed', this.appChanged.bind(this));

    this.focusKeyboard();
  }

  componentWillUnmount() {
    this.app.removeListener('changed', this.appChanged.bind(this));
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

  onKeyDown(e) {
    if(e.key === 'Shift') {
      this.app.startCapture();
    }
  }

  onKeyUp(e) {
    if(e.key === 'Shift') {
      this.app.stopCapture();
    }
  }

  onKeyPress(e) {
    if(e.key == 'Enter') {
      this.app.decideCharm();
    }
  }

  onClickKeyboard(e) {
    this.focusKeyboard();
  }

  onDeleteCharm(delIndex) {
    this.app.deleteCharm(delIndex);
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
    return this.app.csv;
  }

  render() {
    return (
      <div>
        <div>
          <MicDetection micInput={this.app.micInput} />
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
            {this.state.recordedVoice ?
              <audio src={this.state.recordedVoice} controls /> : null}
            {this.state.candidateCharm ?
              <table className="table table-bordered">
                <tbody>
                <Charm charm={this.state.candidateCharm}/>
                </tbody>
              </table> : null}
          </div>
        </div>

        <table className="table table-striped table-hover table-condensed">
          <tbody>
            {this.state.charms.map((charm, index) =>
              <Charm charm={charm} key={index} onDelete={() => { this.onDeleteCharm(index) }} />
            )}
          </tbody>
        </table>

        <textarea cols="30" rows="10" value={this.csv} onFocus={this.selectAllCsv.bind(this)} ref="csvTextArea" readOnly />
      </div>
    );
  }
}

module.exports = function(app, nodeId) {
  ReactDOM.render(<App app={app} />, document.getElementById(nodeId));
};
