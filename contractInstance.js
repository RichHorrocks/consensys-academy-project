import web3 from './getWeb3';
import SEBounty from './build/contracts/SEBounty.json';
import contract from 'truffle-contract';

const SEBountyContract = contract(SEBounty);
SEBountyContract.setProvider(web3.currentProvider);

const instance = SEBountyContract.at('0x9b5ca0aac06534a38a2c8509a113a9dd57eebf13');

// OLD 0xda350f2c3356b8dbda3b42130f6893ae8aaadfc7
export default instance;
