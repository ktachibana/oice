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

module.exports = {
  Skill,
  Charm
};
