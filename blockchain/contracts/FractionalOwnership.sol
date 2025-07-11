// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract FractionalOwnership {
    address public admin; // Admin role
    mapping(address => bool) public isAdmin;

    struct Investment {
        uint256 investmentId;
        address investor;
        uint256 propertyId;
        uint128 amount;
        uint8 ownershipPercentage;
        uint256 timestamp;
        bool isListed;
        uint128 askingPrice;
    }

    // investmentId ===> Investmet
    mapping(uint256 => Investment) public investments;

    // propertyId ======> investmentId[]
    mapping(uint256 => uint256[]) public propertyInvestments;

    // wallet ======> investmentId[]
    mapping(address => uint256[]) public investorInvestments;

    event InvestmentRecorded(
        uint256 investmentId,
        uint256 indexed propertyId,
        address indexed investor,
        uint128 amount,
        uint8 ownershipPercentage,
        uint256 timestamp
    );

    event InvestmentUpdated(
        uint256 investmentId,
        uint256 indexed propertyId,
        address indexed oldInvestor,
        address indexed newInvestor,
        uint128 amount,
        uint256 timestamp
    );

    event OwnershipTransferred(
        uint256 investmentId,
        address indexed oldInvestor,
        address indexed newInvestor,
        uint128 amount,
        uint256 timestamp
    );

    event InvestmentListed(
        uint256 investmentId,
        address indexed investor,
        uint128 askingPrice,
        uint256 timestamp
    );

    event InvestmentUnListed(
        uint256 investmentId,
        address indexed investor,
        uint256 timestamp
    );

    modifier onlyAdmin() {
        require(isAdmin[msg.sender], "Only admin can perform this action");
        _;
    }

    modifier onlyOwner(uint256 _investmentId, address _investor) {
        require(
            investments[_investmentId].investor == _investor,
            "No Authorization"
        );
        _;
    }

    constructor() {
        admin = msg.sender;
        isAdmin[admin] = true;
    }

    // Admin can add or remove other admins;
    function addAdmin(address _admin) external onlyAdmin {
        isAdmin[_admin] = true;
    }

    function removeAdmin(address _admin) external onlyAdmin {
        isAdmin[_admin] = false;
    }

    // Record new investment in a property
    function recordInvestment(
        uint256 investmentId,
        uint256 _propertyId,
        address _investor,
        uint128 _amount,
        uint8 _ownershipPercentage
    ) public {
        require(_amount > 0, "Investment amount should be greater than zero");

        // Store the investment struct directly in the mapping
        investments[investmentId] = Investment({
            investmentId: investmentId,
            investor: _investor,
            propertyId: _propertyId,
            amount: _amount,
            ownershipPercentage: _ownershipPercentage,
            timestamp: block.timestamp,
            isListed: false,
            askingPrice: 0
        });

        // Update tracking mappings
        propertyInvestments[_propertyId].push(investmentId);
        investorInvestments[_investor].push(investmentId);

        // Emit the event
        emit InvestmentRecorded(
            investmentId,
            _propertyId,
            _investor,
            _amount,
            _ownershipPercentage,
            block.timestamp
        );
    }

    // List an investment for sale by the owner
    function listInvestmentForSale(
        uint256 _investmentId,
        address _investor,
        uint128 _askingPrice
    ) public onlyOwner(_investmentId, _investor) {
        require(investments[_investmentId].amount > 0, "No investment found");
        require(!investments[_investmentId].isListed, "Already listed");

        investments[_investmentId].isListed = true;
        investments[_investmentId].askingPrice = _askingPrice;

        emit InvestmentListed(
            _investmentId,
            _investor,
            _askingPrice,
            block.timestamp
        );
    }

    // Cancel listing if needed
    function cancelListForSale(
        uint _investmentId,
        address _investor
    ) public onlyOwner(_investmentId, _investor) {
        require(
            investments[_investmentId].isListed,
            "Investment is not listed"
        );

        investments[_investmentId].isListed = false;
        investments[_investmentId].askingPrice = 0;

        emit InvestmentUnListed(_investmentId, _investor, block.timestamp);
    }

    // Transfer ownership when user buys fractions from another investor
    // function transferOwnership(
    //     uint256 _investmentId,
    //     address _seller,
    //     address _buyer,
    //     uint128 _amount
    // ) external {
    //     // Retrieve the seller's investment details
    //     Investment storage investment = investments[_investmentId];
    //     require(investment.isListed, "Investment is not listed for sale");

    //     uint256 propertyId = investment.propertyId; // Store before deletion
    //     delete investments[_investmentId];

    //     // Use the stored propertyId after deletion
    //     recordInvestment(propertyId, _buyer, _amount, 100);

    //     // Emit event for ownership transfer
    //     emit OwnershipTransferred(
    //         _investmentId,
    //         _seller,
    //         _buyer,
    //         _amount,
    //         block.timestamp
    //     );
    // }

    // Update an existing investment by admin
    // function updateInvestmentOwnership(
    //     uint256 _propertyId,
    //     address _oldInvestor,
    //     address _newInvestor
    // ) public onlyAdmin {}

    // Get all investments for a property
    function fetchInvestmentsByPropertyId(
        uint256 _propertyId
    ) public view returns (Investment[] memory) {
        uint256[] memory allInvestments = propertyInvestments[_propertyId];
        Investment[] memory result = new Investment[](allInvestments.length); // Fix: Allocate memory with correct size

        for (uint i = 0; i < allInvestments.length; i++) {
            uint256 investmentId = allInvestments[i];
            result[i] = investments[investmentId]; // Fix: Ensure array size matches `allInvestments.length`
        }
        return result;
    }

    function fetchAllInvestmentsByInvestor(
        address _investor
    ) public view returns (Investment[] memory) {
        uint256[] memory allInvestmentIds = investorInvestments[_investor]; // Get investment IDs
        Investment[] memory result = new Investment[](allInvestmentIds.length); // Allocate memory correctly

        for (uint i = 0; i < allInvestmentIds.length; i++) {
            uint256 investmentId = allInvestmentIds[i];
            result[i] = investments[investmentId]; // Fetch the actual investment struct
        }
        return result;
    }

    // Pause contract in case of emergency
    bool public isPaused = false;

    modifier notPaused() {
        require(!isPaused, "Contract is paused");
        _;
    }

    function pauseContract() external onlyAdmin {
        isPaused = true;
    }

    function unpauseContract() external onlyAdmin {
        isPaused = false;
    }
}
