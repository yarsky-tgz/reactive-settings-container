# reactive-settings-container
container for easily making your settings shared across different processes or servers

## Installation

```bash
npm i reactive-settings-container
```

## Usage

For subsribing on settings changes you must implement module like this, named for example `settings.js`:

```javascript
const reactiveSettings = require('reactive-settings-container');
const io = require('socket.io-client');
const log = require('@s1/log').create(__filename);
const settingsSocketServer = process.env.CONTROL_SOCKET_SERVER + 'settings';
const socket = io(settingsSocketServer);
log.info(`connected to socket ${settingsSocketServer}`);
socket.on('settings', data => {
  log.warn(`got fresh settings from control server`);
  reactiveSettings.fill(data);
});
socket.on('reconnect', () => socket.emit('getSettings'));
socket.emit('getSettings');

module.exports = reactiveSettings;
```

so with emitting event `settings` from control node you shall easily sync your settings everywhere. 

and after this you can use it anywhere in such manner for getting most fresh value at this momeny:

```javascript
const settings = require('./settings.js');

async function f() {
  const someValue = await settings.get('someValue');
}
```

or even be subscribed for changes

```javascript
const settings = require('./settings.js');

settings.on('change:someValue', function (newValue) {
  //your immediate adaptation to changed settings 
});
settings.trigger('someValue'); //your event listener to be runt first time
```