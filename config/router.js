const supportedNetworksTestnet = require("../constants/testnet.json");
const getRouterConfig = (network) => {
  const config = supportedNetworksTestnet[network];
  if (!config || Object.keys(config).length === 0) {
    throw new Error("No config found for network: " + network);
  }

  return config;
};

module.exports = {
  getRouterConfig,
};
