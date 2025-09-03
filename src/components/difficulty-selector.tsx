"use client";

import { useState } from "react";
import type { Difficulty } from "@/types/game";
import { getDifficultyInfo } from "@/lib/difficulty";
import { cn } from "@/lib/utils";

interface DifficultySelectorProps {
  selectedDifficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
  className?: string;
}

export function DifficultySelector({ 
  selectedDifficulty, 
  onDifficultyChange,
  className 
}: DifficultySelectorProps) {
  const difficulties: Difficulty[] = ["EASY", "MEDIUM", "HARD"];

  return (
    <div className={cn("flex gap-2", className)}>
      {difficulties.map((difficulty) => {
        const info = getDifficultyInfo(difficulty);
        const isSelected = selectedDifficulty === difficulty;
        
        return (
          <button
            key={difficulty}
            onClick={() => onDifficultyChange(difficulty)}
            className={cn(
              "px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200",
              "hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
              isSelected
                ? `${info.bgColor} ${info.borderColor} ${info.color} ring-2 ring-blue-300`
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            )}
            title={info.description}
          >
            <div className="text-center">
              <div className="font-semibold">{info.label}</div>
              <div className="text-xs opacity-75 mt-0.5">
                {difficulty === "EASY" && "3-5 letters"}
                {difficulty === "MEDIUM" && "2-5 letters"}
                {difficulty === "HARD" && "Complex"}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  size?: "sm" | "md" | "lg";
}

export function DifficultyBadge({ difficulty, size = "md" }: DifficultyBadgeProps) {
  const info = getDifficultyInfo(difficulty);
  
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm", 
    lg: "px-4 py-2 text-base"
  };
  
  return (
    <span className={cn(
      "inline-flex items-center rounded-full font-medium",
      info.bgColor,
      info.borderColor,
      info.color,
      sizeClasses[size]
    )}>
      {info.label}
    </span>
  );
}
