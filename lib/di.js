const {
  ReflectiveInjector,
  hasConfigurationProviderMetadata,
  hasConfigurationMetadata,
  getConfigurationProviderMetadata,
  getConfigurationMetadata
} = require('../core');

const getInjectionMetadata = (target) => Reflect.hasMetadata('design:paramtypes', target)
    ? Reflect.getMetadata('design:paramtypes', target)
    : target.parameters;

class Scan {
  constructor() {
    this.configurer = [];
    this.injectable = [];
  }
}

const scan = (CloudService, output) => {
  const metadata = getInjectionMetadata(CloudService);
  output.injectable.push(CloudService);
  metadata.forEach((Dependency) => {
    if (Array.isArray(getInjectionMetadata(Dependency))) {
      scan(Dependency, output);
    } else {
      output.injectable.push(Dependency);
    }
  });
}

const analyze = (Declaration, env = 'dev') => {
  const output = new Scan();
  Object.values(Declaration.default).forEach((CloudService) => scan(CloudService, output));
  output.configurer = output.injectable.reduce((configurer, CloudService) => {
    if (hasConfigurationProviderMetadata(CloudService)) {
      const InjectableConfigService = getConfigurationProviderMetadata(CloudService).provide;
      console.log(`${CloudService.name} is configurable with class ${InjectableConfigService.name} {}`);
      if (hasConfigurationMetadata(CloudService, env)) {
        const InjectableConfigServiceByEnv = getConfigurationMetadata(CloudService, env);
        console.log(`${CloudService.name} has a registered configuration for ${env} environment, class ${InjectableConfigServiceByEnv.name} {}`);
        configurer.push({
          provide: InjectableConfigService,
          useClass: InjectableConfigServiceByEnv
        });
      }
    }
    return configurer;
  }, []);
  output.injectable = output.injectable.filter((CloudService) => (
    !output.configurer.find((provider) => {
      return provider.provide === CloudService || provider.useClass === CloudService;
    })
  ));
  return output;
};

const resolve = (analyzed) => [
  ...analyzed.configurer,
  ...analyzed.injectable.map((CloudService) => ({
    provide: CloudService,
    useClass: CloudService
  }))
];

const instanciate = (Declaration) => {
  const analyzed = analyze(Declaration);
  const providers = resolve(analyzed);
  const injector = ReflectiveInjector.resolveAndCreate(providers);
  const singleton = Object.entries(Declaration.default).reduce((instance, [namespace, CloudService]) => ({
    ...instance,
    [namespace]: injector.get(CloudService)
  }), Object.create(null));
  return singleton;
}

module.exports = { analyze, instanciate };