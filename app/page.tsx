'use client';

import { motion } from 'framer-motion';
import { Zap, Sparkles, Trophy, Shield } from 'lucide-react';
import { Header } from './components/Header';
import { DemoHeader } from './components/DemoHeader';
import { SparkleEffect } from './components/SparkleEffect';
import { GameFlow } from './components/GameFlow';
import { usePrivy } from '@privy-io/react-auth';

export default function Home() {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  // In demo mode (no Privy), show everything
  let authenticated = true;

  if (privyAppId) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    authenticated = usePrivy().authenticated;
  }

  return (
    <div className="min-h-screen">
      {privyAppId ? <Header /> : <DemoHeader />}
      <SparkleEffect />

      <main className="container mx-auto px-6 pt-32 pb-16">
        {/* Hero Section */}
        <motion.div
          className="flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-spark-orange/30 bg-spark-orange/10 px-6 py-2 text-sm font-medium text-spark-orange"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <Sparkles className="h-4 w-4" />
            Powered by Blockchain
          </motion.div>

          <h1 className="mb-6 max-w-4xl text-6xl font-bold leading-tight md:text-7xl lg:text-8xl">
            <span className="spark-gradient bg-clip-text text-transparent text-glow">
              Strike Lucky
            </span>
            <br />
            <span className="text-foreground">Win Big</span>
          </h1>

          <p className="mb-12 max-w-2xl text-xl text-foreground/70 md:text-2xl">
            Experience the thrill of scratch-off lottery tickets, reimagined for the blockchain era.
            Interactive puzzles. Instant wins. Transparent odds.
          </p>

          {authenticated ? (
            <motion.a
              href="#tickets"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-spark-orange to-spark-orange-dark px-8 py-4 text-lg font-bold text-white shadow-2xl shadow-spark-orange/50 transition-all hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Zap className="h-5 w-5" />
              Play Now
              <motion.div
                className="absolute inset-0 bg-white/20"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.5 }}
              />
            </motion.a>
          ) : (
            <p className="text-lg text-foreground/50">
              Connect your wallet to get started
            </p>
          )}
        </motion.div>

        {/* Features */}
        <motion.div
          className="mt-32 grid gap-8 md:grid-cols-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <FeatureCard
            icon={<Sparkles className="h-8 w-8 text-spark-blue" />}
            title="Interactive Fun"
            description="Drag puzzle pieces, click tiles, and swipe to reveal your prizes"
          />
          <FeatureCard
            icon={<Trophy className="h-8 w-8 text-spark-orange" />}
            title="Instant Wins"
            description="Win up to $100 instantly with transparent, verifiable odds"
          />
          <FeatureCard
            icon={<Shield className="h-8 w-8 text-spark-purple" />}
            title="Blockchain Secure"
            description="Provably fair randomness powered by Chainlink VRF on Arbitrum"
          />
        </motion.div>

        {/* Game Flow */}
        {authenticated && (
          <motion.div
            id="tickets"
            className="mt-32"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <GameFlow />
          </motion.div>
        )}
      </main>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      className="group rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-8 transition-all hover:border-spark-blue/50 hover:bg-[var(--card-bg)]/80"
      whileHover={{ y: -8 }}
    >
      <div className="mb-4 inline-flex rounded-xl bg-[var(--background)] p-3">
        {icon}
      </div>
      <h3 className="mb-3 text-xl font-bold">{title}</h3>
      <p className="text-foreground/70">{description}</p>
    </motion.div>
  );
}
