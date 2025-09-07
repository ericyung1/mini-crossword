'use client';

interface GameControlsProps {
  autoCheck: boolean;
  onAutoCheckToggle: () => void;
  onRevealSolution: () => void;
  onNewPuzzle: () => void;
  isRevealed: boolean;
  isCompleted: boolean;
  isLoading?: boolean;
}

export default function GameControls({
  autoCheck,
  onAutoCheckToggle,
  onRevealSolution,
  onNewPuzzle,
  isRevealed,
  isCompleted,
  isLoading = false
}: GameControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-lg shadow-lg">
      {/* Auto-check Toggle */}
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <div className="relative">
            <input
              type="checkbox"
              checked={autoCheck}
              onChange={onAutoCheckToggle}
              className="sr-only"
            />
            <div className={`
              w-11 h-6 rounded-full transition-colors duration-200
              ${autoCheck ? 'bg-blue-600' : 'bg-gray-300'}
            `}>
              <div className={`
                w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200
                absolute top-0.5 ${autoCheck ? 'translate-x-5' : 'translate-x-0.5'}
              `}></div>
            </div>
          </div>
          <span className="text-sm font-medium text-gray-700">
            Auto-check
          </span>
        </label>
        {autoCheck && (
          <div className="text-xs text-gray-500">
            ✓ Correct • ✗ Incorrect
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-300"></div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Reveal Solution Button */}
        <button
          onClick={onRevealSolution}
          disabled={isRevealed || isLoading}
          className={`
            px-4 py-2 rounded-lg font-medium text-sm transition-colors
            ${isRevealed 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-yellow-500 text-white hover:bg-yellow-600 active:bg-yellow-700'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {isRevealed ? '✓ Revealed' : '💡 Reveal'}
        </button>

        {/* New Puzzle Button */}
        <button
          onClick={onNewPuzzle}
          disabled={isLoading}
          className={`
            px-4 py-2 rounded-lg font-medium text-sm transition-colors
            ${isLoading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Loading...
            </div>
          ) : (
            '🔄 New Puzzle'
          )}
        </button>
      </div>

      {/* Completion Status */}
      {isCompleted && !isRevealed && (
        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-1 text-green-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-bold">Completed!</span>
          </div>
        </div>
      )}

      {/* Revealed Status */}
      {isRevealed && (
        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-1 text-yellow-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            <span className="font-bold">Solution Revealed</span>
          </div>
        </div>
      )}
    </div>
  );
}
