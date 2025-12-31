'use client';

import { usePrivy } from '@privy-io/react-auth';
import { Zap, User } from 'lucide-react';
import Image from 'next/image';

export function Header() {
  const { ready, authenticated, login, logout, exportWallet } = usePrivy();

  return (
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
  );
}
