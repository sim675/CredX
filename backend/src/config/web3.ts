import Web3 from 'web3';

// Polygon Mainnet URL
const POLYGON_MAINNET_URL = 'https://polygon-rpc.com/';

// Create a new instance of Web3
const web3 = new Web3(new Web3.providers.HttpProvider(POLYGON_MAINNET_URL));

export default web3;
