'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SwipeRevealProps {
  onComplete: () => void;
}

export function SwipeReveal({ onComplete }: SwipeRevealProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 400;
    canvas.height = 300;

    // Draw the scratch-off overlay
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#5AA8FF');
    gradient.addColorStop(1, '#7D5FFF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add sparkle texture
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      ctx.fillRect(x, y, 2, 2);
    }

    // Set up scratch-off effect
    ctx.globalCompositeOperation = 'destination-out';
  }, []);

  const scratch = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.fill();

    // Calculate progress
    checkProgress();
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
      setTimeout(() => onComplete(), 500);
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

  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h3 className="mb-2 text-2xl font-bold">Scratch to Reveal!</h3>
        <p className="text-foreground/70">
          Swipe or drag to scratch off and reveal your prize
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md">
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-foreground/70">Revealed</span>
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

      {/* Scratch Card */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-spark-blue/20 bg-[var(--card-bg)]">
        {/* Hidden content behind */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-spark-orange/20 to-spark-purple/20 p-8">
          <div className="text-center">
            <motion.div
              className="mb-4 text-6xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🎉
            </motion.div>
            <div className="text-4xl font-bold text-spark-orange">
              You Won!
            </div>
          </div>
        </div>

        {/* Scratch-off canvas */}
        <canvas
          ref={canvasRef}
          className="relative cursor-crosshair touch-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      </div>

      <p className="text-center text-sm text-foreground/50">
        Tip: Click and drag to scratch off the surface
      </p>
    </div>
  );
}
