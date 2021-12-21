import Model from './Model.js';

/**
 * Пользователь
 * @extends Model
 */
export default class User extends Model {

  static get schema() {
    return {
    };
  }

  constructor(user = {}) {
    super();

    if (user === null) {
      user = {};
    }

    Object.keys(user).map(k => (this[k] = user[k]));
  }

}
