import React from 'react';
import classNames from 'classnames';
import { startMicLevelDetection } from './../functions';

export default class MicDetection extends React.Component {
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
