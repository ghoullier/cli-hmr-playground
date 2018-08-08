#!/usr/bin/env node

// FirstClass TypeScript Support
require('ts-node').register({
  ignore: '/node_modules/'
});

const path = require('path');

const Loader = require('./lib/loader.js');
const DI = require('./lib/di.js');

const argv = [...process.argv].splice(2);
const [
  worker,
  method,
  namespace = ''
] = argv;

const file = path.join(process.cwd(), worker);

const dispatch = (Declaration) => {
  const instance = DI.instanciate(Declaration);
  const request = { method, namespace }; 
  const response = {};
  try {
    response.result = instance[namespace][method]();
  } catch (error) {
    response.error = error;
  }
  console.log({ request, response });
  return { request, response };
};

Loader.events.on('reload', (reloaded) => dispatch(reloaded));

dispatch(Loader.load(file));

require('./lib/event-loop.js')();