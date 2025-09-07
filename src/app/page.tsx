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
          <p className="text-lg">🧩 Phase 1 Complete!</p>
          <p className="text-sm mt-2 text-gray-500">
            Word bank parsing and indexing system ready
          </p>
          <div className="mt-6">
            <a 
              href="/diagnostics" 
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔍 Test Word Bank Diagnostics
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
