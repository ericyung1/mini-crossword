'use client';

import { useState } from 'react';

interface GeneratedPuzzle {
  grid: string[][];
  across: Array<{
    num: number;
    answer: string;
    row: number;
    col: number;
    length: number;
  }>;
  down: Array<{
    num: number;
    answer: string;
    row: number;
    col: number;
    length: number;
  }>;
  meta: {
    templateId: string;
    generationTime: number;
    attempts: number;
  };
}

export default function TestGeneratorPage() {
  const [puzzle, setPuzzle] = useState<GeneratedPuzzle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    successes: number;
    failures: number;
    averageTime: number;
    averageAttempts: number;
  }>({ successes: 0, failures: 0, averageTime: 0, averageAttempts: 0 });

  const generatePuzzle = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setPuzzle(data);
        setStats(prev => ({
          successes: prev.successes + 1,
          failures: prev.failures,
          averageTime: (prev.averageTime * prev.successes + data.meta.generationTime) / (prev.successes + 1),
          averageAttempts: (prev.averageAttempts * prev.successes + (data.meta.attempts || 1)) / (prev.successes + 1)
        }));
      } else {
        setError(data.error || 'Generation failed');
        setStats(prev => ({
          ...prev,
          failures: prev.failures + 1
        }));
      }
    } catch (err) {
      setError('Network error');
      setStats(prev => ({
        ...prev,
        failures: prev.failures + 1
      }));
    } finally {
      setLoading(false);
    }
  };

  const generateSimplePuzzle = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/generate-simple');
      const data = await response.json();
      
      if (response.ok) {
        setPuzzle(data);
        setStats(prev => ({
          successes: prev.successes + 1,
          failures: prev.failures,
          averageTime: (prev.averageTime * prev.successes + data.meta.generationTime) / (prev.successes + 1),
          averageAttempts: (prev.averageAttempts * prev.successes + 1) / (prev.successes + 1)
        }));
      } else {
        setError(data.error || 'Simple generation failed');
        setStats(prev => ({
          ...prev,
          failures: prev.failures + 1
        }));
      }
    } catch (err) {
      setError('Network error');
      setStats(prev => ({
        ...prev,
        failures: prev.failures + 1
      }));
    } finally {
      setLoading(false);
    }
  };

  const generateUnlimitedPuzzle = async () => {
    setLoading(true);
    setError(null);
    
    console.log('🚀 Starting unlimited test - check browser console for detailed logs!');
    
    try {
      const response = await fetch('/api/generate-unlimited');
      const data = await response.json();
      
      if (response.ok) {
        setPuzzle(data);
        setStats(prev => ({
          successes: prev.successes + 1,
          failures: prev.failures,
          averageTime: (prev.averageTime * prev.successes + (data.meta.duration || 0)) / (prev.successes + 1),
          averageAttempts: (prev.averageAttempts * prev.successes + (data.meta.attempts || 1)) / (prev.successes + 1)
        }));
        console.log('✅ Unlimited test succeeded!');
      } else {
        setError(data.error || 'Unlimited generation failed');
        setStats(prev => ({
          ...prev,
          failures: prev.failures + 1
        }));
        console.log('❌ Unlimited test failed:', data.error);
      }
    } catch (err) {
      setError('Network error');
      setStats(prev => ({
        ...prev,
        failures: prev.failures + 1
      }));
      console.log('💥 Unlimited test network error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateDiagnosticPuzzle = async () => {
    setLoading(true);
    setError(null);
    
    console.log('🔬 Starting diagnostic test with simple template - check browser console!');
    
    try {
      const response = await fetch('/api/generate-diagnostic');
      const data = await response.json();
      
      if (response.ok) {
        setPuzzle(data);
        setStats(prev => ({
          successes: prev.successes + 1,
          failures: prev.failures,
          averageTime: (prev.averageTime * prev.successes + (data.meta.duration || 0)) / (prev.successes + 1),
          averageAttempts: (prev.averageAttempts * prev.successes + (data.meta.attempts || 1)) / (prev.successes + 1)
        }));
        console.log('✅ Diagnostic test succeeded!');
      } else {
        setError(data.error || 'Diagnostic generation failed');
        setStats(prev => ({
          ...prev,
          failures: prev.failures + 1
        }));
        console.log('❌ Diagnostic test failed:', data.error);
      }
    } catch (err) {
      setError('Network error');
      setStats(prev => ({
        ...prev,
        failures: prev.failures + 1
      }));
      console.log('💥 Diagnostic test network error:', err);
    } finally {
      setLoading(false);
    }
  };

  const runMinimalTest = async () => {
    setLoading(true);
    setError(null);
    
    console.log('🧪 Starting minimal test - testing word bank only - check browser console!');
    
    try {
      const response = await fetch('/api/test-minimal');
      const data = await response.json();
      
      if (response.ok && data.success) {
        setError(null);
        console.log('✅ Minimal test succeeded!', data.details);
        alert(`Minimal Test Passed!\n\nWord Bank Stats:\n- 3-letter words: ${data.details?.totalWords3 || 'N/A'}\n- Pattern matches: ${data.details?.patternMatches || 'N/A'}\n- Sample words: ${data.details?.sampleWords?.join(', ') || 'N/A'}`);
      } else {
        setError(data.error || 'Minimal test failed');
        console.log('❌ Minimal test failed:', data.error);
      }
    } catch (err) {
      setError('Network error');
      console.log('💥 Minimal test network error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateFixedDiagnosticPuzzle = async () => {
    setLoading(true);
    setError(null);
    
    console.log('🔬 Starting FIXED diagnostic test with 2 slots only - check browser console!');
    
    try {
      const response = await fetch('/api/generate-diagnostic-fixed');
      const data = await response.json();
      
      if (response.ok) {
        setPuzzle(data);
        setStats(prev => ({
          successes: prev.successes + 1,
          failures: prev.failures,
          averageTime: (prev.averageTime * prev.successes + (data.meta.duration || 0)) / (prev.successes + 1),
          averageAttempts: (prev.averageAttempts * prev.successes + (data.meta.attempts || 1)) / (prev.successes + 1)
        }));
        console.log('✅ Fixed diagnostic test succeeded!');
      } else {
        setError(data.error || 'Fixed diagnostic generation failed');
        setStats(prev => ({
          ...prev,
          failures: prev.failures + 1
        }));
        console.log('❌ Fixed diagnostic test failed:', data.error);
      }
    } catch (err) {
      setError('Network error');
      setStats(prev => ({
        ...prev,
        failures: prev.failures + 1
      }));
      console.log('💥 Fixed diagnostic test network error:', err);
    } finally {
      setLoading(false);
    }
  };

  const runBenchmark = async () => {
    setLoading(true);
    setError(null);
    
    const results: number[] = [];
    const attempts: number[] = [];
    let successes = 0;
    let failures = 0;
    
    for (let i = 0; i < 10; i++) {
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        
        const data = await response.json();
        
        if (response.ok) {
          results.push(data.meta.generationTime);
          attempts.push(data.meta.attempts);
          successes++;
          if (i === 9) setPuzzle(data); // Show last successful puzzle
        } else {
          failures++;
        }
      } catch (err) {
        failures++;
      }
      
      // Brief delay between generations
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (results.length > 0) {
      const avgTime = results.reduce((a, b) => a + b, 0) / results.length;
      const avgAttempts = attempts.reduce((a, b) => a + b, 0) / attempts.length;
      
      setStats({
        successes,
        failures,
        averageTime: avgTime,
        averageAttempts: avgAttempts
      });
    }
    
    setLoading(false);
  };

  const renderGrid = (grid: string[][]) => {
    return (
      <div className="inline-block border-2 border-gray-800">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
            {row.map((cell, colIndex) => (
              <div
                key={colIndex}
                className={`w-8 h-8 border border-gray-400 flex items-center justify-center text-xs font-bold ${
                  cell === '#' ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                {cell !== '#' ? cell : ''}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Crossword Generator Test</h1>
        
        {/* Controls */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={generatePuzzle}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              {loading ? 'Generating...' : 'Generate Puzzle (Complex)'}
            </button>
            <button
              onClick={() => generateSimplePuzzle()}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 text-sm"
            >
              {loading ? 'Generating...' : 'Generate Simple'}
            </button>
            <button
              onClick={() => generateUnlimitedPuzzle()}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm"
            >
              {loading ? 'Testing...' : 'Test Unlimited (No Timeout)'}
            </button>
            <button
              onClick={() => generateDiagnosticPuzzle()}
              disabled={loading}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 text-sm"
            >
              {loading ? 'Testing...' : 'Diagnostic (Simple Template)'}
            </button>
            <button
              onClick={() => runMinimalTest()}
              disabled={loading}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 text-sm"
            >
              {loading ? 'Testing...' : 'Minimal Test (Word Bank Only)'}
            </button>
            <button
              onClick={() => generateFixedDiagnosticPuzzle()}
              disabled={loading}
              className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:opacity-50 text-sm"
            >
              {loading ? 'Testing...' : 'Fixed Diagnostic (2 Slots Only)'}
            </button>
            <button
              onClick={runBenchmark}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
            >
              Run Benchmark (10x)
            </button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.successes}</div>
              <div className="text-sm text-gray-600">Successes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.failures}</div>
              <div className="text-sm text-gray-600">Failures</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.averageTime.toFixed(1)}ms
              </div>
              <div className="text-sm text-gray-600">Avg Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.averageAttempts.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Avg Attempts</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
            Error: {error}
          </div>
        )}

        {puzzle && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Grid */}
              <div className="flex-shrink-0">
                <h2 className="text-xl font-semibold mb-4">Generated Puzzle</h2>
                {renderGrid(puzzle.grid)}
                <div className="mt-4 text-sm text-gray-600">
                  <p>Template: {puzzle.meta.templateId}</p>
                  <p>Generation Time: {puzzle.meta.generationTime}ms</p>
                  <p>Attempts: {puzzle.meta.attempts}</p>
                </div>
              </div>
              
              {/* Clues */}
              <div className="flex-1">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Across */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Across</h3>
                    <div className="space-y-2">
                      {puzzle.across.map((clue) => (
                        <div key={`across-${clue.num}`} className="text-sm">
                          <span className="font-semibold">{clue.num}.</span>{' '}
                          <span className="font-mono bg-gray-100 px-1 rounded">
                            {clue.answer}
                          </span>{' '}
                          <span className="text-gray-500">
                            ({clue.length} letters)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Down */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Down</h3>
                    <div className="space-y-2">
                      {puzzle.down.map((clue) => (
                        <div key={`down-${clue.num}`} className="text-sm">
                          <span className="font-semibold">{clue.num}.</span>{' '}
                          <span className="font-mono bg-gray-100 px-1 rounded">
                            {clue.answer}
                          </span>{' '}
                          <span className="text-gray-500">
                            ({clue.length} letters)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
