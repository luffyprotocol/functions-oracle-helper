require("dotenv").config();
const supportedNetworksTestnet = require("../constants/testnet.json");
const { merge } = require("lodash");

const getRpcUrlName = (network) => {
  if (network == "11155111") return "ETHEREUM_SEPOLIA_RPC_URL";
  else if (network == "11155420") return "OPTIMISM_SEPOLIA_RPC_URL";
  else if (network == "43113") return "AVALANCHE_FUJI_RPC_URL";
  else if (network == "421614") return "ARBITRUM_SEPOLIA_RPC_URL";
  else return "BASE_SEPOLIA_RPC_URL";
};

const getProviderRpcUrl = (network) => {
  if (supportedNetworksTestnet[network] === undefined)
    throw new Error("Unsupported network: " + network);

  const environmentVariableName = getRpcUrlName(network);

  const rpcUrl = process.env[environmentVariableName];

  if (!rpcUrl)
    throw new Error(
      `rpcUrl empty for network ${network} - check your environment variables`
    );
  return rpcUrl;
};

const getPrivateKey = () => {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey)
    throw new Error(
      "private key not provided - check your environment variables"
    );
  return privateKey;
};

module.exports = {
  getPrivateKey,
  getProviderRpcUrl,
};
