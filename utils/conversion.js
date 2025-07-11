const { ObjectId } = require("mongodb");

const mongoIdToUint256 = (mongoId) => {
    const objectId = mongoId instanceof ObjectId ? mongoId : new ObjectId(mongoId); // Ensure it's an ObjectId
    return BigInt("0x" + objectId.toHexString()).toString(); // Convert to uint256
};

const uint256ToMongoId = (uint256Value) => {
    const hexString = BigInt(uint256Value).toString(16).padStart(24, "0"); // Ensure 24-character hex
    return new ObjectId(hexString);
};

module.exports = { mongoIdToUint256, uint256ToMongoId };
