'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface Tile {
  id: number;
  clicked: boolean;
}

interface ClickTilesProps {
  onComplete: () => void;
}

export function ClickTiles({ onComplete }: ClickTilesProps) {
  const [tiles, setTiles] = useState<Tile[]>(
    Array.from({ length: 16 }, (_, i) => ({ id: i, clicked: false }))
  );

  const [progress, setProgress] = useState(0);

  const handleTileClick = (id: number) => {
    setTiles((prev) =>
      prev.map((tile) => (tile.id === id ? { ...tile, clicked: true } : tile))
    );
  };

  useEffect(() => {
    const clickedCount = tiles.filter((t) => t.clicked).length;
    const progressPercent = (clickedCount / tiles.length) * 100;
    setProgress(progressPercent);

    if (clickedCount === tiles.length) {
      setTimeout(() => onComplete(), 500);
    }
  }, [tiles, onComplete]);

  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h3 className="mb-2 text-2xl font-bold">Clear the Tiles!</h3>
        <p className="text-foreground/70">
          Click all the tiles to reveal your prize
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md">
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-foreground/70">Progress</span>
          <span className="font-bold text-spark-orange">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[var(--card-bg)]">
          <motion.div
            className="h-full bg-gradient-to-r from-spark-orange to-spark-orange-dark"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Tile Grid */}
      <div className="grid grid-cols-4 gap-3">
        <AnimatePresence>
          {tiles.map((tile) => (
            <motion.button
              key={tile.id}
              onClick={() => !tile.clicked && handleTileClick(tile.id)}
              className={`relative h-20 w-20 overflow-hidden rounded-xl transition-colors ${
                tile.clicked
                  ? 'cursor-default'
                  : 'cursor-pointer hover:border-spark-orange'
              }`}
              initial={{ scale: 1 }}
              whileHover={!tile.clicked ? { scale: 1.05 } : {}}
              whileTap={!tile.clicked ? { scale: 0.95 } : {}}
              exit={{ scale: 0, opacity: 0 }}
            >
              {!tile.clicked ? (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-spark-blue to-spark-purple"
                  layoutId={`tile-${tile.id}`}
                >
                  <div className="flex h-full items-center justify-center">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  className="absolute inset-0 bg-spark-orange/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="flex h-full items-center justify-center text-4xl"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  >
                    ✨
                  </motion.div>
                </motion.div>
              )}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
