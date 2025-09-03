import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Puzzle } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="container mx-auto max-w-4xl">
        <header className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <Puzzle className="h-8 w-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900">Mini Crossword</h1>
          </div>
          <p className="text-lg text-gray-600">
            Challenge yourself with daily crossword puzzles
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s Puzzle</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-gray-600">
                Start your daily crossword challenge
              </p>
              <Button className="w-full">Play Now</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Dark Mode</span>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sound Effects</span>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Puzzles Solved</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Current Streak</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Best Time</span>
                  <span className="font-medium">--:--</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
