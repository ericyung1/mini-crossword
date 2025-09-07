'use client';

import { useState, useRef, useEffect } from 'react';
import { GridCell, CrosswordSlot } from '@/types/crossword';

interface CrosswordGridProps {
  grid: GridCell[][];
  slots: CrosswordSlot[];
  acrossSlots: CrosswordSlot[];
  downSlots: CrosswordSlot[];
  onCellChange: (row: number, col: number, letter: string) => void;
  onCellSelect: (row: number, col: number) => void;
  selectedCell: { row: number; col: number } | null;
  selectedDirection: 'across' | 'down';
  autoCheck: boolean;
  revealed: boolean;
  correctAnswers?: { [key: string]: string }; // word answers by slot id
}

interface CellProps {
  cell: GridCell;
  row: number;
  col: number;
  isSelected: boolean;
  isInSelectedWord: boolean;
  userLetter: string;
  isCorrect?: boolean;
  isIncorrect?: boolean;
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

function CrosswordCell({
  cell,
  row,
  col,
  isSelected,
  isInSelectedWord,
  userLetter,
  isCorrect,
  isIncorrect,
  onClick,
  onKeyDown,
  inputRef
}: CellProps) {
  if (cell.type === '#') {
    return (
      <div className="w-8 h-8 bg-black border border-gray-400"></div>
    );
  }

  const displayLetter = userLetter.toUpperCase();
  
  return (
    <div 
      className={`
        w-8 h-8 border border-gray-400 relative cursor-pointer
        ${isSelected ? 'bg-yellow-200 border-yellow-400 border-2' : 
          isInSelectedWord ? 'bg-blue-100' : 'bg-white'}
        ${isIncorrect ? 'text-red-500' : isCorrect ? 'text-green-600' : 'text-black'}
        hover:bg-gray-50 transition-colors
      `}
      onClick={onClick}
    >
      {/* Cell number */}
      {cell.number && (
        <div className="absolute top-0 left-0 text-xs font-bold leading-none p-0.5">
          {cell.number}
        </div>
      )}
      
      {/* Letter display */}
      <div className={`
        w-full h-full flex items-center justify-center
        font-bold text-lg pointer-events-none
        ${isIncorrect ? 'text-red-500' : isCorrect ? 'text-green-600' : 'text-black'}
      `}>
        {displayLetter}
      </div>
      
      {/* Hidden input for keyboard handling */}
      <input
        ref={isSelected ? inputRef : undefined}
        type="text"
        maxLength={1}
        value=""
        onChange={() => {}} // Controlled by onKeyDown
        onKeyDown={onKeyDown}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        style={{ caretColor: 'transparent' }}
        readOnly
      />
      
      {/* Incorrect indicator */}
      {isIncorrect && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-6 h-0.5 bg-red-500 rotate-45 absolute"></div>
          <div className="w-6 h-0.5 bg-red-500 -rotate-45 absolute"></div>
        </div>
      )}
    </div>
  );
}

