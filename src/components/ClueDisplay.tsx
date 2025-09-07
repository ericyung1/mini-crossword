'use client';

import { CrosswordSlot } from '@/types/crossword';

interface ClueDisplayProps {
  acrossSlots: CrosswordSlot[];
  downSlots: CrosswordSlot[];
  words: Array<{
    slot: CrosswordSlot;
    word: string;
    clue?: string;
  }>;
  selectedCell: { row: number; col: number } | null;
  selectedDirection: 'across' | 'down';
  onClueClick: (slot: CrosswordSlot) => void;
  completedWords: Set<string>; // slot IDs of completed words
}

interface ClueItemProps {
  slot: CrosswordSlot;
  clue: string;
  isSelected: boolean;
  isCompleted: boolean;
  onClick: () => void;
}

function ClueItem({ slot, clue, isSelected, isCompleted, onClick }: ClueItemProps) {
  return (
    <div
      className={`
        p-2 rounded cursor-pointer transition-colors
        ${isSelected 
          ? 'bg-yellow-200 border-yellow-400 border-2' 
          : 'hover:bg-gray-100'
        }
        ${isCompleted ? 'text-green-600 font-medium' : 'text-gray-800'}
      `}
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <span className="font-bold text-sm min-w-[1.5rem]">
          {slot.number}
        </span>
        <span className={`text-sm leading-relaxed ${isCompleted ? 'line-through' : ''}`}>
          {clue || `${slot.length}-letter word`}
        </span>
      </div>
    </div>
  );
}

export default function ClueDisplay({
  acrossSlots,
  downSlots,
  words,
  selectedCell,
  selectedDirection,
  onClueClick,
  completedWords
}: ClueDisplayProps) {
  // Create a map of slot ID to clue
  const clueMap = new Map<string, string>();
  words.forEach(wordData => {
    if (wordData.clue) {
      clueMap.set(wordData.slot.id, wordData.clue);
    }
  });

  // Get the currently selected word slot
  const getSelectedWordSlot = (): CrosswordSlot | null => {
    if (!selectedCell) return null;
    
    const slotsToCheck = selectedDirection === 'across' ? acrossSlots : downSlots;
    return slotsToCheck.find(slot => 
      slot.cells.some(cell => cell.row === selectedCell.row && cell.col === selectedCell.col)
    ) || null;
  };

  const selectedWordSlot = getSelectedWordSlot();

  return (
    <div className="w-full max-w-md">
      {/* Across Clues */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-3 text-gray-800 border-b-2 border-gray-300 pb-1">
          ACROSS
        </h3>
        <div className="space-y-1">
          {acrossSlots
            .sort((a, b) => a.number - b.number)
            .map(slot => (
              <ClueItem
                key={slot.id}
                slot={slot}
                clue={clueMap.get(slot.id) || `${slot.length}-letter word`}
                isSelected={
                  selectedDirection === 'across' && 
                  selectedWordSlot?.id === slot.id
                }
                isCompleted={completedWords.has(slot.id)}
                onClick={() => onClueClick(slot)}
              />
            ))}
        </div>
      </div>

      {/* Down Clues */}
      <div>
        <h3 className="text-lg font-bold mb-3 text-gray-800 border-b-2 border-gray-300 pb-1">
          DOWN
        </h3>
        <div className="space-y-1">
          {downSlots
            .sort((a, b) => a.number - b.number)
            .map(slot => (
              <ClueItem
                key={slot.id}
                slot={slot}
                clue={clueMap.get(slot.id) || `${slot.length}-letter word`}
                isSelected={
                  selectedDirection === 'down' && 
                  selectedWordSlot?.id === slot.id
                }
                isCompleted={completedWords.has(slot.id)}
                onClick={() => onClueClick(slot)}
              />
            ))}
        </div>
      </div>

      {/* Selected Clue Highlight */}
      {selectedWordSlot && (
        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-600 font-medium mb-1">
            {selectedWordSlot.number} {selectedDirection.toUpperCase()}
          </div>
          <div className="text-gray-800">
            {clueMap.get(selectedWordSlot.id) || `${selectedWordSlot.length}-letter word`}
          </div>
        </div>
      )}
    </div>
  );
}
