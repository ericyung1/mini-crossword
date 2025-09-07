# Mini Crossword

A NYT-Mini style 5×5 crossword web app that generates valid puzzles with AI-generated clues.

## Features

- 🧩 Generates valid 5×5 crossword puzzles
- 🤖 AI-powered clue generation using OpenAI
- ⌨️ Full keyboard navigation
- ⏱️ Built-in timer
- 🎨 Clean, responsive UI
- ✅ Auto-check functionality

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd mini-crossword
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your OpenAI API key:
```
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key
- `OPENAI_MODEL`: OpenAI model to use (default: gpt-4o-mini)

## Word Bank

The app uses `spreadthewordlist.txt` as the word bank. Only 3-5 letter words are used for puzzle generation.

## Development Phases

- ✅ **Phase 0**: Project setup and deployment
- ✅ **Phase 1**: Advanced crossword generation algorithm with AI clues
  - Backtracking with Constraint Satisfaction algorithm
  - Slot detection using flood-fill
  - Most Constrained Variable heuristic
  - OpenAI integration for NYT-style clues
  - 15 crossword templates ready
  - 34K+ word bank with frequency optimization
- ⏳ **Phase 2**: Interactive crossword UI
- ⏳ **Phase 3**: Game features (timer, auto-check, reveal)
- ⏳ **Phase 4**: Keyboard navigation and polish

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: OpenAI GPT-4o-mini
- **Deployment**: Vercel

## License

MIT
