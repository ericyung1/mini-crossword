"use client";

import type { Clue, Puzzle } from "@/types/crossword";
import { cn } from "@/lib/utils";
import { isClueFullyCorrect } from "@/lib/validation";

interface BasicClueListProps {
  clues: Clue[];
  title: string;
  puzzle: Puzzle;
}

export function BasicClueList({ clues, title, puzzle }: BasicClueListProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <div className="space-y-1">
        {clues.map((clue) => (
          <div
            key={clue.id}
            className={cn(
              "p-2 rounded text-sm border",
              isClueFullyCorrect(puzzle, clue)
                ? "bg-green-100 border-green-300 text-green-800"
                : "bg-gray-50 border-gray-200"
            )}
          >
            <span className="font-semibold">{clue.number}.</span>{" "}
            <span>{clue.text}</span>
            {isClueFullyCorrect(puzzle, clue) && (
              <span className="ml-2 text-green-600">✓</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
