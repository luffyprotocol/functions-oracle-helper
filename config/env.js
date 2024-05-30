const { supportedNetworks } = require("./router");
require("dotenv").config();

const getRpcUrlName = (network) =>
  network.replace(/([A-Z])/g, "_$1").toUpperCase() + "_RPC_URL";

const getProviderRpcUrl = (network) => {
  if (!supportedNetworks.includes(network))
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
