'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScratchTicketProps {
  isWinner: boolean;
  onComplete: (matchCount: number) => void;
  tier: 'bronze' | 'silver' | 'gold';
}

// Symbols for scratch tickets
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

interface GridCell {
  symbol: string;
  revealed: boolean;
}

// Generate winner pattern with matching symbols
function generateWinnerPattern(): GridCell[] {
  const winningSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  const matchCount = 3 + Math.floor(Math.random() * 3); // 3-5 matches

  const grid: GridCell[] = [];
  const positions = Array.from({ length: 9 }, (_, i) => i);

  // Shuffle positions
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  // Place winning symbols
  const winningPositions = positions.slice(0, matchCount);

  // Create grid
  for (let i = 0; i < 9; i++) {
    if (winningPositions.includes(i)) {
      grid.push({ symbol: winningSymbol, revealed: false });
    } else {
      // Fill with different symbols
      const otherSymbols = SYMBOLS.filter(s => s !== winningSymbol);
      grid.push({
        symbol: otherSymbols[Math.floor(Math.random() * otherSymbols.length)],
        revealed: false,
      });
    }
  }

  return grid;
}

// Generate loser pattern with no matches >= 3
function generateLoserPattern(): GridCell[] {
  const grid: GridCell[] = [];
  const symbolCounts: { [key: string]: number } = {};

  for (let i = 0; i < 9; i++) {
    // Find symbols that haven't been used more than twice
    const availableSymbols = SYMBOLS.filter(s => (symbolCounts[s] || 0) < 2);
    const symbol = availableSymbols[Math.floor(Math.random() * availableSymbols.length)];

    symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
    grid.push({ symbol, revealed: false });
  }

  return grid;
}

