// Contract ABI will be generated after compilation
// For now, we'll define the minimal ABI needed for interaction

export const LOTTERY_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_LOTTERY_CONTRACT_ADDRESS as `0x${string}`;

export const LOTTERY_ABI = [
  {
    type: "constructor",
    inputs: [
      { name: "_entropy", type: "address" },
      { name: "_entropyProvider", type: "address" }
    ],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "buyTicket",
    inputs: [{ name: "tier", type: "uint8" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "strikeTicket",
    inputs: [
      { name: "ticketId", type: "uint256" },
      { name: "userRandomNumber", type: "bytes32" }
    ],
    outputs: [{ name: "", type: "uint64" }],
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "getTicket",
    inputs: [{ name: "ticketId", type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "owner", type: "address" },
          { name: "tier", type: "uint8" },
          { name: "claimed", type: "bool" },
          { name: "timestamp", type: "uint256" }
        ]
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getPrizeTier",
    inputs: [{ name: "tier", type: "uint8" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "price", type: "uint256" },
          { name: "prizes", type: "uint256[]" },
          { name: "winProbability", type: "uint256" }
        ]
      }
    ],
    stateMutability: "view"
  },
  {
    type: "event",
    name: "TicketPurchased",
    inputs: [
      { name: "ticketId", type: "uint256", indexed: true },
      { name: "buyer", type: "address", indexed: true },
      { name: "tier", type: "uint8", indexed: false },
      { name: "price", type: "uint256", indexed: false }
    ]
  },
  {
    type: "event",
    name: "TicketStruck",
    inputs: [
      { name: "ticketId", type: "uint256", indexed: true },
      { name: "sequenceNumber", type: "uint64", indexed: false }
    ]
  },
  {
    type: "event",
    name: "PrizeWon",
    inputs: [
      { name: "ticketId", type: "uint256", indexed: true },
      { name: "winner", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false }
    ]
  },
  {
    type: "event",
    name: "PrizeLost",
    inputs: [
      { name: "ticketId", type: "uint256", indexed: true },
      { name: "player", type: "address", indexed: true }
    ]
  }
] as const;

export enum TicketTier {
  BRONZE = 0,
  SILVER = 1,
  GOLD = 2
}
