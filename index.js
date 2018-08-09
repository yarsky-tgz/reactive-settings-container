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
  
  _untilFilled() {
    if (!this._filled) return new Promise(resolve => this.once('_filled', resolve));
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
    await this._untilFilled();
    return this._data[ key ];
  }
  
  async few(keys) {
    await this._untilFilled();
    return keys.reduce((settingsSlice, key) => {
      settingsSlice[key] = this._data[ key ];
      return settingsSlice;
    }, {});
  }
}

module.exports = new Settings();