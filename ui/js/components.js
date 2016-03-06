import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import { startMicLevelDetection } from './functions';
import Application from './application'

const yomi = require('raw!../../grammar/charm.yomi');

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
          <td><a href="#" onClick={this.props.onDelete.bind(this)}><span className="glyphicon glyphicon-remove"/></a></td> :
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
      <span className={classNames('mic-level', 'float-right', 'glyphicon', `glyphicon-${icon.glyphicon}`)} style={icon.style} />
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.app = props.app;
    this.state = this.toState();
    this.state.isFocusing = false;
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

  onFocusKeyboard() {
    this.setState({ isFocusing: true });
  }

  onFocusoutKeyboard() {
    this.app.stopCapture();
    this.setState({ isFocusing: false });
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

  get buttonText() {
    if(this.state.isFocusing) {
      return 'Shiftキーを押しながらマイクに喋る'
    } else {
      return 'ここをクリック'
    }
  }

  render() {
    return (
      <div>
        <div>
          <div className="recording panel panel-default">
            <div className="panel-body">
              <div className="recoding-button-panel">
                <button type="button"
                        ref="keyboard"
                        className="btn btn-default btn-lg"
                        onKeyDown={this.onKeyDown.bind(this)}
                        onKeyUp={this.onKeyUp.bind(this)}
                        onKeyPress={this.onKeyPress.bind(this)}
                        onClick={this.onClickKeyboard.bind(this)}
                        onFocus={this.onFocusKeyboard.bind(this)}
                        onBlur={this.onFocusoutKeyboard.bind(this)}>
                  {this.buttonText}
                </button>
              </div>

              <MicDetection micInput={this.app.micInput} />

              <div className="timer">
                <div className="capture-timer" style={ { width: (100 - this.state.timerProgress) + '%' } }></div>
              </div>
              <span className="clearfix" />
            </div>
          </div>

          <div>
            {this.state.recordedVoice ?
              [
                <audio src={this.state.recordedVoice} controls />,
                <a href={this.state.recordedVoice}>Save</a>
              ] : null}

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

        <div className="csv">
          <p>CHARM.csv</p>
          <textarea cols="30" rows="5" value={this.csv} onFocus={this.selectAllCsv.bind(this)} ref="csvTextArea" readOnly />
        </div>

        <div className="doc well">
          <div>
            <h2>使い方</h2>
            <ul>
              <li>上のボタンをクリックしてフォーカスを合わせる。</li>
              <li>Shiftキーを押しながら、例えば「きれあじ いち たいりょく まいなすなな すろ に」とマイクに向かって喋り、Shiftキーを離す。</li>
              <li>
                認識結果が表示される。
                <ul>
                  <li>正しく表示されたらEnterを押る。一覧に追加される。</li>
                  <li>間違って表示されたらもう一度上記をやり直す。</li>
                </ul>
              </li>
              <li>入力し終わったらテキストエリアからコピーして、別のツールに貼り付ける。</li>
            </ul>
          </div>
          <h3>発音</h3>
          <pre>{yomi}</pre>
        </div>
      </div>
    );
  }
}

module.exports = function(app, nodeId) {
  ReactDOM.render(<App app={app} />, document.getElementById(nodeId));
};
