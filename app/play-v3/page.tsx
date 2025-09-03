"use client";

import { useState, useEffect } from "react";
import { 
  Puzzle as PuzzleIcon, 
  RotateCcw, 
  CheckCircle, 
  Eye, 
  Trash2, 
  Trophy,
  Calendar,
  Settings,
  BarChart3
} from "lucide-react";

import type { Puzzle, Clue } from "@/types/crossword";
import type { Difficulty } from "@/types/game";
import { generatePuzzleV2 } from "@/lib/generator-v2";
import { isPuzzleSolved, getPuzzleCompletionPercentage, cellsForClue } from "@/lib/validation";
import { getTodaysPuzzle, getTodaysDifficulty, isToday } from "@/lib/daily-puzzle";
import { recordPuzzleCompletion, loadStats } from "@/lib/stats";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BasicCrosswordGrid } from "@/components/basic-crossword-grid";
import { BasicClueList } from "@/components/basic-clue-list";
import { GameTimer } from "@/components/game-timer";
import { DifficultySelector, DifficultyBadge } from "@/components/difficulty-selector";
import { HintsPanel } from "@/components/hints-panel";
import { StatsPanel } from "@/components/stats-panel";

type GameMode = "PRACTICE" | "DAILY";

export default function PlayV3Page() {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [selectedClue, setSelectedClue] = useState<Clue | undefined>();
  const [showSolution, setShowSolution] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("MEDIUM");
  const [gameMode, setGameMode] = useState<GameMode>("PRACTICE");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [showHints, setShowHints] = useState(true);

  // Generate initial puzzle
  useEffect(() => {
    handleNewPuzzle();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNewPuzzle = () => {
    let newPuzzle: Puzzle;
    
    if (gameMode === "DAILY") {
      const todaysDifficulty = getTodaysDifficulty();
      newPuzzle = getTodaysPuzzle(todaysDifficulty);
      setDifficulty(todaysDifficulty);
    } else {
      const seed = `practice-${Date.now()}`;
      newPuzzle = generatePuzzleV2(seed, difficulty);
    }
    
    setPuzzle(newPuzzle);
    setSelectedClue(undefined);
    setShowSolution(false);
    setGameTime(0);
    setIsGameActive(true);
    setHintsUsed(0);
    
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
    setHintsUsed(0);
  };

  const handleCheckAnswers = () => {
    if (!puzzle) return;
    
    // Just trigger a re-render to show correct/incorrect colors
    setPuzzle({ ...puzzle });
  };

  const handleClueSelect = (clue: Clue) => {
    setSelectedClue(clue);
  };

  const handlePuzzleChange = (newPuzzle: Puzzle) => {
    setPuzzle(newPuzzle);
    
    // Check if puzzle is now solved
    if (isPuzzleSolved(newPuzzle) && isGameActive) {
      setIsGameActive(false);
      
      // Record completion
      recordPuzzleCompletion(difficulty, gameTime, hintsUsed, newPuzzle.id);
    }
  };

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    
    // Generate new puzzle with new difficulty if in practice mode
    if (gameMode === "PRACTICE") {
      const seed = `practice-${Date.now()}`;
      const newPuzzle = generatePuzzleV2(seed, newDifficulty);
      setPuzzle(newPuzzle);
      setSelectedClue(undefined);
      setShowSolution(false);
      setGameTime(0);
      setIsGameActive(true);
      setHintsUsed(0);
      
      if (newPuzzle.clues.across.length > 0) {
        setSelectedClue(newPuzzle.clues.across[0]);
      }
    }
  };

  const handleModeChange = (mode: GameMode) => {
    setGameMode(mode);
    handleNewPuzzle();
  };

  const handleHintUsed = () => {
    setHintsUsed(prev => prev + 1);
  };

  if (!puzzle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Generating puzzle...</p>
          </div>
        </div>
      </div>
    );
  }

  const isSolved = isPuzzleSolved(puzzle);
  const completionPercentage = getPuzzleCompletionPercentage(puzzle);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 lg:p-8">
      <div className="container mx-auto max-w-7xl">
        <header className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <PuzzleIcon className="h-8 w-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900">Mini Crossword</h1>
          </div>
          <p className="text-lg text-gray-600">
            Phase 3 - Professional Experience
          </p>
        </header>

        {/* Game Mode & Difficulty Selector */}
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="flex gap-2">
            <Button
              variant={gameMode === "PRACTICE" ? "default" : "outline"}
              onClick={() => handleModeChange("PRACTICE")}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Practice
            </Button>
            <Button
              variant={gameMode === "DAILY" ? "default" : "outline"}
              onClick={() => handleModeChange("DAILY")}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Daily Challenge
            </Button>
          </div>
          
          {gameMode === "PRACTICE" && (
            <DifficultySelector
              selectedDifficulty={difficulty}
              onDifficultyChange={handleDifficultyChange}
            />
          )}
          
          {gameMode === "DAILY" && (
            <DifficultyBadge difficulty={difficulty} />
          )}
        </div>

        {/* Status */}
        {isSolved && (
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-3 bg-green-100 border border-green-300 rounded-lg px-6 py-3">
              <Trophy className="h-6 w-6 text-green-600" />
              <div className="text-center">
                <div className="text-green-800 font-semibold text-lg">Puzzle Solved! 🎉</div>
                <div className="text-green-700 text-sm">
                  Completed in {Math.floor(gameTime / 60)}:{(gameTime % 60).toString().padStart(2, '0')}
                  {hintsUsed > 0 && ` • ${hintsUsed} hints used`}
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
          {hintsUsed > 0 && (
            <div className="text-sm text-gray-600">
              Hints: {hintsUsed}
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
          
          <Button 
            onClick={handleRevealSolution} 
            variant="outline"
            className="text-orange-600 hover:text-orange-700"
          >
            <Eye className="h-4 w-4 mr-2" />
            Reveal Solution
          </Button>
          
          <Button 
            onClick={handleClearPuzzle} 
            variant="outline"
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
          
          <Button
            onClick={() => setShowStats(!showStats)}
            variant="outline"
            className="lg:hidden"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Stats
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-4">
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
                <p>• <strong>Hints:</strong> Use sparingly for best score!</p>
              </CardContent>
            </Card>
          </div>

          {/* Hints & Stats Panel */}
          <div className="space-y-6">
            {showHints && (
              <HintsPanel
                puzzle={puzzle}
                selectedClue={selectedClue}
                hintsUsed={hintsUsed}
                onPuzzleChange={handlePuzzleChange}
                onHintUsed={handleHintUsed}
                disabled={isSolved}
              />
            )}
            
            {(showStats || window.innerWidth >= 1024) && (
              <StatsPanel currentDifficulty={difficulty} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
