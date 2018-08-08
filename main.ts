import { Configure, Injectable } from './core';
import { Api, Config as DefaultConfig } from './configurable-api';

@Configure(Api, 'dev')
class DevConfig extends DefaultConfig {
  language = 'JavaScript'
}

@Injectable()
class TopLevelApi {
  constructor(private api: Api) {}
  hello() {
    return this.api.hello();
  }
}

export default {
  '': TopLevelApi
}