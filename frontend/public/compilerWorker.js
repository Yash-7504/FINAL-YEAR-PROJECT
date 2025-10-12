importScripts('https://binaries.soliditylang.org/bin/soljson-v0.8.19+commit.7dd6d404.js');

self.onmessage = function (e) {
  const { sourceCode, fileName } = e.data;

  try {
    if (!self.Module || !self.Module.cwrap) {
      setTimeout(() => self.onmessage(e), 100);
      return;
    }

    const compile = self.Module.cwrap('solidity_compile', 'string', ['string', 'number']);

    const input = {
      language: 'Solidity',
      sources: {
        [fileName]: {
          content: sourceCode
        }
      },
      settings: {
        outputSelection: {
          '*': {
            '*': ['abi', 'evm.bytecode']
          }
        }
      }
    };

    const output = JSON.parse(compile(JSON.stringify(input), 0));

    if (output.errors) {
      const hasErrors = output.errors.some(err => err.severity === 'error');
      if (hasErrors) {
        postMessage({ type: 'error', data: output.errors });
        return;
      }
    }

    postMessage({ type: 'success', data: output });
  } catch (err) {
    postMessage({ type: 'error', data: err.message || err });
  }
};