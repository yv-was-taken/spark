// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IEntropy} from "@pythnetwork/entropy-sdk-solidity/IEntropy.sol";
import {IEntropyConsumer} from "@pythnetwork/entropy-sdk-solidity/IEntropyConsumer.sol";

/**
 * @title SparkLottery
 * @notice A lottery contract where users buy tickets and win prizes based on Pyth Entropy randomness
 * @dev Integrates with Pyth Entropy for verifiable randomness
 */
contract SparkLottery is IEntropyConsumer {
    // Pyth Entropy variables
    IEntropy private immutable entropy;
    address private immutable entropyProvider;

    // Ticket tiers
    enum TicketTier {
        BRONZE,
        SILVER,
        GOLD
    }

    // Ticket structure
    struct Ticket {
        address owner;
        TicketTier tier;
        bool claimed;
        uint256 timestamp;
    }

    // Prize tier configuration
    struct PrizeTier {
        uint256 price; // in wei
        uint256[] prizes; // possible prize amounts
        uint256 winProbability; // out of 10000 (e.g., 2000 = 20%)
    }

    // State variables
    address public owner;
    mapping(uint256 => Ticket) public tickets;
    mapping(uint64 => uint256) public sequenceNumberToTicketId; // Pyth sequence number to ticket ID
    uint256 public ticketCounter;

    mapping(TicketTier => PrizeTier) public prizeTiers;

    // Events
    event TicketPurchased(
        uint256 indexed ticketId,
        address indexed buyer,
        TicketTier tier,
        uint256 price
    );
    event TicketStruck(uint256 indexed ticketId, uint64 sequenceNumber);
    event PrizeWon(
        uint256 indexed ticketId,
        address indexed winner,
        uint256 amount
    );
    event PrizeLost(uint256 indexed ticketId, address indexed player);

    // Errors
    error SparkLottery__InsufficientPayment();
    error SparkLottery__NotTicketOwner();
    error SparkLottery__TicketAlreadyClaimed();
    error SparkLottery__TransferFailed();
    error SparkLottery__OnlyOwner();

    modifier onlyOwner() {
        if (msg.sender != owner) revert SparkLottery__OnlyOwner();
        _;
    }

    /**
     * @notice Constructor to initialize the lottery contract
     * @param _entropy Address of the Pyth Entropy contract
     * @param _entropyProvider Address of the entropy provider
     */
    constructor(
        address _entropy,
        address _entropyProvider
    ) {
        entropy = IEntropy(_entropy);
        entropyProvider = _entropyProvider;
        owner = msg.sender;

        // Initialize prize tiers
        // Bronze: 0.001 ETH (~$2)
        prizeTiers[TicketTier.BRONZE] = PrizeTier({
            price: 0.001 ether,
            prizes: new uint256[](3),
            winProbability: 2000 // 20% (1 in 5)
        });
        prizeTiers[TicketTier.BRONZE].prizes[0] = 0.0025 ether; // $5
        prizeTiers[TicketTier.BRONZE].prizes[1] = 0.005 ether; // $10
        prizeTiers[TicketTier.BRONZE].prizes[2] = 0.0125 ether; // $25

        // Silver: 0.005 ETH (~$10)
        prizeTiers[TicketTier.SILVER] = PrizeTier({
            price: 0.005 ether,
            prizes: new uint256[](3),
            winProbability: 2500 // 25% (1 in 4)
        });
        prizeTiers[TicketTier.SILVER].prizes[0] = 0.005 ether; // $10
        prizeTiers[TicketTier.SILVER].prizes[1] = 0.0125 ether; // $25
        prizeTiers[TicketTier.SILVER].prizes[2] = 0.025 ether; // $50

        // Gold: 0.01 ETH (~$20)
        prizeTiers[TicketTier.GOLD] = PrizeTier({
            price: 0.01 ether,
            prizes: new uint256[](3),
            winProbability: 3333 // 33.33% (1 in 3)
        });
        prizeTiers[TicketTier.GOLD].prizes[0] = 0.0125 ether; // $25
        prizeTiers[TicketTier.GOLD].prizes[1] = 0.025 ether; // $50
        prizeTiers[TicketTier.GOLD].prizes[2] = 0.05 ether; // $100
    }

    /**
     * @notice Purchase a lottery ticket
     * @param tier The tier of ticket to purchase
     * @return ticketId The ID of the purchased ticket
     */
    function buyTicket(TicketTier tier) external payable returns (uint256) {
        PrizeTier memory prizeTier = prizeTiers[tier];

        if (msg.value < prizeTier.price) {
            revert SparkLottery__InsufficientPayment();
        }

        uint256 ticketId = ticketCounter++;

        tickets[ticketId] = Ticket({
            owner: msg.sender,
            tier: tier,
            claimed: false,
            timestamp: block.timestamp
        });

        emit TicketPurchased(ticketId, msg.sender, tier, prizeTier.price);

        return ticketId;
    }

    /**
     * @notice Strike (burn) a ticket to reveal the outcome
     * @param ticketId The ID of the ticket to strike
     * @param userRandomNumber User-provided random number for entropy
     * @return sequenceNumber The Pyth entropy sequence number
     */
    function strikeTicket(
        uint256 ticketId,
        bytes32 userRandomNumber
    ) external payable returns (uint64) {
        Ticket storage ticket = tickets[ticketId];

        if (ticket.owner != msg.sender) {
            revert SparkLottery__NotTicketOwner();
        }

        if (ticket.claimed) {
            revert SparkLottery__TicketAlreadyClaimed();
        }

        // Mark as claimed immediately to prevent re-entry
        ticket.claimed = true;

        // Get the fee for requesting randomness
        uint128 fee = entropy.getFee(entropyProvider);

        // Request randomness from Pyth Entropy
        uint64 sequenceNumber = entropy.requestWithCallback{value: fee}(
            entropyProvider,
            userRandomNumber
        );

        sequenceNumberToTicketId[sequenceNumber] = ticketId;

        emit TicketStruck(ticketId, sequenceNumber);

        return sequenceNumber;
    }

    /**
     * @notice Callback function called by Pyth Entropy
     * @param sequenceNumber The sequence number of the request
     * @param provider The provider address
     * @param randomNumber The random number generated
     */
    function entropyCallback(
        uint64 sequenceNumber,
        address provider,
        bytes32 randomNumber
    ) internal override {
        require(provider == entropyProvider, "Invalid provider");

        uint256 ticketId = sequenceNumberToTicketId[sequenceNumber];
        Ticket storage ticket = tickets[ticketId];
        PrizeTier memory prizeTier = prizeTiers[ticket.tier];

        uint256 randomValue = uint256(randomNumber);

        // Determine if player wins (out of 10000)
        uint256 outcomeNumber = randomValue % 10000;
        bool isWinner = outcomeNumber < prizeTier.winProbability;

        if (isWinner) {
            // Determine prize amount
            uint256 prizeIndex = randomValue % prizeTier.prizes.length;
            uint256 prizeAmount = prizeTier.prizes[prizeIndex];

            // Transfer prize
            (bool success, ) = ticket.owner.call{value: prizeAmount}("");
            if (!success) {
                revert SparkLottery__TransferFailed();
            }

            emit PrizeWon(ticketId, ticket.owner, prizeAmount);
        } else {
            emit PrizeLost(ticketId, ticket.owner);
        }
    }

    /**
     * @notice Returns the address of the entropy contract
     */
    function getEntropy() internal view override returns (address) {
        return address(entropy);
    }

    /**
     * @notice Update prize tier configuration (owner only)
     */
    function updatePrizeTier(
        TicketTier tier,
        uint256 price,
        uint256[] calldata prizes,
        uint256 winProbability
    ) external onlyOwner {
        prizeTiers[tier].price = price;
        prizeTiers[tier].prizes = prizes;
        prizeTiers[tier].winProbability = winProbability;
    }

    /**
     * @notice Withdraw contract balance (owner only)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = owner.call{value: balance}("");
        if (!success) {
            revert SparkLottery__TransferFailed();
        }
    }

    /**
     * @notice Get ticket information
     */
    function getTicket(
        uint256 ticketId
    ) external view returns (Ticket memory) {
        return tickets[ticketId];
    }

    /**
     * @notice Get prize tier information
     */
    function getPrizeTier(
        TicketTier tier
    ) external view returns (PrizeTier memory) {
        return prizeTiers[tier];
    }

    /**
     * @notice Allow contract to receive ETH
     */
    receive() external payable {}
}
