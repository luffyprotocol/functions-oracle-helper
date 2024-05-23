const router = require("express").Router();
const {
  keccak256,
  encodePacked,
  encodeAbiParameters,
  parseAbiParameters,
  toBytes,
} = require("viem");

const { ethers } = require("ethers");

function padArrayWithZeros(array) {
  const paddedLength = Math.pow(2, Math.ceil(Math.log2(array.length)));
  return array.concat(
    Array.from({ length: paddedLength - array.length }, () => 0)
  );
}

function uint8ArrayToBase64(uint8Array) {
  const binaryString = String.fromCharCode.apply(null, uint8Array);
  return Buffer.from(binaryString, "binary").toString("base64");
}

router.post("/compute-merkle-root", async (req, res) => {
  const { points } = req.body;

  const hexValues = padArrayWithZeros(points).map((point) =>
    keccak256(`0x${point.toString(16).padStart(64, "0")}`)
  );
  console.log(hexValues);

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
    returnData: uint8ArrayToBase64(toBytes(returnDataHex)),
  });
});

module.exports = router;
