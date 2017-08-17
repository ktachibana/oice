import React from 'react';
import classNames from 'classnames';
import Charm from './charm';
import MicDetection from './micDetection';
const yomi = require('raw!../../../julius/grammars/src/charm/charm.yomi');

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.app = props.app;
        this.state = this.toState();
        this.state.isFocusing = false;
    }

    toState() {
        return {
            isRecording: this.app.isRecording,
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

    onKeyPress(e) {
        if(e.key === 'Enter') {
            this.app.decideCharm();
        } else if(e.key === ']') {
            if(this.app.isRecording) {
                this.app.stopCapture();
            } else {
                this.app.startCapture();
            }
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
        if(this.state.isRecording) {
            return '録音中...';
        } else if(!this.state.isFocusing) {
            return 'ここをクリック'
        } else if(this.state.candidateCharm) {
            return <span className="guide-message">正しくなければもう一度</span>;
        } else {
            return '"]"キーを押してマイクに喋り、もう一度"]"キー'
        }
    }

    exportBackup() {
        if(this.backupURL) URL.revokeObjectURL(this.backupURL);
        const json = this.app.exportBackup();
        this.backupURL = URL.createObjectURL(new Blob([json], { type: 'application/octet-stream; charset=UTF-8' }));

        const a = document.createElement('a');
        a.style = 'display: none';
        a.download = `oice-backup-${new Date().getTime()}.json`;
        a.href = this.backupURL;
        document.body.appendChild(a);
        a.click();
    }

    importBackup(_e) {
        const backupFile = this.refs.backupFileInput.files[0];
        if(!backupFile) return;

        const reader = new FileReader();
        reader.readAsText(backupFile, 'UTF-8');
        reader.addEventListener('load', (e) => {
            const json = e.target.result;
            this.app.importBackup(json);
            this.refs.backupFileInput.value = null;
        });
    }

    render() {
        return (
            <div>
                <div className="ui">
                    <div>
                        <button type="button"
                                ref="keyboard"
                                className="recording-button btn btn-default btn-lg"
                                onKeyPress={this.onKeyPress.bind(this)}
                                onClick={this.onClickKeyboard.bind(this)}
                                onFocus={this.onFocusKeyboard.bind(this)}
                                onBlur={this.onFocusoutKeyboard.bind(this)}>
                            <MicDetection micInput={this.app.micInput} />
                            {this.buttonText}
                            <div className="timer">
                                <div className="capture-timer" style={ { width: (100 - this.state.timerProgress) + '%' } }></div>
                            </div>
                        </button>
                    </div>

                    <div className="recorded-voice">
                        {this.state.recordedVoice ?
                            [
                                <audio src={this.state.recordedVoice} controls />,
                                <a href={this.state.recordedVoice}>Save</a>
                            ] : null}
                    </div>

                    <div className="procedure-allow">
                        <span className="glyphicon glyphicon-arrow-down" />
                    </div>

                    <div className={classNames('candidate', { 'candidate-empty': !this.state.candidateCharm })}>
                        {this.state.candidateCharm ?
                            <table className="table table-bordered charm">
                                <tbody>
                                <Charm charm={this.state.candidateCharm} />
                                </tbody>
                            </table> : '？'}
                    </div>

                    <div className="procedure-allow">
                        {this.state.candidateCharm ?
                            <div className="guide-message">正しければEnterキー</div> :
                            null
                        }
                        <span className="glyphicon glyphicon-arrow-down" />
                    </div>

                    <div className="results">
                        {this.state.charms.length ?
                            <table className="table table-bordered table-hover charm">
                                <tbody>
                                {this.state.charms.map((charm, index) =>
                                    <Charm charm={charm} onDelete={(e) => { this.onDeleteCharm(index); e.preventDefault(); }} />
                                )}
                                </tbody>
                            </table> :
                            <div className="empty">
                                ここに確定した結果が追加されます。
                            </div>
                        }

                        <hr/>

                        <div className="csv">
                            <p>CHARM.csv</p>
                            <textarea cols="30" rows="5" value={this.csv} onFocus={this.selectAllCsv.bind(this)} ref="csvTextArea" readOnly />
                        </div>

                        <hr/>

                        <div className="backup">
                            <p>護石データをOice固有のファイル形式でバックアップできます。</p>
                            <div className="export">
                                <button onClick={this.exportBackup.bind(this)}>保存</button>
                            </div>
                            <div className="import">
                                <input type="file" className="backupFile" ref="backupFileInput" />
                                <button onClick={this.importBackup.bind(this)}>復元</button>
                            </div>
                        </div>
                    </div>
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
                                    <li>正しく表示されたらEnterを押すと一覧に追加される。</li>
                                    <li>間違って表示されたらもう一度上記をやり直す。</li>
                                </ul>
                            </li>
                            <li>入力し終わったらテキストエリアからコピーして、別のツールに貼り付ける。</li>
                        </ul>
                        ブラウザのローカル領域に保存するので閉じたりリロードしても大丈夫です。
                    </div>
                    <h3>発音</h3>
                    <pre>{yomi}</pre>
                </div>
            </div>
        );
    }
}