export function ScratchTicket({ isWinner, onComplete, tier }: ScratchTicketProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasInitializedRef = useRef(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [grid, setGrid] = useState<GridCell[]>([]);
  const [progress, setProgress] = useState(0);
  const [matches, setMatches] = useState<{ [key: string]: number }>({});
  const [completed, setCompleted] = useState(false);

  // Initialize grid on mount
  useEffect(() => {
    const pattern = isWinner ? generateWinnerPattern() : generateLoserPattern();
    setGrid(pattern);
  }, [isWinner]);

  // Initialize canvas overlay ONLY ONCE when grid is loaded
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || grid.length === 0 || canvasInitializedRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 450;
    canvas.height = 450;

    // Draw the scratch-off overlay
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#5AA8FF');
    gradient.addColorStop(0.5, '#7D5FFF');
    gradient.addColorStop(1, '#FFB84D');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add sparkle texture
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 3;
      ctx.fillRect(x, y, size, size);
    }

    // Add "SCRATCH HERE" text
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SCRATCH HERE', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '20px sans-serif';
    ctx.fillText('Match 3 or more to win!', canvas.width / 2, canvas.height / 2 + 20);

    // Set up scratch-off effect
    ctx.globalCompositeOperation = 'destination-out';

    // Mark as initialized so we don't redraw
    canvasInitializedRef.current = true;
  }, [grid.length]);

  const checkCellRevealed = (cellIndex: number, scratchX: number, scratchY: number) => {
    const col = cellIndex % 3;
    const row = Math.floor(cellIndex / 3);
    const cellSize = 150; // 450 / 3

    const cellLeft = col * cellSize;
    const cellTop = row * cellSize;
    const cellRight = cellLeft + cellSize;
    const cellBottom = cellTop + cellSize;

    // Check if scratch position is within this cell
    if (
      scratchX >= cellLeft &&
      scratchX <= cellRight &&
      scratchY >= cellTop &&
      scratchY <= cellBottom
    ) {
      // Check if enough of the cell has been scratched (sample area)
      return Math.random() > 0.3; // Reveal after some scratching
    }

    return false;
  };

  const scratch = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fill();

    // Check if any cells should be revealed
    const newGrid = [...grid];
    let hasChanges = false;

    for (let i = 0; i < grid.length; i++) {
      if (!grid[i].revealed && checkCellRevealed(i, x, y)) {
        newGrid[i] = { ...newGrid[i], revealed: true };
        hasChanges = true;
      }
    }

    if (hasChanges) {
      setGrid(newGrid);
      calculateMatches(newGrid);
    }

    // Calculate progress
    checkProgress();
  };

  const calculateMatches = (currentGrid: GridCell[]) => {
    const symbolCounts: { [key: string]: number } = {};

    currentGrid.forEach(cell => {
      if (cell.revealed) {
        symbolCounts[cell.symbol] = (symbolCounts[cell.symbol] || 0) + 1;
      }
    });

    setMatches(symbolCounts);
  };

  const checkProgress = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparent = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 128) transparent++;
    }

    const progressPercent = (transparent / (pixels.length / 4)) * 100;
    setProgress(progressPercent);

    if (progressPercent > 70 && !completed) {
      setCompleted(true);
      // Find max match count
      const maxMatches = Math.max(...Object.values(matches), 0);
      setTimeout(() => onComplete(maxMatches), 500);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const rect = e.currentTarget.getBoundingClientRect();
    scratch(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    scratch(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    scratch(touch.clientX - rect.left, touch.clientY - rect.top);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    scratch(touch.clientX - rect.left, touch.clientY - rect.top);
  };

  const handleTouchEnd = () => {
    setIsDrawing(false);
  };

  // Get highest match for display
  const maxMatch = Math.max(...Object.values(matches), 0);
  const prizeForMatch = maxMatch >= 5
    ? PRIZE_CONFIG[tier].match5
    : maxMatch >= 4
    ? PRIZE_CONFIG[tier].match4
    : maxMatch >= 3
    ? PRIZE_CONFIG[tier].match3
    : null;

  return (
    <div className="flex min-h-[700px] flex-col items-center justify-center gap-6 p-8">
      <div className="text-center">
        <h3 className="mb-2 text-3xl font-bold text-spark-orange">
          Strike Lucky!
        </h3>
        <p className="text-lg text-foreground/70">
          Scratch to reveal symbols - Match 3 or more to win!
        </p>
      </div>

      {/* Match status */}
      <AnimatePresence>
        {maxMatch >= 3 && prizeForMatch && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="rounded-full border-2 border-spark-orange bg-spark-orange/20 px-6 py-3"
          >
            <div className="text-center">
              <div className="text-sm font-semibold text-spark-orange/80">
                {maxMatch === 3 ? 'MATCH 3!' : maxMatch === 4 ? 'MATCH 4!' : 'MATCH 5+!'}
              </div>
              <div className="text-2xl font-bold text-spark-orange">
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

      {/* Scratch Card */}
      <div className="relative overflow-hidden rounded-3xl border-4 border-spark-orange/30 bg-gradient-to-br from-[var(--card-bg)] to-[var(--card-bg)]">
        {/* Grid of symbols underneath */}
        <div className="grid grid-cols-3 gap-0" style={{ width: 450, height: 450 }}>
          {grid.map((cell, i) => (
            <div
              key={i}
              className="flex items-center justify-center border border-spark-blue/10"
              style={{ width: 150, height: 150 }}
            >
              <motion.div
                className="text-7xl"
                initial={{ scale: 0 }}
                animate={{
                  scale: cell.revealed ? 1 : 0,
                  rotate: cell.revealed ? [0, 10, -10, 0] : 0,
                }}
                transition={{ duration: 0.3 }}
              >
                {cell.symbol}
              </motion.div>
            </div>
          ))}
        </div>

        {/* Scratch-off canvas */}
        <canvas
          ref={canvasRef}
          className="absolute left-0 top-0 cursor-crosshair touch-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      </div>

      {/* Prize table */}
      <div className="w-full max-w-md rounded-2xl border border-spark-blue/20 bg-[var(--card-bg)] p-4">
        <div className="mb-2 text-center text-sm font-semibold text-spark-blue">
          Prize Table
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-foreground/70">Match 3:</span>
            <span className="font-bold text-spark-orange">
              {PRIZE_CONFIG[tier].match3}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/70">Match 4:</span>
            <span className="font-bold text-spark-orange">
              {PRIZE_CONFIG[tier].match4}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/70">Match 5+:</span>
            <span className="font-bold text-spark-orange">
              {PRIZE_CONFIG[tier].match5}
            </span>
          </div>
        </div>
      </div>

      <p className="text-center text-sm text-foreground/50">
        Click and drag to scratch off the surface
      </p>
    </div>
  );
}
