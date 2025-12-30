'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TicketPurchase } from './TicketPurchase';
import { DragPuzzle } from './puzzles/DragPuzzle';
import { ClickTiles } from './puzzles/ClickTiles';
import { ScratchTicket } from './puzzles/ScratchTicket';
import { ResultsDisplay } from './ResultsDisplay';

type GameStage = 'purchase' | 'puzzle' | 'results';
type PuzzleType = 'drag' | 'click' | 'scratch';

interface GameState {
  stage: GameStage;
  ticketTier: 'bronze' | 'silver' | 'gold' | null;
  puzzleType: PuzzleType | null;
  isWinner: boolean;
  prizeAmount: string | null;
  matchCount: number;
}

// Prize amounts based on match count
const PRIZE_CONFIG = {
  bronze: {
    match3: '$5',
    match4: '$10',
    match5: '$25',
  },
  silver: {
    match3: '$10',
    match4: '$25',
    match5: '$50',
  },
  gold: {
    match3: '$25',
    match4: '$50',
    match5: '$100',
  },
};

export function GameFlow() {
  const [gameState, setGameState] = useState<GameState>({
    stage: 'purchase',
    ticketTier: null,
    puzzleType: null,
    isWinner: false,
    prizeAmount: null,
    matchCount: 0,
  });

  const handlePurchase = (tierId: string) => {
    // Randomly select a puzzle type
    const puzzleTypes: PuzzleType[] = ['drag', 'click', 'scratch'];
    const randomPuzzle = puzzleTypes[Math.floor(Math.random() * puzzleTypes.length)];

    // Determine win/loss before showing puzzle
    // For scratch tickets, this creates the underlying pattern (winner vs loser patterns)
    const tierOdds = {
      bronze: 0.2, // 1 in 5
      silver: 0.25, // 1 in 4
      gold: 0.33, // 1 in 3
    };

    const isWinner =
      Math.random() <
      tierOdds[tierId as keyof typeof tierOdds];

    setGameState({
      stage: 'puzzle',
      ticketTier: tierId as 'bronze' | 'silver' | 'gold',
      puzzleType: randomPuzzle,
      isWinner,
      prizeAmount: null,
      matchCount: 0,
    });
  };

  const handlePuzzleComplete = (matchCount?: number) => {
    // Calculate prize based on puzzle type
    let prizeAmount = null;

    if (gameState.isWinner && gameState.ticketTier) {
      if ((gameState.puzzleType === 'scratch' || gameState.puzzleType === 'click') && matchCount && matchCount >= 3) {
        // For scratch tickets and click tiles, prize depends on match count
        const tierConfig = PRIZE_CONFIG[gameState.ticketTier];

        if (matchCount >= 5) {
          prizeAmount = tierConfig.match5;
        } else if (matchCount >= 4) {
          prizeAmount = tierConfig.match4;
        } else if (matchCount >= 3) {
          prizeAmount = tierConfig.match3;
        }
      } else {
        // For drag puzzle, pick a random prize from the tier
        const tierConfig = PRIZE_CONFIG[gameState.ticketTier];
        const prizes = [tierConfig.match3, tierConfig.match4, tierConfig.match5];
        prizeAmount = prizes[Math.floor(Math.random() * prizes.length)];
      }
    }

    setGameState({
      ...gameState,
      stage: 'results',
      prizeAmount,
      matchCount: matchCount || 0,
    });
  };

  const handlePlayAgain = () => {
    setGameState({
      stage: 'purchase',
      ticketTier: null,
      puzzleType: null,
      isWinner: false,
      prizeAmount: null,
      matchCount: 0,
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

        {gameState.stage === 'puzzle' && gameState.ticketTier && (
          <motion.div
            key="puzzle"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)]"
          >
            {gameState.puzzleType === 'drag' && (
              <DragPuzzle onComplete={() => handlePuzzleComplete()} />
            )}
            {gameState.puzzleType === 'click' && (
              <ClickTiles
                isWinner={gameState.isWinner}
                tier={gameState.ticketTier}
                onComplete={handlePuzzleComplete}
              />
            )}
            {gameState.puzzleType === 'scratch' && (
              <ScratchTicket
                isWinner={gameState.isWinner}
                tier={gameState.ticketTier}
                onComplete={handlePuzzleComplete}
              />
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
