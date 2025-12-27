'use client';

import { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Zap } from 'lucide-react';

interface PuzzlePiece {
  id: number;
  targetX: number;
  targetY: number;
  placed: boolean;
}

interface DragPuzzleProps {
  onComplete: () => void;
}

export function DragPuzzle({ onComplete }: DragPuzzleProps) {
  const [pieces, setPieces] = useState<PuzzlePiece[]>([
    { id: 1, targetX: 0, targetY: 0, placed: false },
    { id: 2, targetX: 100, targetY: 0, placed: false },
    { id: 3, targetX: 0, targetY: 100, placed: false },
    { id: 4, targetX: 100, targetY: 100, placed: false },
  ]);

  const checkPiecePlacement = (
    pieceId: number,
    x: number,
    y: number,
    targetX: number,
    targetY: number
  ) => {
    const threshold = 30;
    const isClose =
      Math.abs(x - targetX) < threshold && Math.abs(y - targetY) < threshold;

    if (isClose) {
      setPieces((prev) => {
        const newPieces = prev.map((p) =>
          p.id === pieceId ? { ...p, placed: true } : p
        );

        // Check if all pieces are placed using the NEW state
        const allPlaced = newPieces.every((p) => p.placed);
        if (allPlaced) {
          setTimeout(() => onComplete(), 500);
        }

        return newPieces;
      });
    }
  };

  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h3 className="mb-2 text-2xl font-bold">Complete the Lightning!</h3>
        <p className="text-foreground/70">
          Drag the puzzle pieces to their correct positions
        </p>
      </div>

      <div className="relative">
        {/* Target Grid */}
        <div className="grid grid-cols-2 gap-2 rounded-2xl border-2 border-dashed border-spark-blue/30 bg-[var(--card-bg)] p-4">
          {pieces.map((piece) => (
            <div
              key={`target-${piece.id}`}
              className="h-24 w-24 rounded-lg border border-spark-blue/20 bg-spark-blue/5"
            />
          ))}
        </div>

        {/* Draggable Pieces */}
        <div className="absolute inset-0">
          {pieces.map((piece) =>
            piece.placed ? (
              <motion.div
                key={piece.id}
                className="absolute left-4 top-4 h-24 w-24 rounded-lg bg-gradient-to-br from-spark-orange to-spark-orange-dark"
                style={{
                  x: piece.targetX,
                  y: piece.targetY,
                }}
                initial={{ scale: 0, rotate: 360 }}
                animate={{ scale: 1, rotate: 0 }}
              >
                <div className="flex h-full items-center justify-center">
                  <Zap className="h-12 w-12 text-white" />
                </div>
              </motion.div>
            ) : (
              <DraggablePiece
                key={piece.id}
                id={piece.id}
                targetX={piece.targetX}
                targetY={piece.targetY}
                onDrop={checkPiecePlacement}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}

function DraggablePiece({
  id,
  targetX,
  targetY,
  onDrop,
}: {
  id: number;
  targetX: number;
  targetY: number;
  onDrop: (id: number, x: number, y: number, targetX: number, targetY: number) => void;
}) {
  const x = useMotionValue(targetX + (Math.random() - 0.5) * 200);
  const y = useMotionValue(targetY + (Math.random() - 0.5) * 200);
  const rotate = useTransform(x, [-100, 100], [-25, 25]);

  return (
    <motion.div
      className="absolute left-4 top-4 h-24 w-24 cursor-grab rounded-lg bg-gradient-to-br from-spark-orange to-spark-orange-dark shadow-xl active:cursor-grabbing"
      style={{ x, y, rotate }}
      drag
      dragElastic={0.1}
      dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
      onDragEnd={(_, info) => {
        const finalX = x.get();
        const finalY = y.get();
        onDrop(id, finalX, finalY, targetX, targetY);
      }}
      whileHover={{ scale: 1.1 }}
      whileDrag={{ scale: 1.2, zIndex: 10 }}
    >
      <div className="flex h-full items-center justify-center">
        <Zap className="h-12 w-12 text-white" />
      </div>
    </motion.div>
  );
}
