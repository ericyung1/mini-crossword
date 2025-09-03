"use client";

import type { Clue, Puzzle } from "@/types/crossword";
import { cn } from "@/lib/utils";
import { isClueFullyCorrect } from "@/lib/validation";

interface BasicClueListProps {
  clues: Clue[];
  title: string;
  puzzle: Puzzle;
  selectedClue?: Clue;
  onClueSelect: (clue: Clue) => void;
}

export function BasicClueList({ 
  clues, 
  title, 
  puzzle, 
  selectedClue, 
  onClueSelect 
}: BasicClueListProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <div className="space-y-1">
        {clues.map((clue) => (
          <button
            key={clue.id}
            onClick={() => onClueSelect(clue)}
            className={cn(
              "w-full text-left p-3 rounded text-sm border transition-all duration-200 hover:shadow-sm",
              selectedClue?.id === clue.id
                ? "bg-blue-200 border-blue-400 ring-2 ring-blue-300"
                : isClueFullyCorrect(puzzle, clue)
                ? "bg-green-100 border-green-300 text-green-800 hover:bg-green-200"
                : "bg-gray-50 border-gray-200 hover:bg-gray-100"
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold">{clue.number}.</span>{" "}
                <span>{clue.text}</span>
              </div>
              <div className="flex items-center gap-2">
                {isClueFullyCorrect(puzzle, clue) && (
                  <span className="text-green-600">✓</span>
                )}
                <span className="text-xs text-gray-500">
                  ({clue.length} letters)
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