export default function CrosswordGrid({
  grid,
  slots,
  acrossSlots,
  downSlots,
  onCellChange,
  onCellSelect,
  selectedCell,
  selectedDirection,
  autoCheck,
  revealed,
  correctAnswers = {}
}: CrosswordGridProps) {
  const [userGrid, setUserGrid] = useState<string[][]>(
    Array(5).fill(null).map(() => Array(5).fill(''))
  );
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when cell selection changes
  useEffect(() => {
    if (selectedCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedCell]);

  // Get the current selected word slot
  const getSelectedWordSlot = (): CrosswordSlot | null => {
    if (!selectedCell) return null;
    
    const slotsToCheck = selectedDirection === 'across' ? acrossSlots : downSlots;
    return slotsToCheck.find(slot => 
      slot.cells.some(cell => cell.row === selectedCell.row && cell.col === selectedCell.col)
    ) || null;
  };

  const selectedWordSlot = getSelectedWordSlot();

  // Check if a cell is part of the currently selected word
  const isCellInSelectedWord = (row: number, col: number): boolean => {
    if (!selectedWordSlot) return false;
    return selectedWordSlot.cells.some(cell => cell.row === row && cell.col === col);
  };

  // Get the correct answer for a cell
  const getCorrectLetter = (row: number, col: number): string => {
    if (!correctAnswers || !selectedWordSlot) return '';
    
    const word = correctAnswers[selectedWordSlot.id];
    if (!word) return '';
    
    const cellIndex = selectedWordSlot.cells.findIndex(
      cell => cell.row === row && cell.col === col
    );
    
    return cellIndex >= 0 ? word[cellIndex] : '';
  };

  // Check if user's answer is correct
  const isLetterCorrect = (row: number, col: number): boolean => {
    if (!autoCheck || revealed) return false;
    const userLetter = userGrid[row][col].toLowerCase();
    const correctLetter = getCorrectLetter(row, col).toLowerCase();
    return userLetter !== '' && userLetter === correctLetter;
  };

  // Check if user's answer is incorrect
  const isLetterIncorrect = (row: number, col: number): boolean => {
    if (!autoCheck || revealed) return false;
    const userLetter = userGrid[row][col].toLowerCase();
    const correctLetter = getCorrectLetter(row, col).toLowerCase();
    return userLetter !== '' && correctLetter !== '' && userLetter !== correctLetter;
  };

  const handleCellClick = (row: number, col: number) => {
    if (grid[row][col].type === '#') return;
    onCellSelect(row, col);
  };

  const handleKeyDown = (row: number, col: number, e: React.KeyboardEvent) => {
    e.preventDefault();
    
    if (e.key === 'Backspace' || e.key === 'Delete') {
      // Clear current cell
      const newGrid = [...userGrid];
      newGrid[row][col] = '';
      setUserGrid(newGrid);
      onCellChange(row, col, '');
      
      // Move to previous cell in word
      if (selectedWordSlot) {
        const currentIndex = selectedWordSlot.cells.findIndex(
          cell => cell.row === row && cell.col === col
        );
        if (currentIndex > 0) {
          const prevCell = selectedWordSlot.cells[currentIndex - 1];
          onCellSelect(prevCell.row, prevCell.col);
        }
      }
      return;
    }

    if (e.key.match(/^[a-zA-Z]$/)) {
      // Enter letter
      const letter = e.key.toUpperCase();
      const newGrid = [...userGrid];
      newGrid[row][col] = letter;
      setUserGrid(newGrid);
      onCellChange(row, col, letter);
      
      // Move to next cell in word
      if (selectedWordSlot) {
        const currentIndex = selectedWordSlot.cells.findIndex(
          cell => cell.row === row && cell.col === col
        );
        if (currentIndex < selectedWordSlot.cells.length - 1) {
          const nextCell = selectedWordSlot.cells[currentIndex + 1];
          onCellSelect(nextCell.row, nextCell.col);
        }
      }
      return;
    }

    // Arrow key navigation
    let newRow = row;
    let newCol = col;
    
    switch (e.key) {
      case 'ArrowUp':
        newRow = Math.max(0, row - 1);
        break;
      case 'ArrowDown':
        newRow = Math.min(4, row + 1);
        break;
      case 'ArrowLeft':
        newCol = Math.max(0, col - 1);
        break;
      case 'ArrowRight':
        newCol = Math.min(4, col + 1);
        break;
      case 'Tab':
        // Move to next word
        if (selectedWordSlot) {
          const currentSlots = selectedDirection === 'across' ? acrossSlots : downSlots;
          const currentIndex = currentSlots.findIndex(slot => slot.id === selectedWordSlot.id);
          const nextIndex = (currentIndex + 1) % currentSlots.length;
          const nextSlot = currentSlots[nextIndex];
          onCellSelect(nextSlot.cells[0].row, nextSlot.cells[0].col);
        }
        return;
    }

    // Skip black cells
    if (grid[newRow][newCol].type !== '#') {
      onCellSelect(newRow, newCol);
    }
  };

  // Show revealed answers or user input
  const getDisplayLetter = (row: number, col: number): string => {
    if (revealed) {
      // When revealed, show the correct answer for any cell that has one
      const correctLetter = getCorrectAnswerForCell(row, col);
      if (correctLetter) {
        return correctLetter.toUpperCase();
      }
    }
    return userGrid[row][col];
  };

  // Get correct answer for any cell from any word that passes through it
  const getCorrectAnswerForCell = (row: number, col: number): string => {
    if (!correctAnswers) return '';
    
    // Find any slot that contains this cell
    const containingSlot = slots.find(slot =>
      slot.cells.some(cell => cell.row === row && cell.col === col)
    );
    
    if (!containingSlot) return '';
    
    const word = correctAnswers[containingSlot.id];
    if (!word) return '';
    
    const cellIndex = containingSlot.cells.findIndex(
      cell => cell.row === row && cell.col === col
    );
    
    return cellIndex >= 0 ? word[cellIndex] : '';
  };

  return (
    <div className="inline-block p-4 bg-white rounded-lg shadow-lg">
      <div className="grid grid-cols-5 gap-1 border-2 border-gray-800 p-2 bg-white">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <CrosswordCell
              key={`${rowIndex}-${colIndex}`}
              cell={cell}
              row={rowIndex}
              col={colIndex}
              isSelected={
                selectedCell?.row === rowIndex && selectedCell?.col === colIndex
              }
              isInSelectedWord={isCellInSelectedWord(rowIndex, colIndex)}
              userLetter={getDisplayLetter(rowIndex, colIndex)}
              isCorrect={isLetterCorrect(rowIndex, colIndex)}
              isIncorrect={isLetterIncorrect(rowIndex, colIndex)}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              onKeyDown={(e) => handleKeyDown(rowIndex, colIndex, e)}
              inputRef={
                selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                  ? inputRef
                  : undefined
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
