// Hot Module Replacement
require('hot-module-replacement')({
  // regexp to decide if module should be ignored; also can be a function accepting string and returning true/false
  ignore: /node_modues/
});
// Core
const EventEmitter = require('events');

const events = new EventEmitter();

const dispatch = (worker) => events.emit('reload', worker);

let last = Date.now();

/**
 * @param {Object} command
 */
const load = (file) => {
  try {
    let worker = require(file);
    if (module.hot) {
      module.hot.accept(file, (filepath) => {
        console.log('module.hot.accept', filepath);
        // Ensure clear cache
        // delete require.cache[require.resolve(filepath)];
        // Reload worker declaration
        worker = require(filepath);
        // Time tracking
        const now = Date.now();
        if (now - last > 5000) {
          // Dispatch event outside event loop
          dispatch(worker);
          // Update latest update
          last = now;
        }
      });
    }
    return worker;
  } catch (error) {
    console.error(error)
  }
};


module.exports = { load, events };
