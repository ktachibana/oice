class Skill {
  constructor(attrs) {
    this.attrs = attrs || {};
    this.route = this.attrs.route || '';
    this.point = this.attrs.point || null;
  }

  get cols() {
    return [this.route, (this.point || '').toString()];
  }
}
Skill.empty = new Skill({ route: '', point: null });

class Charm {
  constructor (attrs) {
    this.attrs = attrs;

    this.skills = attrs.skills.map((skill) => new Skill(skill));
    if(this.skills.length < 2) this.skills.push(Skill.empty);
    this.slot = attrs.slot || 0;
  }

  get slotText() {
    var slotNum = this.props.charm.slot;
    return '◯'.repeat(slotNum) + '―'.repeat(3 - slotNum);
  }

  get cols() {
    const skillCols = this.skills.reduce((array, skill) => array.concat(skill.cols), []);
    return ['', this.slot.toString()].concat(skillCols);
  }

  get serializable() {
    return this.attrs;
  }
}

module.exports = {
  Skill,
  Charm
};
