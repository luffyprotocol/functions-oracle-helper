const router = require("express").Router();
const {
  keccak256,
  encodePacked,
  encodeAbiParameters,
  parseAbiParameters,
  hexToBytes,
} = require("viem");

router.post("/compute-merkle-root", async (req, res) => {
  const { playerPoints } = req.body;
  const hexValues = padArrayWithZeros(playerPoints).map((point) =>
    keccak256(`0x${point.toString(16).padStart(64, "0")}`)
  );

  function padArrayWithZeros(array) {
    const paddedLength = Math.pow(2, Math.ceil(Math.log2(array.length)));
    return array.concat(
      Array.from({ length: paddedLength - array.length }, () => 0)
    );
  }

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

module.exports = router;