//  SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
// import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
// import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
// import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

// contract BlockEstate is Initializable, OwnableUpgradeable, ReentrancyGuardUpgradeable, UUPSUpgradeable {
//     struct Property {
//         uint256 id;
//         string name;
//         uint256 totalPrice;
//         uint256 availableShares;
//         address owner;
//         bool isLocked;
//         string location;
//         string imageHash;
//     }

//     struct OwnershipRecord {
//         uint256 propertyId;
//         address owner;
//         uint256 sharesOwned;
//     }

//     struct User {
//         address wallet;
//         bytes32 specialKeyHash;
//         bool registered;
//     }

//     struct Reservation {
//         address buyer;
//         uint256 shares;
//         uint256 timestamp;
//         bool active;
//     }

//     mapping(uint256 => Property) public properties;
//     mapping(address => User) public users;
//     mapping(uint256 => OwnershipRecord[]) public ownershipRecords;
//     mapping(uint256 => Reservation) public reservations;
//     mapping(address => bool) public kycVerified;
    
//     uint256 public propertyCount;

//     event PropertyListed(uint256 indexed propertyId, string name, uint256 totalPrice, string location, address owner);
//     event OwnershipTransferred(uint256 indexed propertyId, address indexed from, address indexed to, uint256 shares);
//     event SharesReserved(uint256 indexed propertyId, address indexed buyer, uint256 shares);
//     event SharesReleased(uint256 indexed propertyId, uint256 shares);
//     event UserKYCVerified(address indexed user, bool verified);

//     modifier onlyRegisteredUser() {
//         require(users[msg.sender].registered, "User not registered");
//         _;
//     }

//     modifier onlyKYCVerified() {
//         require(kycVerified[msg.sender], "User not KYC verified");
//         _;
//     }

//     modifier onlyPropertyOwner(uint256 propertyId) {
//         require(properties[propertyId].owner == msg.sender, "Not property owner");
//         _;
//     }

//     function initialize() public initializer {
//         __Ownable_init(msg.sender);
//         __ReentrancyGuard_init();
//         __UUPSUpgradeable_init();
//     }

//     function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

//     function registerUser(bytes32 specialKeyHash) external {
//         require(!users[msg.sender].registered, "User already registered");
//         users[msg.sender] = User(msg.sender, specialKeyHash, true);
//     }

//     function verifyUserKYC(address user) external onlyOwner {
//         kycVerified[user] = true;
//         emit UserKYCVerified(user, true);
//     }

//     function listProperty(string memory name, uint256 totalPrice, uint256 shares, string memory location, string memory imageHash) 
//         external onlyKYCVerified {
//         propertyCount++;
//         properties[propertyCount] = Property(propertyCount, name, totalPrice, shares, msg.sender, false, location, imageHash);
//         ownershipRecords[propertyCount].push(OwnershipRecord(propertyCount, msg.sender, shares));
//         emit PropertyListed(propertyCount, name, totalPrice, location, msg.sender);
//     }

//     function reserveShares(uint256 propertyId, uint256 shares) external onlyRegisteredUser onlyKYCVerified {
//         require(properties[propertyId].availableShares >= shares, "Not enough shares available");
//         require(!reservations[propertyId].active, "Shares already reserved");
//         reservations[propertyId] = Reservation(msg.sender, shares, block.timestamp, true);
//         properties[propertyId].availableShares -= shares;
//         emit SharesReserved(propertyId, msg.sender, shares);
//     }

//     function finalizePurchase(uint256 propertyId) external onlyRegisteredUser onlyKYCVerified {
//         require(reservations[propertyId].active, "No active reservation");
//         require(reservations[propertyId].buyer == msg.sender, "Not the reserved buyer");

//         ownershipRecords[propertyId].push(OwnershipRecord(propertyId, msg.sender, reservations[propertyId].shares));
//         delete reservations[propertyId];
//         emit OwnershipTransferred(propertyId, properties[propertyId].owner, msg.sender, reservations[propertyId].shares);
//     }

//     function releaseShares(uint256 propertyId) external onlyRegisteredUser onlyKYCVerified {
//         require(reservations[propertyId].active, "No active reservation");
//         properties[propertyId].availableShares += reservations[propertyId].shares;
//         delete reservations[propertyId];
//         emit SharesReleased(propertyId, reservations[propertyId].shares);
//     }

//     function getOwnershipRecords(uint256 propertyId) external view returns (OwnershipRecord[] memory) {
//         return ownershipRecords[propertyId];
//     }
// }
