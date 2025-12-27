'use client';

import { useWalletClient, usePublicClient, useWatchContractEvent } from 'wagmi';
import { parseEther, encodePacked, keccak256 } from 'viem';
import { LOTTERY_CONTRACT_ADDRESS, LOTTERY_ABI, TicketTier } from '../contracts';
import { useState, useCallback } from 'react';

export function useSparkLottery() {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [isLoading, setIsLoading] = useState(false);

  const buyTicket = useCallback(
    async (tier: TicketTier) => {
      if (!walletClient || !publicClient) {
        throw new Error('Wallet not connected');
      }

      setIsLoading(true);
      try {
        // Get the price for the tier
        const tierData = await publicClient.readContract({
          address: LOTTERY_CONTRACT_ADDRESS,
          abi: LOTTERY_ABI,
          functionName: 'getPrizeTier',
          args: [tier],
        });

        const price = tierData.price;

        // Buy the ticket
        const hash = await walletClient.writeContract({
          address: LOTTERY_CONTRACT_ADDRESS,
          abi: LOTTERY_ABI,
          functionName: 'buyTicket',
          args: [tier],
          value: price,
        });

        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        // Extract ticket ID from the event logs
        const log = receipt.logs.find(
          (log) =>
            log.address.toLowerCase() === LOTTERY_CONTRACT_ADDRESS.toLowerCase()
        );

        if (!log) {
          throw new Error('Ticket purchase failed');
        }

        // Decode the TicketPurchased event to get the ticket ID
        const decodedLog = publicClient.parseLogs({
          abi: LOTTERY_ABI,
          logs: [log],
        })[0];

        const ticketId = decodedLog.args.ticketId;

        return { ticketId, hash };
      } finally {
        setIsLoading(false);
      }
    },
    [walletClient, publicClient]
  );

  const strikeTicket = useCallback(
    async (ticketId: bigint) => {
      if (!walletClient || !publicClient) {
        throw new Error('Wallet not connected');
      }

      setIsLoading(true);
      try {
        // Generate a random number for entropy
        const randomBytes = new Uint8Array(32);
        crypto.getRandomValues(randomBytes);
        const userRandomNumber = `0x${Array.from(randomBytes)
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('')}` as `0x${string}`;

        // TODO: Get the actual fee from the entropy contract
        // For now, we'll use a placeholder value
        const fee = parseEther('0.0001');

        const hash = await walletClient.writeContract({
          address: LOTTERY_CONTRACT_ADDRESS,
          abi: LOTTERY_ABI,
          functionName: 'strikeTicket',
          args: [ticketId, userRandomNumber],
          value: fee,
        });

        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        return { hash, receipt };
      } finally {
        setIsLoading(false);
      }
    },
    [walletClient, publicClient]
  );

  const getTicket = useCallback(
    async (ticketId: bigint) => {
      if (!publicClient) {
        throw new Error('Public client not available');
      }

      const ticket = await publicClient.readContract({
        address: LOTTERY_CONTRACT_ADDRESS,
        abi: LOTTERY_ABI,
        functionName: 'getTicket',
        args: [ticketId],
      });

      return ticket;
    },
    [publicClient]
  );

  return {
    buyTicket,
    strikeTicket,
    getTicket,
    isLoading,
  };
}

export function useWatchPrizeEvents(onPrize: (args: {
  ticketId: bigint;
  winner: string;
  amount?: bigint;
  isWinner: boolean;
}) => void) {
  // Watch for PrizeWon events
  useWatchContractEvent({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: LOTTERY_ABI,
    eventName: 'PrizeWon',
    onLogs(logs) {
      logs.forEach((log) => {
        if (log.args.ticketId && log.args.winner && log.args.amount) {
          onPrize({
            ticketId: log.args.ticketId,
            winner: log.args.winner,
            amount: log.args.amount,
            isWinner: true,
          });
        }
      });
    },
  });

  // Watch for PrizeLost events
  useWatchContractEvent({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: LOTTERY_ABI,
    eventName: 'PrizeLost',
    onLogs(logs) {
      logs.forEach((log) => {
        if (log.args.ticketId && log.args.player) {
          onPrize({
            ticketId: log.args.ticketId,
            winner: log.args.player,
            isWinner: false,
          });
        }
      });
    },
  });
}
