// Solidity compiler web worker
importScripts('https://cdn.jsdelivr.net/npm/solc@0.8.19/dist/solc.min.js');

self.onmessage = function(e) {
  const { solidityCode, contractName } = e.data;
  
  try {
    const input = {
      language: 'Solidity',
      sources: {
        'contract.sol': {
          content: solidityCode
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

    const output = JSON.parse(solc.compile(JSON.stringify(input)));
    
    if (output.errors) {
      const errors = output.errors.filter(error => error.severity === 'error');
      if (errors.length > 0) {
        self.postMessage({
          success: false,
          error: errors.map(e => e.formattedMessage).join('\n')
        });
        return;
      }
    }

    const contracts = output.contracts['contract.sol'];
    const contractNames = Object.keys(contracts);
    
    if (contractNames.length === 0) {
      self.postMessage({
        success: false,
        error: 'No contracts found'
      });
      return;
    }

    const contract = contracts[contractNames[0]];
    
    self.postMessage({
      success: true,
      abi: contract.abi,
      bytecode: contract.evm.bytecode.object,
      contractName: contractNames[0]
    });
    
  } catch (error) {
    self.postMessage({
      success: false,
      error: error.message
    });
  }
};