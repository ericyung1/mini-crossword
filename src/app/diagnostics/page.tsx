'use client';

import { useState, useEffect } from 'react';
import { WordBankStats } from '@/types/wordbank';

interface DiagnosticResult {
  query: string;
  results: Array<{ word: string; frequency: number }>;
  duration: number;
  count: number;
}

export default function DiagnosticsPage() {
  const [stats, setStats] = useState<WordBankStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('a?e??');
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/wordbank/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const runQuery = async () => {
    if (!query.trim()) return;
    
    setSearching(true);
    const startTime = performance.now();
    
    try {
      const response = await fetch('/api/wordbank/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pattern: query.trim() }),
      });
      
      const data = await response.json();
      const duration = performance.now() - startTime;
      
      const result: DiagnosticResult = {
        query: query.trim(),
        results: data.words || [],
        duration: Math.round(duration * 100) / 100,
        count: data.words?.length || 0,
      };
      
      setResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const runBenchmark = async () => {
    const testQueries = [
      'a????', '?e???', '??t??', '???o?', '????s',
      'a?e??', 'c?t??', '?o?e?', 's???t', '??a?e'
    ];
    
    setResults([]);
    
    for (const testQuery of testQueries) {
      setQuery(testQuery);
      await new Promise(resolve => setTimeout(resolve, 100)); // Brief delay
      const startTime = performance.now();
      
      try {
        const response = await fetch('/api/wordbank/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pattern: testQuery }),
        });
        
        const data = await response.json();
        const duration = performance.now() - startTime;
        
        const result: DiagnosticResult = {
          query: testQuery,
          results: data.words?.slice(0, 5) || [], // Show top 5 only
          duration: Math.round(duration * 100) / 100,
          count: data.words?.length || 0,
        };
        
        setResults(prev => [result, ...prev]);
      } catch (error) {
        console.error(`Benchmark query ${testQuery} failed:`, error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Word Bank Diagnostics</h1>
          <div className="bg-white p-6 rounded-lg shadow">
            <p>Loading word bank...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Word Bank Diagnostics</h1>
        
        {/* Stats */}
        {stats && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-semibold mb-4">Word Bank Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalWords.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Words</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.wordsByLength[3].toLocaleString()}</div>
                <div className="text-sm text-gray-600">3-Letter</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.wordsByLength[4].toLocaleString()}</div>
                <div className="text-sm text-gray-600">4-Letter</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.wordsByLength[5].toLocaleString()}</div>
                <div className="text-sm text-gray-600">5-Letter</div>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">Average Frequency: {stats.averageFrequency}</div>
            </div>
            
            <div>
              <div className="text-sm font-semibold mb-2">Top Words by Frequency:</div>
              <div className="flex flex-wrap gap-2">
                {stats.topWords.map((word, i) => (
                  <span key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    {word.word} ({word.frequency})
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search Interface */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Pattern Search</h2>
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter pattern (e.g., a?e??, c?t??, ???o?)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && runQuery()}
            />
            <button
              onClick={runQuery}
              disabled={searching}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
            <button
              onClick={runBenchmark}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Benchmark
            </button>
          </div>
          
          <div className="text-sm text-gray-600">
            <p><strong>Pattern syntax:</strong> Use ? for any letter (e.g., a?e?? finds 5-letter words starting with 'a', 'e' in 3rd position)</p>
            <p><strong>Performance target:</strong> &lt;5ms per query</p>
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Search Results</h2>
            <div className="space-y-4">
              {results.map((result, i) => (
                <div key={i} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-mono text-lg font-semibold">{result.query}</div>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>{result.count} results</span>
                      <span className={result.duration < 5 ? 'text-green-600' : 'text-red-600'}>
                        {result.duration}ms
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.results.slice(0, 20).map((word, j) => (
                      <span key={j} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                        {word.word} ({word.frequency})
                      </span>
                    ))}
                    {result.results.length > 20 && (
                      <span className="text-gray-500 text-sm">
                        ... and {result.results.length - 20} more
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
