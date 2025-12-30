'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, TrendingUp, Calendar, Sparkles } from 'lucide-react';
import { GameRecord } from '../lib/hooks/useGameHistory';

interface GameHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  history: GameRecord[];
  totalWinnings: number;
}

export function GameHistory({ isOpen, onClose, history, totalWinnings }: GameHistoryProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return 'text-spark-orange';
      case 'silver':
        return 'text-gray-300';
      case 'gold':
        return 'text-yellow-400';
      default:
        return 'text-spark-blue';
    }
  };

  const getPuzzleEmoji = (puzzleType: string) => {
    switch (puzzleType) {
      case 'drag':
        return '🧩';
      case 'click':
        return '🎯';
      case 'swipe':
        return '✨';
      default:
        return '🎮';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-[70] h-full w-full max-w-md overflow-hidden bg-[var(--background)] shadow-2xl sm:border-l sm:border-[var(--card-border)]"
          >
            {/* Header */}
            <div className="border-b border-[var(--card-border)] bg-[var(--card-bg)] px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-spark-blue" />
                  <h2 className="text-xl font-bold">Game History</h2>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full p-2 transition-colors hover:bg-[var(--background)]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Total Winnings Card */}
              <div className="mt-4 rounded-xl border border-spark-blue/30 bg-gradient-to-br from-spark-blue/10 to-spark-purple/10 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Winnings</p>
                    <p className="mt-1 text-3xl font-bold text-glow">
                      ${totalWinnings.toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-full bg-spark-blue/20 p-3">
                    <TrendingUp className="h-6 w-6 text-spark-blue" />
                  </div>
                </div>
              </div>
            </div>

            {/* Game List */}
            <div className="h-[calc(100%-180px)] overflow-y-auto px-6 py-4">
              {history.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <Sparkles className="mb-4 h-12 w-12 text-gray-600" />
                  <p className="text-lg font-medium text-gray-400">No games yet</p>
                  <p className="mt-2 text-sm text-gray-500">
                    Your game history will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((game) => (
                    <motion.div
                      key={game.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4 transition-all hover:border-spark-blue/50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {/* Puzzle Icon */}
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--background)] text-xl">
                            {getPuzzleEmoji(game.puzzleType)}
                          </div>

                          {/* Game Info */}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`font-semibold capitalize ${getTierColor(game.ticketTier)}`}>
                                {game.ticketTier}
                              </span>
                              <span className="text-sm text-gray-500">Ticket</span>
                            </div>
                            <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="h-3 w-3" />
                              {formatDate(game.timestamp)}
                            </div>
                          </div>
                        </div>

                        {/* Outcome */}
                        <div className="text-right">
                          {game.isWinner && game.prizeAmount ? (
                            <div className="rounded-lg bg-gradient-to-r from-spark-blue/20 to-spark-purple/20 px-3 py-1.5">
                              <p className="text-xs font-medium text-spark-blue">Win</p>
                              <p className="text-lg font-bold text-glow">
                                {game.prizeAmount}
                              </p>
                            </div>
                          ) : (
                            <div className="flex h-full items-center justify-center rounded-lg bg-red-500/10 px-3 py-1.5">
                              <span className="text-2xl text-red-400">✕</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
