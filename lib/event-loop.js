const bootstrap = (delay = 1000) => {
  let terminate = false;
  const onTerminalSignal = (signal) => {
    terminate = true;
    console.log('EXIT', signal);
  };
  const TERMINATE_SIGNALS = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
  TERMINATE_SIGNALS.forEach((signal) => {
    process.on(signal, () => {
      onTerminalSignal(signal);
    });
  });
  Function(function loop() {
    if (!terminate) {
      setTimeout(loop, delay);
    }
  }());
};

module.exports = bootstrap;
