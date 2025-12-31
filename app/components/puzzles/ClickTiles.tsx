'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface ClickTilesProps {
  isWinner: boolean;
  onComplete: (matchCount: number) => void;
  tier: 'bronze' | 'silver' | 'gold';
}

// Symbols for tiles
const SYMBOLS = ['💎', '⚡', '⭐', '🔥', '💰', '🎯', '🍀', '👑'];

// Prize configuration based on matches
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

interface Tile {
  id: number;
  symbol: string;
  clicked: boolean;
}

// Generate winner pattern with matching symbols
function generateWinnerPattern(): Tile[] {
  const winningSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  const matchCount = 3 + Math.floor(Math.random() * 3); // 3-5 matches

  const tiles: Tile[] = [];
  const positions = Array.from({ length: 16 }, (_, i) => i);

  // Shuffle positions
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  // Place winning symbols
  const winningPositions = positions.slice(0, matchCount);

  // Create tiles
  for (let i = 0; i < 16; i++) {
    if (winningPositions.includes(i)) {
      tiles.push({ id: i, symbol: winningSymbol, clicked: false });
    } else {
      // Fill with different symbols
      const otherSymbols = SYMBOLS.filter(s => s !== winningSymbol);
      tiles.push({
        id: i,
        symbol: otherSymbols[Math.floor(Math.random() * otherSymbols.length)],
        clicked: false,
      });
    }
  }

  return tiles;
}

// Generate loser pattern with no matches >= 3
function generateLoserPattern(): Tile[] {
  const tiles: Tile[] = [];
  const symbolCounts: { [key: string]: number } = {};

  for (let i = 0; i < 16; i++) {
    // Find symbols that haven't been used more than twice
    const availableSymbols = SYMBOLS.filter(s => (symbolCounts[s] || 0) < 2);
    const symbol = availableSymbols[Math.floor(Math.random() * availableSymbols.length)];

    symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
    tiles.push({ id: i, symbol, clicked: false });
  }

  return tiles;
}

export function ClickTiles({ isWinner, onComplete, tier }: ClickTilesProps) {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [progress, setProgress] = useState(0);
  const [matches, setMatches] = useState<{ [key: string]: number }>({});
  const [completed, setCompleted] = useState(false);

  // Initialize tiles on mount
  useEffect(() => {
    const pattern = isWinner ? generateWinnerPattern() : generateLoserPattern();
    setTiles(pattern);
  }, [isWinner]);

  const handleTileClick = (id: number) => {
    setTiles((prev) => {
      const newTiles = prev.map((tile) =>
        tile.id === id ? { ...tile, clicked: true } : tile
      );
      calculateMatches(newTiles);
      return newTiles;
    });
  };

  const calculateMatches = (currentTiles: Tile[]) => {
    const symbolCounts: { [key: string]: number } = {};

    currentTiles.forEach(tile => {
      if (tile.clicked) {
        symbolCounts[tile.symbol] = (symbolCounts[tile.symbol] || 0) + 1;
      }
    });

    setMatches(symbolCounts);
  };

  useEffect(() => {
    if (tiles.length === 0) return; // Don't run completion check until tiles are initialized

    const clickedCount = tiles.filter((t) => t.clicked).length;
    const progressPercent = (clickedCount / tiles.length) * 100;
    setProgress(progressPercent);

    if (clickedCount === tiles.length && !completed) {
      setCompleted(true);
      // Find max match count
      const maxMatches = Math.max(...Object.values(matches), 0);
      setTimeout(() => onComplete(maxMatches), 500);
    }
  }, [tiles, matches, completed, onComplete]);

  // Get highest match for display
  const maxMatch = Math.max(...Object.values(matches), 0);
  const prizeForMatch = maxMatch >= 5
    ? PRIZE_CONFIG[tier].match5
    : maxMatch >= 4
    ? PRIZE_CONFIG[tier].match4
    : maxMatch >= 3
    ? PRIZE_CONFIG[tier].match3
    : null;

  // Don't render until tiles are initialized
  if (tiles.length === 0) {
    return <div className="flex min-h-[700px] items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex min-h-[700px] flex-col items-center justify-center gap-6 p-8">
      <div className="text-center">
        <h3 className="mb-2 text-3xl font-bold text-spark-blue">
          Strike Lucky!
        </h3>
        <p className="text-lg text-foreground/70">
          Click tiles to reveal symbols - Match 3 or more to win!
        </p>
      </div>

      {/* Match status */}
      <AnimatePresence>
        {maxMatch >= 3 && prizeForMatch && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="rounded-full border-2 border-spark-blue bg-spark-blue/20 px-6 py-3"
          >
            <div className="text-center">
              <div className="text-sm font-semibold text-spark-blue/80">
                {maxMatch === 3 ? 'MATCH 3!' : maxMatch === 4 ? 'MATCH 4!' : 'MATCH 5+!'}
              </div>
              <div className="text-2xl font-bold text-spark-blue">
                {prizeForMatch}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar */}
      <div className="w-full max-w-md">
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-foreground/70">Revealed</span>
          <span className="font-bold text-spark-blue">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[var(--card-bg)]">
          <motion.div
            className="h-full bg-gradient-to-r from-spark-blue to-spark-purple"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Tile Grid */}
      <div className="grid grid-cols-4 gap-3">
        {tiles.map((tile) => (
          <motion.button
            key={tile.id}
            onClick={() => !tile.clicked && handleTileClick(tile.id)}
            className={`relative h-24 w-24 overflow-hidden rounded-xl border-2 transition-colors ${
              tile.clicked
                ? 'border-spark-blue/30 cursor-default'
                : 'border-spark-blue/50 cursor-pointer hover:border-spark-blue'
            }`}
            whileHover={!tile.clicked ? { scale: 1.05 } : {}}
            whileTap={!tile.clicked ? { scale: 0.95 } : {}}
          >
            {!tile.clicked ? (
              <div className="absolute inset-0 bg-gradient-to-br from-spark-blue to-spark-purple">
                <div className="flex h-full items-center justify-center">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
              </div>
            ) : (
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-spark-blue/10 to-spark-purple/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="flex h-full items-center justify-center text-5xl"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                >
                  {tile.symbol}
                </motion.div>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Prize table */}
      <div className="w-full max-w-md rounded-2xl border border-spark-blue/20 bg-[var(--card-bg)] p-4">
        <div className="mb-2 text-center text-sm font-semibold text-spark-blue">
          Prize Table
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-foreground/70">Match 3:</span>
            <span className="font-bold text-spark-blue">
              {PRIZE_CONFIG[tier].match3}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/70">Match 4:</span>
            <span className="font-bold text-spark-blue">
              {PRIZE_CONFIG[tier].match4}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/70">Match 5+:</span>
            <span className="font-bold text-spark-blue">
              {PRIZE_CONFIG[tier].match5}
            </span>
          </div>
        </div>
      </div>

      <p className="text-center text-sm text-foreground/50">
        Click all tiles to reveal the symbols underneath
      </p>
    </div>
  );
}
