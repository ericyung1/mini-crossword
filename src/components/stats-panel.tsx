"use client";

import { useState, useEffect } from "react";
import { BarChart3, Trophy, Clock, Flame, Target } from "lucide-react";
import type { PuzzleStats, Difficulty } from "@/types/game";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DifficultyBadge } from "@/components/difficulty-selector";
import { 
  loadStats, 
  getRecentPerformance, 
  formatTime, 
  getDifficultyStats 
} from "@/lib/stats";

interface StatsPanelProps {
  currentDifficulty?: Difficulty;
}

export function StatsPanel({ currentDifficulty }: StatsPanelProps) {
  const [stats, setStats] = useState<PuzzleStats | null>(null);
  
  useEffect(() => {
    setStats(loadStats());
  }, []);
  
  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-500">Loading statistics...</div>
        </CardContent>
      </Card>
    );
  }
  
  const recentSessions = getRecentPerformance(5);
  const currentDiffStats = currentDifficulty ? getDifficultyStats(currentDifficulty) : null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Stats */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Overall Performance</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Trophy className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-700 font-medium">Solved</span>
              </div>
              <div className="text-2xl font-bold text-blue-800">
                {stats.totalSolved}
              </div>
            </div>
            
            <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Flame className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-orange-700 font-medium">Streak</span>
              </div>
              <div className="text-2xl font-bold text-orange-800">
                {stats.currentStreak}
              </div>
            </div>
            
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700 font-medium">Best Time</span>
              </div>
              <div className="text-lg font-bold text-green-800">
                {formatTime(stats.bestTime)}
              </div>
            </div>
            
            <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-purple-700 font-medium">Avg Time</span>
              </div>
              <div className="text-lg font-bold text-purple-800">
                {formatTime(stats.averageTime)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Difficulty Breakdown */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">By Difficulty</h4>
          <div className="space-y-3">
            {(["EASY", "MEDIUM", "HARD"] as Difficulty[]).map((difficulty) => {
              const diffStats = stats.difficultyStats[difficulty];
              const isCurrent = currentDifficulty === difficulty;
              
              return (
                <div 
                  key={difficulty}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-all",
                    isCurrent 
                      ? "bg-blue-50 border-blue-200 ring-1 ring-blue-300"
                      : "bg-gray-50 border-gray-200"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <DifficultyBadge difficulty={difficulty} size="sm" />
                    <div className="text-sm">
                      <div className="font-medium">
                        {diffStats.solved} solved
                      </div>
                      {diffStats.solved > 0 && (
                        <div className="text-gray-600">
                          Best: {formatTime(diffStats.bestTime)} • 
                          Avg: {formatTime(diffStats.averageTime)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Recent Performance */}
        {recentSessions.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Recent Sessions</h4>
            <div className="space-y-2">
              {recentSessions.map((session, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-2 text-sm bg-gray-50 rounded border border-gray-200"
                >
                  <div className="flex items-center gap-2">
                    <DifficultyBadge difficulty={session.difficulty} size="sm" />
                    {session.hintsUsed > 0 && (
                      <span className="text-xs text-gray-500">
                        {session.hintsUsed} hints
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-gray-700">
                    {formatTime((session.endTime! - session.startTime) / 1000)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Achievements */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Achievements</h4>
          <div className="grid grid-cols-1 gap-2 text-sm">
            {stats.totalSolved >= 1 && (
              <div className="flex items-center gap-2 text-green-700">
                <Trophy className="h-4 w-4" />
                First puzzle solved!
              </div>
            )}
            {stats.totalSolved >= 10 && (
              <div className="flex items-center gap-2 text-blue-700">
                <Trophy className="h-4 w-4" />
                Solved 10+ puzzles
              </div>
            )}
            {stats.currentStreak >= 3 && (
              <div className="flex items-center gap-2 text-orange-700">
                <Flame className="h-4 w-4" />
                3+ day streak
              </div>
            )}
            {stats.bestTime > 0 && stats.bestTime <= 60 && (
              <div className="flex items-center gap-2 text-purple-700">
                <Clock className="h-4 w-4" />
                Under 1 minute!
              </div>
            )}
            {stats.totalSolved === 0 && (
              <div className="text-gray-500 italic">
                Complete your first puzzle to earn achievements!
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
