async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy contract
  const FractionalOwnership = await ethers.getContractFactory("FractionalOwnership");
  const fractionalOwnership = await FractionalOwnership.deploy();

  // Wait for contract deployment
  await fractionalOwnership.waitForDeployment();

  // Get deployed contract address
  const contractAddress = await fractionalOwnership.getAddress();
  
  console.log("FractionalOwnership contract deployed to:", contractAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error("Deployment failed:", error);
      process.exit(1);
  });
