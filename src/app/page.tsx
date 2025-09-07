export default function Home() {
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
          <p className="text-lg">🧩 Phase 0 Complete!</p>
          <p className="text-sm mt-2 text-gray-500">
            Ready for puzzle generation and clue creation
          </p>
        </div>
      </div>
    </main>
  )
}
