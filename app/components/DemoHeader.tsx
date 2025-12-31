'use client';

import { useState } from 'react';
import Image from 'next/image';
import { History } from 'lucide-react';
import { GameHistory } from './GameHistory';
import { useGameHistory } from '../lib/hooks/useGameHistory';

export function DemoHeader() {
  const { history, totalWinnings } = useGameHistory();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--card-border)] bg-[var(--background)]/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Image
              src="/spark-logo.png"
              alt="Spark Logo"
              width={120}
              height={40}
              priority
              className="h-10 w-auto"
            />
          </div>
          <div className="flex items-center gap-3">
            {/* Game History Button */}
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="group relative flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-2 text-sm font-medium transition-all hover:border-spark-blue hover:bg-spark-blue/10"
            >
              <History className="h-4 w-4 text-spark-blue" />
              <span className="hidden sm:inline">History</span>
              {history.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-spark-purple text-xs font-bold">
                  {history.length > 9 ? '9+' : history.length}
                </span>
              )}
            </button>

            <div className="rounded-full border border-yellow-500/50 bg-yellow-500/10 px-4 py-2 text-sm text-yellow-500">
              Demo Mode - Get Privy App ID at privy.io
            </div>
          </div>
        </div>
      </header>

      {/* Game History Modal */}
      <GameHistory
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        totalWinnings={totalWinnings}
      />
    </>
  );
}
