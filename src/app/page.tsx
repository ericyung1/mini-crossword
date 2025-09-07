'use client';

import { useState, useEffect, useCallback } from 'react';
import CrosswordGrid from '@/components/CrosswordGrid';
import ClueDisplay from '@/components/ClueDisplay';
import Timer from '@/components/Timer';
import GameControls from '@/components/GameControls';
import { GeneratedCrossword } from '@/lib/crossword-generator';

interface GameState {
  puzzle: GeneratedCrossword | null;
  selectedCell: { row: number; col: number } | null;
  selectedDirection: 'across' | 'down';
  autoCheck: boolean;
  isRevealed: boolean;
  isLoading: boolean;
  completedWords: Set<string>;
  userAnswers: { [key: string]: string }; // slot id -> user's word
  timerRunning: boolean;
  timerReset: number;
}

export default function Home() {
  const [gameState, setGameState] = useState<GameState>({
    puzzle: null,
    selectedCell: null,
    selectedDirection: 'across',
    autoCheck: false,
    isRevealed: false,
    isLoading: true,
    completedWords: new Set(),
    userAnswers: {},
    timerRunning: false,
    timerReset: 0
  });

  // Load initial puzzle
  const loadNewPuzzle = useCallback(async () => {
    setGameState(prev => ({ 
      ...prev, 
      isLoading: true,
      puzzle: null,
      selectedCell: null,
      isRevealed: false,
      completedWords: new Set(),
      userAnswers: {},
      timerRunning: false,
      timerReset: prev.timerReset + 1
    }));

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generateClues: true })
      });
      
      const data = await response.json();
      
      if (data.success && data.puzzle) {
        setGameState(prev => ({
          ...prev,
          puzzle: data.puzzle,
          isLoading: false,
          selectedCell: { row: 0, col: 1 }, // Start at first available cell
          timerRunning: true
        }));
      } else {
        throw new Error(data.error || 'Failed to generate puzzle');
      }
    } catch (error) {
      console.error('Error loading puzzle:', error);
      setGameState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Load puzzle on mount
  useEffect(() => {
    loadNewPuzzle();
  }, [loadNewPuzzle]);

  // Get correct answers map
  const getCorrectAnswers = (): { [key: string]: string } => {
    if (!gameState.puzzle) return {};
    
    const answers: { [key: string]: string } = {};
    gameState.puzzle.words.forEach(wordData => {
      answers[wordData.slot.id] = wordData.word;
    });
    return answers;
  };

  // Handle cell changes
  const handleCellChange = (row: number, col: number, letter: string) => {
    if (!gameState.puzzle) return;

    // Find which slots this cell belongs to
    const affectedSlots = gameState.puzzle.slots.filter(slot =>
      slot.cells.some(cell => cell.row === row && cell.col === col)
    );

    // Update user answers for affected slots
    const correctAnswers = getCorrectAnswers();
    const newUserAnswers = { ...gameState.userAnswers };
    const newCompletedWords = new Set(gameState.completedWords);

    affectedSlots.forEach(slot => {
      // Rebuild the word from current user input
      let userWord = '';
      slot.cells.forEach(cell => {
        if (cell.row === row && cell.col === col) {
          userWord += letter.toLowerCase();
        } else {
          // Get existing letter from grid (this would need to be tracked)
          userWord += '?'; // Placeholder - we'd need to track this properly
        }
      });

      newUserAnswers[slot.id] = userWord;

      // Check if word is completed and correct
      const correctWord = correctAnswers[slot.id];
      if (correctWord && userWord.length === correctWord.length && 
          !userWord.includes('?') && userWord === correctWord) {
        newCompletedWords.add(slot.id);
      } else {
        newCompletedWords.delete(slot.id);
      }
    });

    setGameState(prev => ({
      ...prev,
      userAnswers: newUserAnswers,
      completedWords: newCompletedWords
    }));
  };

  // Handle cell selection
  const handleCellSelect = (row: number, col: number) => {
    if (!gameState.puzzle) return;

    // If clicking the same cell, toggle direction
    if (gameState.selectedCell?.row === row && gameState.selectedCell?.col === col) {
      const newDirection = gameState.selectedDirection === 'across' ? 'down' : 'across';
      
      // Check if there's a word in the new direction at this cell
      const slotsInDirection = gameState.selectedDirection === 'across' 
        ? gameState.puzzle.downSlots 
        : gameState.puzzle.acrossSlots;
      
      const hasWordInDirection = slotsInDirection.some(slot =>
        slot.cells.some(cell => cell.row === row && cell.col === col)
      );

      if (hasWordInDirection) {
        setGameState(prev => ({
          ...prev,
          selectedDirection: newDirection
        }));
      }
    } else {
      setGameState(prev => ({
        ...prev,
        selectedCell: { row, col }
      }));
    }
  };

  // Handle clue click
  const handleClueClick = (slot: any) => {
    const firstCell = slot.cells[0];
    setGameState(prev => ({
      ...prev,
      selectedCell: { row: firstCell.row, col: firstCell.col },
      selectedDirection: slot.direction
    }));
  };

  // Handle game controls
  const handleAutoCheckToggle = () => {
    setGameState(prev => ({
      ...prev,
      autoCheck: !prev.autoCheck
    }));
  };

  const handleRevealSolution = () => {
    setGameState(prev => ({
      ...prev,
      isRevealed: true,
      timerRunning: false
    }));
  };

  // Check if puzzle is completed
  const isPuzzleCompleted = gameState.puzzle && 
    gameState.completedWords.size === gameState.puzzle.words.length;

  // Stop timer when completed
  useEffect(() => {
    if (isPuzzleCompleted && gameState.timerRunning) {
      setGameState(prev => ({ ...prev, timerRunning: false }));
    }
  }, [isPuzzleCompleted, gameState.timerRunning]);

  if (gameState.isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Generating your crossword puzzle...</p>
        </div>
      </main>
    );
  }

  if (!gameState.puzzle) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load puzzle</p>
          <button
            onClick={loadNewPuzzle}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Mini Crossword
          </h1>
          <p className="text-gray-600">
            NYT-style 5×5 crossword puzzle
          </p>
        </div>

        {/* Timer */}
        <div className="flex justify-center mb-6">
          <Timer
            isRunning={gameState.timerRunning}
            resetTrigger={gameState.timerReset}
            className="bg-white px-4 py-2 rounded-lg shadow-lg"
          />
        </div>

        {/* Game Controls */}
        <div className="mb-6">
          <GameControls
            autoCheck={gameState.autoCheck}
            onAutoCheckToggle={handleAutoCheckToggle}
            onRevealSolution={handleRevealSolution}
            onNewPuzzle={loadNewPuzzle}
            isRevealed={gameState.isRevealed}
            isCompleted={!!isPuzzleCompleted}
            isLoading={gameState.isLoading}
          />
        </div>

        {/* Main Game Area */}
        <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
          {/* Crossword Grid */}
          <div className="flex-shrink-0">
            <CrosswordGrid
              grid={gameState.puzzle.grid}
              slots={gameState.puzzle.slots}
              acrossSlots={gameState.puzzle.acrossSlots}
              downSlots={gameState.puzzle.downSlots}
              onCellChange={handleCellChange}
              onCellSelect={handleCellSelect}
              selectedCell={gameState.selectedCell}
              selectedDirection={gameState.selectedDirection}
              autoCheck={gameState.autoCheck}
              revealed={gameState.isRevealed}
              correctAnswers={getCorrectAnswers()}
            />
          </div>

          {/* Clues */}
          <div className="flex-shrink-0 w-full lg:w-auto">
            <ClueDisplay
              acrossSlots={gameState.puzzle.acrossSlots}
              downSlots={gameState.puzzle.downSlots}
              words={gameState.puzzle.words}
              selectedCell={gameState.selectedCell}
              selectedDirection={gameState.selectedDirection}
              onClueClick={handleClueClick}
              completedWords={gameState.completedWords}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <a 
            href="/diagnostics" 
            className="hover:text-blue-600 transition-colors"
          >
            🔍 Word Bank Diagnostics
          </a>
        </div>
      </div>
    </main>
  );
}
