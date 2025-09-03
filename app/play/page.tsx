"use client";

import { useState, useEffect } from "react";
import { Puzzle as PuzzleIcon, RotateCcw, CheckCircle, Eye, Trash2, Trophy } from "lucide-react";

import type { Puzzle, Clue } from "@/types/crossword";
import { generatePuzzle } from "@/lib/generator";
import { isPuzzleSolved, getPuzzleCompletionPercentage, cellsForClue } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BasicCrosswordGrid } from "@/components/basic-crossword-grid";
import { BasicClueList } from "@/components/basic-clue-list";
import { GameTimer } from "@/components/game-timer";

export default function PlayPage() {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [selectedClue, setSelectedClue] = useState<Clue | undefined>();
  const [showSolution, setShowSolution] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);

  useEffect(() => {
    // Generate initial puzzle
    handleNewPuzzle();
  }, []);

  const handleNewPuzzle = () => {
    const seed = `puzzle-${Date.now()}`;
    const newPuzzle = generatePuzzle(seed);
    setPuzzle(newPuzzle);
    setSelectedClue(undefined);
    setShowSolution(false);
    setGameTime(0);
    setIsGameActive(true);
    
    // Auto-select first across clue
    if (newPuzzle.clues.across.length > 0) {
      setSelectedClue(newPuzzle.clues.across[0]);
    }
  };

  const handleRevealSolution = () => {
    if (!puzzle) return;
    
    const solvedGrid = puzzle.grid.map(row =>
      row.map(cell => ({
        ...cell,
        guess: cell.solution || ""
      }))
    );
    
    setPuzzle({ ...puzzle, grid: solvedGrid });
    setShowSolution(true);
    setIsGameActive(false);
  };

  const handleClearPuzzle = () => {
    if (!puzzle) return;
    
    const clearedGrid = puzzle.grid.map(row =>
      row.map(cell => ({
        ...cell,
        guess: ""
      }))
    );
    
    setPuzzle({ ...puzzle, grid: clearedGrid });
    setShowSolution(false);
    setIsGameActive(true);
  };

  const handleCheckAnswers = () => {
    if (!puzzle) return;
    
    // Just trigger a re-render to show correct/incorrect colors
    setPuzzle({ ...puzzle });
  };

  const handleClueSelect = (clue: Clue) => {
    setSelectedClue(clue);
    
    // Jump to first cell of the clue
    const cells = cellsForClue(puzzle!, clue);
    if (cells.length > 0) {
      // This will be handled by the grid component
    }
  };

  const handlePuzzleChange = (newPuzzle: Puzzle) => {
    setPuzzle(newPuzzle);
    
    // Check if puzzle is now solved
    if (isPuzzleSolved(newPuzzle) && isGameActive) {
      setIsGameActive(false);
    }
  };

  if (!puzzle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Generating puzzle...</p>
          </div>
        </div>
      </div>
    );
  }

  const isSolved = isPuzzleSolved(puzzle);
  const completionPercentage = getPuzzleCompletionPercentage(puzzle);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <PuzzleIcon className="h-8 w-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900">Mini Crossword</h1>
          </div>
          <p className="text-lg text-gray-600">
            Phase 2 - Enhanced Interactive Experience
          </p>
        </header>

        {/* Status */}
        {isSolved && (
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-3 bg-green-100 border border-green-300 rounded-lg px-6 py-3">
              <Trophy className="h-6 w-6 text-green-600" />
              <div className="text-center">
                <div className="text-green-800 font-semibold text-lg">Puzzle Solved! 🎉</div>
                <div className="text-green-700 text-sm">
                  Completed in {Math.floor(gameTime / 60)}:{(gameTime % 60).toString().padStart(2, '0')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Timer and Stats */}
        <div className="mb-6 flex justify-center items-center gap-6">
          <GameTimer 
            isActive={isGameActive && !isSolved} 
            onTimeUpdate={setGameTime}
          />
          <div className="text-sm text-gray-600">
            {completionPercentage}% Complete
          </div>
          {selectedClue && (
            <div className="text-sm text-gray-600">
              Current: {selectedClue.number} {selectedClue.direction.toLowerCase()}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mb-6 flex justify-center gap-4">
          <Button onClick={handleNewPuzzle} variant="default">
            <RotateCcw className="h-4 w-4 mr-2" />
            New Puzzle
          </Button>
          <Button onClick={handleCheckAnswers} variant="outline">
            <CheckCircle className="h-4 w-4 mr-2" />
            Check Answers
          </Button>
          <Button onClick={handleRevealSolution} variant="outline" disabled={showSolution}>
            <Eye className="h-4 w-4 mr-2" />
            Reveal Solution
          </Button>
          <Button onClick={handleClearPuzzle} variant="outline">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Crossword Grid */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Crossword Grid</span>
                  {selectedClue && (
                    <span className="text-sm font-normal text-blue-600">
                      {selectedClue.number} {selectedClue.direction}: {selectedClue.text}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <BasicCrosswordGrid
                  puzzle={puzzle}
                  onPuzzleChange={handlePuzzleChange}
                  selectedClue={selectedClue}
                  onClueSelect={handleClueSelect}
                />
              </CardContent>
            </Card>
          </div>

          {/* Clues */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Clues</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <BasicClueList
                  clues={puzzle.clues.across}
                  title="Across"
                  puzzle={puzzle}
                  selectedClue={selectedClue}
                  onClueSelect={handleClueSelect}
                />
                
                <BasicClueList
                  clues={puzzle.clues.down}
                  title="Down"
                  puzzle={puzzle}
                  selectedClue={selectedClue}
                  onClueSelect={handleClueSelect}
                />
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>How to Play</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>• <strong>Click cells</strong> to select and highlight clues</p>
                <p>• <strong>Type letters</strong> - auto-advances to next cell</p>
                <p>• <strong>Arrow keys</strong> to navigate grid</p>
                <p>• <strong>Click clues</strong> to jump to that word</p>
                <p>• <strong>Backspace</strong> to clear and go back</p>
                <p>• <strong>Colors:</strong> Blue = selected, Green = correct, Red = wrong</p>
              </CardContent>
            </Card>

            {/* Debug Info */}
            <Card>
              <CardHeader>
                <CardTitle>Debug Info</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-1">
                <p>Puzzle ID: {puzzle.id}</p>
                <p>Seed: {puzzle.seed}</p>
                <p>Across Clues: {puzzle.clues.across.length}</p>
                <p>Down Clues: {puzzle.clues.down.length}</p>
                {showSolution && <p className="text-orange-600">Solution revealed</p>}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
