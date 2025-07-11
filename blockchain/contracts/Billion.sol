// SPDX-License-Identifier: MIT
 pragma solidity ^0.8.20;

// import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
// import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
// import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
// import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
// import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";

// contract BlockEstate is
//     Initializable,
//     OwnableUpgradeable,
//     ReentrancyGuardUpgradeable,
//     UUPSUpgradeable,
//     ERC1155Upgradeable
// {
//     struct Property {
//         uint256 id;
//         string name;
//         uint256 totalPrice;
//         // uint256 availableShares;
//         address owner;
//         bool isLocked;
//         string location;
//         string imageHash;
//     }

//     struct User {
//         address wallet;
//         bytes32 specialKeyHash;
//         bool registered;
//     }

//     struct SaleListing {
//         uint256 propertyId;
//         address seller;
//         uint256 shares;
//         uint256 pricePerShare;
//         bool isActive;
//     }

//     struct Reservation {
//         address buyer;
//         uint256 shares;
//         uint256 timestamp;
//         bool active;
//     }

//     mapping(uint256 => Property) public properties;
//     mapping(address => User) public users;
//     mapping(uint256 => SaleListing) public listings;
//     mapping(uint256 => Reservation) public reservations;
//     mapping(address => bool) public whitelistedUsers;
//     mapping(address => bool) public kycVerified;

//     uint256 public propertyCount;
//     uint256 public listingCount;

//     event PropertyListed(
//         uint256 indexed propertyId,
//         string name,
//         uint256 totalPrice,
//         string location,
//         address owner
//     );
//     event FractionBought(
//         uint256 indexed propertyId,
//         address indexed buyer,
//         uint256 shares
//     );
//     event OwnershipTransferred(
//         uint256 indexed propertyId,
//         address indexed from,
//         address indexed to,
//         uint256 shares
//     );
//     event PropertyLocked(uint256 indexed propertyId, bool locked);
//     event SharesListedForSale(
//         uint256 indexed listingId,
//         uint256 indexed propertyId,
//         address seller,
//         uint256 shares,
//         uint256 price
//     );
//     event SharesPurchased(
//         uint256 indexed listingId,
//         address indexed buyer,
//         uint256 shares
//     );
//     event SharesReserved(
//         uint256 indexed propertyId,
//         address indexed buyer,
//         uint256 shares
//     );
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
//         require(
//             properties[propertyId].owner == msg.sender,
//             "Not property owner"
//         );
//         _;
//     }

//     modifier notLocked(uint256 propertyId) {
//         require(!properties[propertyId].isLocked, "Property is locked");
//         _;
//     }

//     modifier onlyWhitelisted() {
//         require(whitelistedUsers[msg.sender], "Not whitelisted");
//         _;
//     }

//     function initialize() public initializer {
//         __Ownable_init(msg.sender);
//         __ReentrancyGuard_init();
//         __UUPSUpgradeable_init();
//         __ERC1155_init("https://api.blockestate.com/api/metadata/{id}.json");
//     }

//     function _authorizeUpgrade(
//         address newImplementation
//     ) internal override onlyOwner {}

//     function registerUser(bytes32 specialKeyHash) external {
//         require(!users[msg.sender].registered, "User already registered");
//         users[msg.sender] = User(msg.sender, specialKeyHash, true);
//     }

//     function verifyUserKYC(address user) external onlyOwner {
//         kycVerified[user] = true;
//         emit UserKYCVerified(user, true);
//     }

//     function whitelistUser(address user) external onlyOwner {
//         whitelistedUsers[user] = true;
//     }

//     function listProperty(
//         string memory name,
//         uint256 totalPrice,
//         uint256 shares,
//         string memory location,
//         string memory imageHash
//     ) external onlyWhitelisted onlyKYCVerified {
//         propertyCount++;
//         properties[propertyCount] = Property(
//             propertyCount,
//             name,
//             totalPrice,
//             shares,
//             msg.sender,
//             false,
//             location,
//             imageHash
//         );

//         _mint(msg.sender, propertyCount, shares, "");
//         emit PropertyListed(
//             propertyCount,
//             name,
//             totalPrice,
//             location,
//             msg.sender
//         );
//     }

//     function reserveShares(
//         uint256 propertyId,
//         uint256 shares
//     ) external onlyRegisteredUser onlyKYCVerified notLocked(propertyId) {
//         require(
//             properties[propertyId].availableShares >= shares,
//             "Not enough shares available"
//         );
//         require(!reservations[propertyId].active, "Shares already reserved");

//         reservations[propertyId] = Reservation(
//             msg.sender,
//             shares,
//             block.timestamp,
//             true
//         );
//         properties[propertyId].availableShares -= shares;
//         emit SharesReserved(propertyId, msg.sender, shares);
//     }

//     function finalizePurchase(
//         uint256 propertyId
//     ) external onlyRegisteredUser onlyKYCVerified {
//         require(reservations[propertyId].active, "No active reservation");
//         require(
//             reservations[propertyId].buyer == msg.sender,
//             "Not the reserved buyer"
//         );

//         _mint(msg.sender, propertyId, reservations[propertyId].shares, "");
//         delete reservations[propertyId];
//         emit FractionBought(
//             propertyId,
//             msg.sender,
//             reservations[propertyId].shares
//         );
//     }

//     function releaseShares(
//         uint256 propertyId
//     ) external onlyRegisteredUser onlyKYCVerified {
//         require(reservations[propertyId].active, "No active reservation");

//         properties[propertyId].availableShares += reservations[propertyId]
//             .shares;
//         delete reservations[propertyId];
//         emit SharesReleased(propertyId, reservations[propertyId].shares);
//     }

//     function listSharesForSale(
//         uint256 propertyId,
//         uint256 shares,
//         uint256 pricePerShare
//     ) external onlyRegisteredUser onlyKYCVerified notLocked(propertyId) {
//         require(
//             balanceOf(msg.sender, propertyId) >= shares,
//             "Not enough shares to list for sale"
//         );
//         listingCount++;

//         listings[listingCount] = SaleListing(
//             propertyId,
//             msg.sender,
//             shares,
//             pricePerShare,
//             true
//         );
//         emit SharesListedForSale(
//             listingCount,
//             propertyId,
//             msg.sender,
//             shares,
//             pricePerShare
//         );
//     }

//     function lockProperty(uint256 propertyId, bool lock) external onlyOwner {
//         properties[propertyId].isLocked = lock;
//         emit PropertyLocked(propertyId, lock);
//     }

//     function getAllProperties() external view returns (Property[] memory) {
//         Property[] memory allProperties = new Property[](propertyCount);
//         for (uint256 i = 1; i <= propertyCount; i++) {
//             allProperties[i - 1] = properties[i];
//         }
//         return allProperties;
//     }

//     function getAllListings() external view returns (SaleListing[] memory) {
//         SaleListing[] memory allListings = new SaleListing[](listingCount);
//         for (uint256 i = 1; i <= listingCount; i++) {
//             allListings[i - 1] = listings[i];
//         }
//         return allListings;
//     }
// }
