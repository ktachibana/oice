import React from 'react';

export default class Charm extends React.Component {
    renderSkill(skill) {
        const pointText = skill.point && ((skill.point > 0 ? '+' : '') + skill.point);
        return [
            <td className="skill-route">{skill.route}</td>,
            <td className="skill-point">{pointText}</td>
        ];
    }

    get slotText() {
        var slotNum = this.props.charm.slot;
        return '◯'.repeat(slotNum) + '―'.repeat(3 - slotNum);
    }

    render() {
        return (
            <tr>
                {this.renderSkill(this.props.charm.skills[0])}
                {this.renderSkill(this.props.charm.skills[1])}
                <td className="slot">{this.slotText}</td>
                {this.props.onDelete ?
                    <td className="remove-button"><a href="#" onClick={this.props.onDelete.bind(this)}><span className="glyphicon glyphicon-remove"/></a></td> :
                    null}
            </tr>
        );
    }
}
