import has from 'lodash/has';

export default class Navigation {
  constructor({ key, children, title, route }) {
    this.key = key;
    this.title = title;
    this.route = route;
    this.children = children.map((i) => {
      if (has(i, 'children')) return new Navigation(i);
      return i;
    });
  }

  get(key) {
    return this.children.find(i => i.key === key);
  }

  firstVisible(userPermissions) {
    return (this.children || []).find(({ permissions }) =>
      !permissions || permissions.some(p => userPermissions.includes(p))
    );
  }

  map(cb) {
    return this.children.map(cb);
  }

  add(object, index) {
    const currentIndex = this.children.findIndex(i => i.key === object.key);
    const exists = object.key && currentIndex > -1;
    if (exists) {
      this.children[currentIndex] = object;
    } else if (typeof index !== 'undefined') {
      this.children.splice(index, 0, object);
    } else {
      this.children.push(object);
    }
  }
}
