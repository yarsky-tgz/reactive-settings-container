const EventEmitter = require('events');

class Settings extends EventEmitter {
  constructor() {
    super();
    this._filled = false;
    this._data = new Proxy({}, {
      set: this._setter
    })
  }
  
  _setter(target, key, value) {
    const changed = (target[key] !== value);
    target[ key ] = value;
    if (this._filled && changed) this.emit(`changed:${key}`, value);
    return true;
  }
  
  fill(data) {
    for (let key in data) {
      if (data.hasOwnProperty(key)) {
        this._data[ key ] = data[ key ];
      }
    }
    const oldFilled = this._filled;
    this._filled = true;
    if (!oldFilled) this.emit('_filled');
  }
  
  async trigger(key) {
    const value = await this.get(key);
    this.emit(`changed:${key}`, value);
  }
  
  async get(key) {
    const _this = this;
    if (!this._filled) await new Promise(resolve => _this.once('_filled', () => resolve()));
    return this._data[ key ];
  }
}

module.exports = new Settings();