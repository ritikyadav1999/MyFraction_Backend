const { ethers } = require("hardhat");

async function main() {
    const [signer] = await ethers.getSigners();
    console.log("Using signer:", signer.address);

    const contractAddress = "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512";

    // Check if contract exists
    const abi = require("../artifacts/contracts/FractionalOwnership.sol/FractionalOwnership.json").abi;
    const fractionalOwnership = new ethers.Contract(contractAddress, abi, signer);

    if (!fractionalOwnership) {
        console.error("Contract not found!");
        return;
    }

    try {
        const totalShares = await fractionalOwnership.totalShares(10);
        console.log("Total Shares:", totalShares.toString());
    } catch (error) {
        console.error("Error calling totalShares:", error);
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
