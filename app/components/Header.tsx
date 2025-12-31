'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Zap, User, Wallet, History } from 'lucide-react';
import Image from 'next/image';
import { GameHistory } from './GameHistory';
import { useGameHistory } from '../lib/hooks/useGameHistory';

export function Header() {
  const { ready, authenticated, login, logout, exportWallet, user } = usePrivy();
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

        <div className="flex items-center gap-4">
          {!ready ? (
            <div className="h-10 w-32 animate-pulse rounded-full bg-[var(--card-bg)]" />
          ) : authenticated ? (
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

              <div className="hidden sm:flex items-center gap-2 rounded-full bg-[var(--card-bg)] px-4 py-2 text-sm">
                <Wallet className="h-4 w-4 text-spark-blue" />
                <span className="font-mono">
                  {user?.wallet?.address?.slice(0, 6)}...
                  {user?.wallet?.address?.slice(-4)}
                </span>
              </div>

              <button
                onClick={exportWallet}
                className="flex items-center justify-center rounded-full bg-[var(--card-bg)] p-2.5 transition-all hover:bg-[var(--card-bg)]/80 hover:border-spark-blue border border-transparent active:scale-95"
                title="Account"
              >
                <User className="h-5 w-5 text-spark-blue" />
              </button>
              <button
                onClick={logout}
                className="rounded-full border border-[var(--card-border)] px-4 py-2 text-sm font-medium transition-colors hover:border-spark-blue hover:bg-[var(--card-bg)]"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={login}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-spark-blue to-spark-purple px-6 py-2.5 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-spark-blue/50"
            >
              <Zap className="h-4 w-4" />
              Connect Wallet
            </button>
          )}
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
