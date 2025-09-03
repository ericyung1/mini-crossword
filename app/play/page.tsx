"use client";

import { useState, useEffect } from "react";
import { Puzzle as PuzzleIcon, RotateCcw, CheckCircle, Eye, Trash2 } from "lucide-react";

import type { Puzzle } from "@/types/crossword";
import { generatePuzzle } from "@/lib/generator";
import { isPuzzleSolved, getPuzzleCompletionPercentage } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BasicCrosswordGrid } from "@/components/basic-crossword-grid";
import { BasicClueList } from "@/components/basic-clue-list";

export default function PlayPage() {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    // Generate initial puzzle
    handleNewPuzzle();
  }, []);

  const handleNewPuzzle = () => {
    const seed = `puzzle-${Date.now()}`;
    const newPuzzle = generatePuzzle(seed);
    setPuzzle(newPuzzle);
    setShowSolution(false);
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
  };

  const handleCheckAnswers = () => {
    if (!puzzle) return;
    
    // Just trigger a re-render to show correct/incorrect colors
    setPuzzle({ ...puzzle });
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
            Phase 1 Test - Basic Playable Version
          </p>
        </header>

        {/* Status */}
        {isSolved && (
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-2 bg-green-100 border border-green-300 rounded-lg px-4 py-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800 font-semibold">Puzzle Solved! 🎉</span>
            </div>
          </div>
        )}

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
                  <span className="text-sm font-normal text-gray-600">
                    {completionPercentage}% Complete
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <BasicCrosswordGrid
                  puzzle={puzzle}
                  onPuzzleChange={setPuzzle}
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
                />
                
                <BasicClueList
                  clues={puzzle.clues.down}
                  title="Down"
                  puzzle={puzzle}
                />
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>How to Play</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>• Click on a cell to select it</p>
                <p>• Type letters to fill cells</p>
                <p>• Use Backspace to clear</p>
                <p>• Green = correct answer</p>
                <p>• Red = incorrect answer</p>
                <p>• Click "Check Answers" to validate</p>
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
