"use client";

import { useState } from "react";
import { Lightbulb, Eye, CheckCircle, AlertCircle } from "lucide-react";
import type { Puzzle, Clue } from "@/types/crossword";
import type { HintType } from "@/types/game";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
  applyHint, 
  getAvailableHints, 
  calculateHintCost,
  getHintDescription 
} from "@/lib/hints";

interface HintsPanelProps {
  puzzle: Puzzle;
  selectedClue?: Clue;
  hintsUsed: number;
  onPuzzleChange: (puzzle: Puzzle) => void;
  onHintUsed: () => void;
  disabled?: boolean;
}

export function HintsPanel({
  puzzle,
  selectedClue,
  hintsUsed,
  onPuzzleChange,
  onHintUsed,
  disabled = false
}: HintsPanelProps) {
  const [lastHintMessage, setLastHintMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  
  const availableHints = getAvailableHints(puzzle, selectedClue);
  
  const handleHint = (hintType: HintType["type"]) => {
    if (disabled) return;
    
    const result = applyHint(puzzle, hintType, selectedClue);
    
    if (result.success) {
      onPuzzleChange(result.puzzle);
      if (hintType !== "CHECK") {
        onHintUsed();
      }
      setMessageType("success");
    } else {
      setMessageType("error");
    }
    
    setLastHintMessage(result.message);
    
    // Clear message after 3 seconds
    setTimeout(() => setLastHintMessage(""), 3000);
  };
  
  const getHintIcon = (type: HintType["type"]) => {
    switch (type) {
      case "LETTER":
        return <Lightbulb className="h-4 w-4" />;
      case "WORD":
        return <Eye className="h-4 w-4" />;
      case "CHECK":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };
  
  const getHintButtonClass = (type: HintType["type"]) => {
    const cost = calculateHintCost(type);
    
    if (cost === 0) return ""; // Free hint
    if (cost === 1) return "border-yellow-300 hover:bg-yellow-50";
    if (cost >= 3) return "border-red-300 hover:bg-red-50";
    return "";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Hints
          {hintsUsed > 0 && (
            <span className="ml-auto text-sm text-gray-500">
              Used: {hintsUsed}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current selection info */}
        {selectedClue ? (
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="font-medium text-blue-800">
              {selectedClue.number} {selectedClue.direction}: {selectedClue.text}
            </div>
            <div className="text-blue-600 mt-1">
              {selectedClue.length} letters
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
            Click a cell or clue to select it for hints
          </div>
        )}
        
        {/* Hint buttons */}
        <div className="space-y-2">
          {availableHints.map((hint) => {
            const cost = calculateHintCost(hint.type);
            const isFree = cost === 0;
            
            return (
              <Button
                key={hint.type}
                variant="outline"
                onClick={() => handleHint(hint.type)}
                disabled={disabled || (!selectedClue && hint.type !== "CHECK")}
                className={cn(
                  "w-full justify-start text-left h-auto p-3",
                  getHintButtonClass(hint.type)
                )}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="flex-shrink-0 mt-0.5">
                    {getHintIcon(hint.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {hint.type === "LETTER" && "Reveal Letter"}
                        {hint.type === "WORD" && "Reveal Word"} 
                        {hint.type === "CHECK" && "Check Answers"}
                      </span>
                      <span className={cn(
                        "text-xs px-2 py-1 rounded",
                        isFree 
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      )}>
                        {isFree ? "Free" : `${cost} hint${cost > 1 ? "s" : ""}`}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {getHintDescription(hint.type)}
                    </div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
        
        {/* Hint message */}
        {lastHintMessage && (
          <div className={cn(
            "flex items-center gap-2 p-3 rounded-lg text-sm",
            messageType === "success" 
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          )}>
            {messageType === "success" ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            {lastHintMessage}
          </div>
        )}
        
        {/* Hint strategy tip */}
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border-l-4 border-blue-300">
          <div className="font-medium text-gray-700 mb-1">💡 Strategy Tip:</div>
          Try to solve as much as possible before using hints. 
          Letter hints are cheaper than word reveals!
        </div>
      </CardContent>
    </Card>
  );
}
