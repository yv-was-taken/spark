'use client';

import { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Zap } from 'lucide-react';

interface PuzzlePiece {
  id: number;
  slotRotation: number | null; // Which slot this piece is in (0, 120, 240, or null if not placed)
  placed: boolean;
}

interface DragPuzzleProps {
  onComplete: () => void;
}

const SLOT_ROTATIONS = [0, 120, 240]; // Three slots at these rotations

export function DragPuzzle({ onComplete }: DragPuzzleProps) {
  const [pieces, setPieces] = useState<PuzzlePiece[]>([
    { id: 1, slotRotation: null, placed: false },
    { id: 2, slotRotation: null, placed: false },
    { id: 3, slotRotation: null, placed: false },
  ]);

  // Get list of filled slot rotations
  const getFilledSlots = (currentPieces: PuzzlePiece[]) => {
    return currentPieces
      .filter(p => p.placed && p.slotRotation !== null)
      .map(p => p.slotRotation as number);
  };

  const checkPiecePlacement = (
    pieceId: number,
    x: number,
    y: number
  ) => {
    const threshold = 50;
    const centerX = 0;
    const centerY = 0;
    const isClose =
      Math.abs(x - centerX) < threshold && Math.abs(y - centerY) < threshold;

    if (isClose) {
      setPieces((prev) => {
        const filledSlots = getFilledSlots(prev);
        const openSlots = SLOT_ROTATIONS.filter(slot => !filledSlots.includes(slot));

        // If no open slots, don't place
        if (openSlots.length === 0) return prev;

        // Assign to first available slot
        const assignedSlot = openSlots[0];

        const newPieces = prev.map((p) =>
          p.id === pieceId ? { ...p, placed: true, slotRotation: assignedSlot } : p
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
        <h3 className="mb-2 text-2xl font-bold">Complete the Circle!</h3>
        <p className="text-foreground/70">
          Drag the pie slices to complete the lightning circle
        </p>
      </div>

      <div className="relative flex items-center justify-center" style={{ width: 300, height: 300 }}>
        {/* Target Circle - dashed outline */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-48 w-48 rounded-full border-4 border-dashed border-spark-blue/30" />
        </div>

        {/* Draggable Pieces */}
        <div className="absolute inset-0 flex items-center justify-center">
          {pieces.map((piece) => {
            const filledSlots = getFilledSlots(pieces);
            const openSlots = SLOT_ROTATIONS.filter(slot => !filledSlots.includes(slot));
            const nextSlot = openSlots[0] ?? 0;

            return piece.placed && piece.slotRotation !== null ? (
              <PieSlice
                key={piece.id}
                rotation={piece.slotRotation}
                placed={true}
              />
            ) : (
              <DraggablePieSlice
                key={piece.id}
                id={piece.id}
                targetRotation={nextSlot}
                onDrop={checkPiecePlacement}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Pie slice SVG path for 120 degrees (1/3 of circle)
function PieSlice({ rotation, placed }: { rotation: number; placed: boolean }) {
  return (
    <motion.div
      className="absolute"
      style={{
        width: 192,
        height: 192,
        transform: `rotate(${rotation}deg)`,
        zIndex: 1, // Placed pieces stay below draggable pieces
      }}
      initial={placed ? { scale: 0, rotate: rotation + 360 } : {}}
      animate={placed ? { scale: 1, rotate: rotation } : {}}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <path
          d="M 50 50 L 50 0 A 50 50 0 0 1 93.3 75 Z"
          fill="url(#gradient)"
          stroke="#FFB84D"
          strokeWidth="2"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFB84D" />
            <stop offset="100%" stopColor="#FF8C00" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center" style={{ transform: `rotate(-${rotation}deg)` }}>
        <Zap className="h-8 w-8 text-white" />
      </div>
    </motion.div>
  );
}

function DraggablePieSlice({
  id,
  targetRotation,
  onDrop,
}: {
  id: number;
  targetRotation: number;
  onDrop: (id: number, x: number, y: number) => void;
}) {
  const x = useMotionValue((Math.random() - 0.5) * 250);
  const y = useMotionValue((Math.random() - 0.5) * 250);
  const [isDragging, setIsDragging] = useState(false);

  // Random initial rotation for visual variety
  const initialRotation = Math.random() * 360;

  return (
    <motion.div
      className="absolute cursor-grab active:cursor-grabbing"
      style={{
        x,
        y,
        width: 192,
        height: 192,
        zIndex: 5, // Unplaced pieces stay above placed pieces
      }}
      animate={{
        rotate: isDragging ? targetRotation : initialRotation,
      }}
      transition={{
        rotate: { type: 'spring', stiffness: 300, damping: 30 },
      }}
      drag
      dragElastic={0.1}
      dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => {
        setIsDragging(false);
        const finalX = x.get();
        const finalY = y.get();
        onDrop(id, finalX, finalY);
      }}
      whileHover={{ scale: 1.05 }}
      whileDrag={{ scale: 1.1, zIndex: 20 }}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-xl">
        <path
          d="M 50 50 L 50 0 A 50 50 0 0 1 93.3 75 Z"
          fill="url(#gradient-draggable)"
          stroke="#FFB84D"
          strokeWidth="2"
        />
        <defs>
          <linearGradient id="gradient-draggable" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFB84D" />
            <stop offset="100%" stopColor="#FF8C00" />
          </linearGradient>
        </defs>
      </svg>
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          rotate: isDragging ? -targetRotation : -initialRotation,
        }}
        transition={{
          rotate: { type: 'spring', stiffness: 300, damping: 30 },
        }}
      >
        <Zap className="h-8 w-8 text-white" />
      </motion.div>
    </motion.div>
  );
}
