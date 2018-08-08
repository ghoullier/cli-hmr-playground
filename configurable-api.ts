import { Injectable } from 'injection-js';
import { Configurable } from './core';

export class Config {
  language = 'TypeScript';
}

@Injectable()
@Configurable(Config)
export class Api {
  constructor(private config: Config) {}
  hello() {
    return `Configured Hello from ${this.config.language} at ${Date.now()}`
  }
}