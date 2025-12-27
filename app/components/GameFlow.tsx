'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TicketPurchase } from './TicketPurchase';
import { DragPuzzle } from './puzzles/DragPuzzle';
import { ClickTiles } from './puzzles/ClickTiles';
import { SwipeReveal } from './puzzles/SwipeReveal';
import { ResultsDisplay } from './ResultsDisplay';

type GameStage = 'purchase' | 'puzzle' | 'results';
type PuzzleType = 'drag' | 'click' | 'swipe';

interface GameState {
  stage: GameStage;
  ticketTier: string | null;
  puzzleType: PuzzleType | null;
  isWinner: boolean;
  prizeAmount: string | null;
}

const PRIZE_AMOUNTS = {
  bronze: ['$5', '$10', '$25'],
  silver: ['$10', '$25', '$50'],
  gold: ['$25', '$50', '$100'],
};

export function GameFlow() {
  const [gameState, setGameState] = useState<GameState>({
    stage: 'purchase',
    ticketTier: null,
    puzzleType: null,
    isWinner: false,
    prizeAmount: null,
  });

  const handlePurchase = (tierId: string, puzzleType: string) => {
    setGameState({
      stage: 'puzzle',
      ticketTier: tierId,
      puzzleType: puzzleType as PuzzleType,
      isWinner: false,
      prizeAmount: null,
    });
  };

  const handlePuzzleComplete = () => {
    // Simulate game outcome (in production, this would come from smart contract)
    const tierOdds = {
      bronze: 0.2, // 1 in 5
      silver: 0.25, // 1 in 4
      gold: 0.33, // 1 in 3
    };

    const isWinner =
      Math.random() <
      tierOdds[gameState.ticketTier as keyof typeof tierOdds];

    let prizeAmount = null;
    if (isWinner && gameState.ticketTier) {
      const prizes =
        PRIZE_AMOUNTS[gameState.ticketTier as keyof typeof PRIZE_AMOUNTS];
      prizeAmount = prizes[Math.floor(Math.random() * prizes.length)];
    }

    setGameState({
      ...gameState,
      stage: 'results',
      isWinner,
      prizeAmount,
    });
  };

  const handlePlayAgain = () => {
    setGameState({
      stage: 'purchase',
      ticketTier: null,
      puzzleType: null,
      isWinner: false,
      prizeAmount: null,
    });
  };

  return (
    <div className="min-h-[600px]">
      <AnimatePresence mode="wait">
        {gameState.stage === 'purchase' && (
          <motion.div
            key="purchase"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5 }}
          >
            <TicketPurchase onPurchase={handlePurchase} />
          </motion.div>
        )}

        {gameState.stage === 'puzzle' && (
          <motion.div
            key="puzzle"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)]"
          >
            {gameState.puzzleType === 'drag' && (
              <DragPuzzle onComplete={handlePuzzleComplete} />
            )}
            {gameState.puzzleType === 'click' && (
              <ClickTiles onComplete={handlePuzzleComplete} />
            )}
            {gameState.puzzleType === 'swipe' && (
              <SwipeReveal onComplete={handlePuzzleComplete} />
            )}
          </motion.div>
        )}

        {gameState.stage === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
          >
            <ResultsDisplay
              isWinner={gameState.isWinner}
              prizeAmount={gameState.prizeAmount || undefined}
              onPlayAgain={handlePlayAgain}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
