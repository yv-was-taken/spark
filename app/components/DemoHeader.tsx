'use client';

import Image from 'next/image';

export function DemoHeader() {
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
        <div className="rounded-full border border-yellow-500/50 bg-yellow-500/10 px-4 py-2 text-sm text-yellow-500">
          Demo Mode - Get Privy App ID at privy.io
        </div>
      </div>
    </header>
  );
}
