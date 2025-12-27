'use client';

import { motion } from 'framer-motion';
import { Trophy, Zap, PartyPopper, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

interface ResultsDisplayProps {
  isWinner: boolean;
  prizeAmount?: string;
  onPlayAgain: () => void;
}

export function ResultsDisplay({
  isWinner,
  prizeAmount,
  onPlayAgain,
}: ResultsDisplayProps) {
  useEffect(() => {
    if (isWinner) {
      // Trigger confetti animation
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#5AA8FF', '#FFB84D', '#7D5FFF'],
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#5AA8FF', '#FFB84D', '#7D5FFF'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isWinner]);

  return (
    <div className="flex min-h-[600px] flex-col items-center justify-center p-8">
      <motion.div
        className="text-center"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        {isWinner ? (
          <>
            {/* Winner Display */}
            <motion.div
              className="mb-8 inline-flex rounded-full bg-spark-orange/20 p-8"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Trophy className="h-24 w-24 text-spark-orange" />
            </motion.div>

            <motion.h2
              className="mb-4 text-6xl font-bold text-spark-orange"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              You Won!
            </motion.h2>

            <motion.div
              className="mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="mb-2 text-2xl text-foreground/70">
                Congratulations! You won
              </div>
              <div className="text-7xl font-bold text-spark-blue">
                {prizeAmount || '$5'}
              </div>
            </motion.div>

            <motion.div
              className="mb-8 rounded-2xl border border-spark-blue/20 bg-spark-blue/5 p-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex items-center justify-center gap-2 text-sm text-foreground/70">
                <PartyPopper className="h-5 w-5 text-spark-orange" />
                <span>Prize has been sent to your wallet!</span>
              </div>
            </motion.div>
          </>
        ) : (
          <>
            {/* Loser Display (Still encouraging!) */}
            <motion.div
              className="mb-8 inline-flex rounded-full bg-spark-purple/20 p-8"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap className="h-24 w-24 text-spark-purple" />
            </motion.div>

            <motion.h2
              className="mb-4 text-5xl font-bold text-spark-purple"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Almost There!
            </motion.h2>

            <motion.p
              className="mb-8 text-xl text-foreground/70"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Not a winner this time, but every ticket is a new chance to strike lucky!
            </motion.p>
          </>
        )}

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col gap-4 sm:flex-row sm:justify-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <motion.button
            onClick={onPlayAgain}
            className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-spark-orange to-spark-orange-dark px-8 py-4 text-lg font-bold text-white shadow-xl shadow-spark-orange/50 transition-all hover:scale-105"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw className="h-5 w-5" />
            Play Again
          </motion.button>

          <motion.a
            href="/"
            className="flex items-center justify-center gap-2 rounded-full border border-[var(--card-border)] px-8 py-4 text-lg font-medium transition-all hover:border-spark-blue hover:bg-[var(--card-bg)]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Back to Home
          </motion.a>
        </motion.div>
      </motion.div>
    </div>
  );
}
