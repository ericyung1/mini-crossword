'use client';

import { useState } from 'react';

export default function Home() {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const testAlgorithm = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generateClues: false }) // Test without clues first
      });
      
      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      setTestResult({ error: 'Failed to test algorithm', details: error });
    } finally {
      setTesting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Mini Crossword
        </h1>
        <p className="text-xl text-center text-gray-600 dark:text-gray-400">
          NYT-style 5×5 crossword puzzle generator
        </p>
        <div className="mt-8 text-center">
          <p className="text-lg">🎯 Phase 1: Algorithm Complete!</p>
          <p className="text-sm mt-2 text-gray-500">
            Backtracking with Constraint Satisfaction + OpenAI clues
          </p>
          <div className="mt-6 flex gap-4 justify-center">
            <a 
              href="/diagnostics" 
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔍 Word Bank Diagnostics
            </a>
            <button
              onClick={testAlgorithm}
              disabled={testing}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {testing ? '⏳ Testing...' : '🧩 Test Algorithm'}
            </button>
          </div>
        </div>
        
        {/* Test Results */}
        {testResult && (
          <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Algorithm Test Result</h2>
            {testResult.error ? (
              <div className="text-red-600">
                <p className="font-semibold">Error: {testResult.error}</p>
                {testResult.details && (
                  <p className="text-sm mt-2">{testResult.details}</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-green-600 font-semibold">
                  ✅ {testResult.message}
                </div>
                
                {testResult.stats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {testResult.stats.generationTime}ms
                      </div>
                      <div className="text-sm text-gray-600">Generation Time</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {testResult.stats.totalWords}
                      </div>
                      <div className="text-sm text-gray-600">Total Words</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {testResult.stats.acrossWords}
                      </div>
                      <div className="text-sm text-gray-600">Across</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {testResult.stats.downWords}
                      </div>
                      <div className="text-sm text-gray-600">Down</div>
                    </div>
                  </div>
                )}
                
                {testResult.puzzle && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-2">Generated Grid:</h3>
                    <div className="grid grid-cols-5 gap-1 w-fit mx-auto">
                      {testResult.puzzle.grid.map((row: any[], i: number) =>
                        row.map((cell: any, j: number) => (
                          <div
                            key={`${i}-${j}`}
                            className={`w-8 h-8 border text-center text-sm font-bold flex items-center justify-center ${
                              cell.type === '#' 
                                ? 'bg-black' 
                                : 'bg-white border-gray-400'
                            }`}
                          >
                            {cell.type === '.' && cell.letter ? cell.letter.toUpperCase() : ''}
                          </div>
                        ))
                      )}
                    </div>
                    
                    <div className="mt-4 text-sm">
                      <p><strong>Words placed:</strong></p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {testResult.puzzle.words.map((wordData: any, i: number) => (
                          <span key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {wordData.slot.number}{wordData.slot.direction === 'across' ? 'A' : 'D'}: {wordData.word.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
