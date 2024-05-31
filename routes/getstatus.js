const router = require("express").Router();
const {
  getProviderRpcUrl, // Function to get the RPC URL for a given blockchain.
  getRouterConfig, // Function to get configuration for the router smart contract.
  getMessageStatus, // Function to translate numeric message status codes into human-readable strings.
} = require("../config");

const { ethers, JsonRpcProvider } = require("ethers");

const routerAbi = require("../constants/abi/Router.json"); // Load Router contract ABI.
const offRampAbi = require("../constants/abi/OffRamp.json");

const getStatus = async (chain, targetChain, messageId) => {
  const destinationRpcUrl = getProviderRpcUrl(targetChain);
  const sourceRpcUrl = getProviderRpcUrl(chain);

  // Initialize providers to connect to the blockchain networks.
  const destinationProvider = new JsonRpcProvider(destinationRpcUrl);
  const sourceProvider = new JsonRpcProvider(sourceRpcUrl);

  // Get configuration for routers on both chains.
  const sourceRouterAddress = getRouterConfig(chain).router;
  const sourceChainSelector = getRouterConfig(chain).chainSelector;
  const destinationRouterAddress = getRouterConfig(targetChain).router;
  const destinationChainSelector = getRouterConfig(targetChain).chainSelector;

  // Instantiate router contracts with ethers for both source and destination chains.
  const sourceRouterContract = new ethers.Contract(
    sourceRouterAddress,
    routerAbi,
    sourceProvider
  );
  // Check if the destination chain is supported by the source chain's router.
  const isChainSupported = await sourceRouterContract.isChainSupported(
    destinationChainSelector
  );
  if (!isChainSupported) {
    throw new Error(`Lane ${chain}->${targetChain} is not supported`);
  }

  const destinationRouterContract = new ethers.Contract(
    destinationRouterAddress,
    routerAbi,
    destinationProvider
  );

  // Fetch OffRamp contracts associated with the destination router contract.
  const offRamps = await destinationRouterContract.getOffRamps();
  // Filter for the OffRamps that match the source chain.
  const matchingOffRamps = offRamps.filter(
    (offRamp) => offRamp.sourceChainSelector.toString() === sourceChainSelector
  );

  // Check each matching OffRamp for the message ID.
  for (const matchingOffRamp of matchingOffRamps) {
    const offRampContract = new ethers.Contract(
      matchingOffRamp.offRamp,
      offRampAbi,
      destinationProvider
    );
    // Query for events indicating a change in execution state for the given message ID.
    const events = await offRampContract.queryFilter(
      offRampContract.filters.ExecutionStateChanged(undefined, messageId)
    );

    if (events.length > 0) {
      // If events are found, log the status and exit.
      const { state } = events[0].args;

      const status = getMessageStatus(state);

      console.log(
        `Status of message ${messageId} on offRamp ${matchingOffRamp.offRamp} is ${status}\n`
      );
      return status;
    }
  }

  // If no events are found, it's likely the message hasn't been processed or doesn't exist on the destination chain.
  console.log(
    `Either the message ${messageId} does not exist OR it has not been processed yet on destination chain\n`
  );
};

router.post("/get-status", async (req, res) => {
  const { chain, targetChain, messageId } = req.body;
  const status = await getStatus(chain, targetChain, messageId);
  if (status) {
    res.status(200).json({
      status: status,
      chain: chain,
      targetChain: targetChain,
      messageId: messageId,
    });
  } else {
    res.status(200).json({
      status: `Either the message ${messageId} does not exist OR it has not been processed yet on destination chain`,
      chain: chain,
      targetChain: targetChain,
      messageId: messageId,
    });
  }
});

module.exports = router;
