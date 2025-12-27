'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Zap, Coins } from 'lucide-react';

interface TicketTier {
  id: string;
  name: string;
  price: string;
  priceUSD: number;
  maxPrize: string;
  odds: string;
  color: string;
}

const TICKET_TIERS: TicketTier[] = [
  {
    id: 'bronze',
    name: 'Bronze Strike',
    price: '0.001',
    priceUSD: 2,
    maxPrize: '$25',
    odds: '1 in 5',
    color: 'from-orange-400 to-orange-600',
  },
  {
    id: 'silver',
    name: 'Silver Spark',
    price: '0.005',
    priceUSD: 10,
    maxPrize: '$50',
    odds: '1 in 4',
    color: 'from-gray-300 to-gray-500',
  },
  {
    id: 'gold',
    name: 'Gold Lightning',
    price: '0.01',
    priceUSD: 20,
    maxPrize: '$100',
    odds: '1 in 3',
    color: 'from-yellow-300 to-yellow-600',
  },
];

interface TicketPurchaseProps {
  onPurchase: (tierId: string) => void;
}

export function TicketPurchase({ onPurchase }: TicketPurchaseProps) {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const handleBuyTicket = (tierId: string) => {
    setSelectedTier(tierId);
    onPurchase(tierId);
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-12 text-center">
        <h2 className="mb-4 text-4xl font-bold">
          Choose Your <span className="text-spark-orange">Ticket</span>
        </h2>
        <p className="text-lg text-foreground/70">
          Pick a ticket tier and test your luck with instant wins
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {TICKET_TIERS.map((tier) => (
          <motion.div
            key={tier.id}
            className="group relative overflow-hidden rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-8 transition-all hover:border-spark-blue/50"
            whileHover={{ y: -8, scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Gradient Background */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${tier.color} opacity-5 transition-opacity group-hover:opacity-10`}
            />

            <div className="relative">
              {/* Icon */}
              <div className="mb-6 inline-flex rounded-2xl bg-[var(--background)] p-4">
                <Ticket className="h-10 w-10 text-spark-orange" />
              </div>

              {/* Tier Name */}
              <h3 className="mb-2 text-2xl font-bold">{tier.name}</h3>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-spark-blue">
                    {tier.price}
                  </span>
                  <span className="text-xl text-foreground/50">ETH</span>
                </div>
                <p className="text-sm text-foreground/50">≈ ${tier.priceUSD} USD</p>
              </div>

              {/* Stats */}
              <div className="mb-8 space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-[var(--background)] p-3">
                  <span className="text-sm text-foreground/70">Max Prize</span>
                  <span className="font-bold text-spark-orange">{tier.maxPrize}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-[var(--background)] p-3">
                  <span className="text-sm text-foreground/70">Win Odds</span>
                  <span className="font-bold text-spark-blue">{tier.odds}</span>
                </div>
              </div>

              {/* Buy Button */}
              <motion.button
                onClick={() => handleBuyTicket(tier.id)}
                className="group/btn relative w-full overflow-hidden rounded-full bg-gradient-to-r from-spark-orange to-spark-orange-dark px-6 py-3 font-bold text-white shadow-lg transition-all hover:shadow-spark-orange/50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Zap className="h-5 w-5" />
                  Buy Ticket
                </span>
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Info Box */}
      <motion.div
        className="mt-12 rounded-2xl border border-spark-blue/20 bg-spark-blue/5 p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-spark-blue/20 p-2">
            <Coins className="h-6 w-6 text-spark-blue" />
          </div>
          <div>
            <h4 className="mb-2 font-bold text-spark-blue">How It Works</h4>
            <ul className="space-y-1 text-sm text-foreground/70">
              <li>• Choose your ticket tier based on your budget</li>
              <li>• Scratch to reveal symbols - match 3 or more to win!</li>
              <li>• Winnings are automatically sent to your wallet via smart contract</li>
              <li>• All results are verifiably random using Pyth Entropy</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
