const router = require("express").Router();
const {
  keccak256,
  encodePacked,
  encodeAbiParameters,
  parseAbiParameters,
} = require("viem");

const { ethers } = require("ethers");
router.post("/compute-merkle-root", async (req, res) => {
  const { points } = req.body;
  const hexValues = points.map((point) =>
    keccak256(`0x${point.toString(16).padStart(64, "0")}`)
  );

  function recursiveMerkleRoot(hashes) {
    if (hashes.length === 1) {
      return hashes[0];
    }

    const nextLevelHashes = [];

    for (let i = 0; i < hashes.length; i += 2) {
      const left = hashes[i];
      const right = i + 1 < hashes.length ? hashes[i + 1] : "0x";
      const combinedHash = keccak256(
        encodePacked(["bytes32", "bytes32"], [left, right])
      );
      nextLevelHashes.push(combinedHash);
    }

    return recursiveMerkleRoot(nextLevelHashes);
  }

  res.status(200).json({
    merkleRoot: recursiveMerkleRoot(hexValues),
  });
});
router.post("/encode-return-data", async (req, res) => {
  const { merkleRoot, ipfsHash } = req.body;
  const returnDataHex = encodeAbiParameters(
    parseAbiParameters("bytes32, string"),
    [merkleRoot, ipfsHash]
  );
  res.set("Content-Type", "application/json");
  res.status(200).send({
    returnData: returnDataHex,
  });
});

module.exports = router;
