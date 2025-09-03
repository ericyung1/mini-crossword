"use client";

import { useState, useEffect, useCallback } from "react";

import type { Puzzle, Cell, Clue } from "@/types/crossword";
import { cn } from "@/lib/utils";
import { isCellCorrect, cellsForClue } from "@/lib/validation";

interface BasicCrosswordGridProps {
  puzzle: Puzzle;
  onPuzzleChange: (puzzle: Puzzle) => void;
  selectedClue?: Clue;
  onClueSelect: (clue: Clue) => void;
}

export function BasicCrosswordGrid({ 
  puzzle, 
  onPuzzleChange, 
  selectedClue, 
  onClueSelect 
}: BasicCrosswordGridProps) {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [direction, setDirection] = useState<"ACROSS" | "DOWN">("ACROSS");

  // Find clues that intersect with a cell
  const findIntersectingClues = (cell: Cell) => {
    const acrossClue = puzzle.clues.across.find(clue => {
      const cells = cellsForClue(puzzle, clue);
      return cells.some(c => c.row === cell.row && c.col === cell.col);
    });
    
    const downClue = puzzle.clues.down.find(clue => {
      const cells = cellsForClue(puzzle, clue);
      return cells.some(c => c.row === cell.row && c.col === cell.col);
    });
    
    return { acrossClue, downClue };
  };

  const handleCellClick = (cell: Cell) => {
    if (cell.isBlock) return;
    
    const wasSelected = selectedCell?.row === cell.row && selectedCell?.col === cell.col;
    setSelectedCell({ row: cell.row, col: cell.col });
    
    const { acrossClue, downClue } = findIntersectingClues(cell);
    
    if (wasSelected) {
      // Toggle direction if clicking same cell
      if (selectedClue?.direction === "ACROSS" && downClue) {
        onClueSelect(downClue);
        setDirection("DOWN");
      } else if (selectedClue?.direction === "DOWN" && acrossClue) {
        onClueSelect(acrossClue);
        setDirection("ACROSS");
      }
    } else {
      // Smart clue selection based on current direction preference
      if (direction === "ACROSS" && acrossClue) {
        onClueSelect(acrossClue);
      } else if (direction === "DOWN" && downClue) {
        onClueSelect(downClue);
      } else if (acrossClue) {
        onClueSelect(acrossClue);
        setDirection("ACROSS");
      } else if (downClue) {
        onClueSelect(downClue);
        setDirection("DOWN");
      }
    }
  };

  const moveToNextCell = useCallback((currentCell: Cell, moveDirection?: "FORWARD" | "BACKWARD") => {
    if (!selectedClue) return;
    
    const cells = cellsForClue(puzzle, selectedClue);
    const currentIndex = cells.findIndex(c => c.row === currentCell.row && c.col === currentCell.col);
    
    if (currentIndex === -1) return;
    
    let nextIndex;
    if (moveDirection === "BACKWARD") {
      nextIndex = currentIndex - 1;
    } else {
      nextIndex = currentIndex + 1;
    }
    
    if (nextIndex >= 0 && nextIndex < cells.length) {
      const nextCell = cells[nextIndex];
      setSelectedCell({ row: nextCell.row, col: nextCell.col });
    }
  }, [selectedClue, puzzle]);

  const handleArrowKey = (key: string, currentCell: Cell) => {
    let newRow = currentCell.row;
    let newCol = currentCell.col;
    
    switch (key) {
      case "ARROWUP":
        newRow = Math.max(0, newRow - 1);
        break;
      case "ARROWDOWN":
        newRow = Math.min(4, newRow + 1);
        break;
      case "ARROWLEFT":
        newCol = Math.max(0, newCol - 1);
        break;
      case "ARROWRIGHT":
        newCol = Math.min(4, newCol + 1);
        break;
      default:
        return;
    }
    
    const newCell = puzzle.grid[newRow][newCol];
    if (!newCell.isBlock) {
      handleCellClick(newCell);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent, cell: Cell) => {
    if (cell.isBlock) return;
    
    const key = event.key.toUpperCase();
    
    // Handle arrow keys
    if (key.startsWith("ARROW")) {
      event.preventDefault();
      handleArrowKey(key, cell);
      return;
    }
    
    if (key === "BACKSPACE" || key === "DELETE") {
      updateCellGuess(cell, "");
      moveToNextCell(cell, "BACKWARD");
      return;
    }
    
    if (key.length === 1 && /[A-Z]/.test(key)) {
      updateCellGuess(cell, key);
      // Auto-advance to next cell
      moveToNextCell(cell, "FORWARD");
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

  const isInSelectedClue = (cell: Cell) => {
    if (!selectedClue) return false;
    const cells = cellsForClue(puzzle, selectedClue);
    return cells.some(c => c.row === cell.row && c.col === cell.col);
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
                      "bg-white hover:bg-gray-50 transition-all duration-200",
                      isSelectedCell(cell) && "bg-blue-300 ring-2 ring-blue-400",
                      isInSelectedClue(cell) && !isSelectedCell(cell) && "bg-blue-100",
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
