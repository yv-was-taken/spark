'use client';

import { useState, useEffect, useCallback } from 'react';

export interface GameRecord {
  id: string;
  timestamp: number;
  ticketTier: string;
  puzzleType: string;
  isWinner: boolean;
  prizeAmount: string | null;
}

const STORAGE_KEY = 'spark_game_history';
const MAX_HISTORY_SIZE = 50;
const HISTORY_UPDATE_EVENT = 'game-history-updated';

export function useGameHistory() {
  const [history, setHistory] = useState<GameRecord[]>([]);

  // Function to load history from localStorage
  const loadHistory = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(parsed);
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error('Failed to load game history:', error);
      setHistory([]);
    }
  }, []);

  // Load history on mount and listen for updates
  useEffect(() => {
    loadHistory();

    // Listen for custom events from other component instances
    const handleHistoryUpdate = () => {
      loadHistory();
    };

    window.addEventListener(HISTORY_UPDATE_EVENT, handleHistoryUpdate);

    return () => {
      window.removeEventListener(HISTORY_UPDATE_EVENT, handleHistoryUpdate);
    };
  }, [loadHistory]);

  // Save a new game to history
  const addGame = useCallback((game: Omit<GameRecord, 'id' | 'timestamp'>) => {
    const newGame: GameRecord = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      ...game,
    };

    try {
      // Load current history from localStorage to avoid race conditions
      const stored = localStorage.getItem(STORAGE_KEY);
      const currentHistory = stored ? JSON.parse(stored) : [];

      const updated = [newGame, ...currentHistory].slice(0, MAX_HISTORY_SIZE);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      // Update local state
      setHistory(updated);

      // Notify other components
      window.dispatchEvent(new Event(HISTORY_UPDATE_EVENT));

      console.log('Game added to history:', newGame);
    } catch (error) {
      console.error('Failed to save game history:', error);
    }
  }, []);

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
      // Notify other components
      window.dispatchEvent(new Event(HISTORY_UPDATE_EVENT));
    } catch (error) {
      console.error('Failed to clear game history:', error);
    }
  }, []);

  // Calculate total winnings
  const totalWinnings = history.reduce((sum, game) => {
    if (game.isWinner && game.prizeAmount) {
      const amount = parseFloat(game.prizeAmount.replace('$', ''));
      return sum + amount;
    }
    return sum;
  }, 0);

  return {
    history,
    addGame,
    clearHistory,
    totalWinnings,
  };
}
