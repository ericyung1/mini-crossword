"use client";

import { useState } from "react";

import type { Puzzle, Cell } from "@/types/crossword";
import { cn } from "@/lib/utils";
import { isCellCorrect } from "@/lib/validation";

interface BasicCrosswordGridProps {
  puzzle: Puzzle;
  onPuzzleChange: (puzzle: Puzzle) => void;
}

export function BasicCrosswordGrid({ puzzle, onPuzzleChange }: BasicCrosswordGridProps) {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);

  const handleCellClick = (cell: Cell) => {
    if (cell.isBlock) return;
    setSelectedCell({ row: cell.row, col: cell.col });
  };

  const handleKeyPress = (event: React.KeyboardEvent, cell: Cell) => {
    if (cell.isBlock) return;
    
    const key = event.key.toUpperCase();
    
    if (key === "BACKSPACE" || key === "DELETE") {
      updateCellGuess(cell, "");
      return;
    }
    
    if (key.length === 1 && /[A-Z]/.test(key)) {
      updateCellGuess(cell, key);
    }
  };

  const updateCellGuess = (cell: Cell, guess: string) => {
    const newGrid = puzzle.grid.map(row =>
      row.map(c => 
        c.row === cell.row && c.col === cell.col
          ? { ...c, guess }
          : c
      )
    );
    
    const newPuzzle = { ...puzzle, grid: newGrid };
    onPuzzleChange(newPuzzle);
  };

  const isSelectedCell = (cell: Cell) => {
    return selectedCell?.row === cell.row && selectedCell?.col === cell.col;
  };

  return (
    <div className="inline-block border-2 border-gray-800 bg-white">
      {puzzle.grid.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={cn(
                "relative h-12 w-12 border border-gray-400 cursor-pointer select-none",
                cell.isBlock
                  ? "bg-black"
                  : cn(
                      "bg-white hover:bg-gray-50",
                      isSelectedCell(cell) && "bg-blue-200",
                      cell.guess && isCellCorrect(cell) && "bg-green-100",
                      cell.guess && !isCellCorrect(cell) && cell.guess !== "" && "bg-red-100"
                    )
              )}
              onClick={() => handleCellClick(cell)}
              onKeyDown={(e) => handleKeyPress(e, cell)}
              tabIndex={cell.isBlock ? -1 : 0}
            >
              {!cell.isBlock && (
                <>
                  {/* Cell number */}
                  {cell.number && (
                    <span className="absolute left-0.5 top-0 text-xs font-bold leading-none">
                      {cell.number}
                    </span>
                  )}
                  
                  {/* User's guess */}
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-lg font-bold">
                      {cell.guess || ""}
                    </span>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
