# Mini Crossword

A modern, responsive mini crossword puzzle web application built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Modern Tech Stack**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Component Library**: shadcn/ui components with Radix UI primitives
- **Responsive Design**: Beautiful UI that works on all devices
- **Type Safety**: Full TypeScript support with strict type checking
- **Testing**: Comprehensive testing setup with Vitest and React Testing Library
- **Code Quality**: ESLint, Prettier, and automated CI/CD pipeline
- **Environment Management**: Zod-based environment variable validation

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18.x or 20.x)
- **npm** (comes with Node.js)
- **Git**

## 🛠️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd mini-crossword
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment setup**:
   ```bash
   # Copy the example environment file
   cp .env.example .env.local
   
   # Edit .env.local with your actual values
   # IMPORTANT: Never use NEXT_PUBLIC_* for secrets!
   ```

## 🔐 Environment Variables

This project uses server-side environment validation with Zod for type safety and fail-fast error handling.

### **Local Development Setup**

1. **Copy the environment template**:
   ```bash
   cp .env.example .env.local
   ```

2. **Edit `.env.local`** with your actual values:
   ```bash
   # Required for production (optional for development)
   NODE_ENV=development
   
   # Optional API keys
   OPENAI_API_KEY=your_actual_openai_key_here
   DATABASE_URL=your_database_connection_string
   NEXTAUTH_SECRET=your_nextauth_secret_for_production
   ```

3. **Security Rules**:
   - ✅ **DO**: Use server-side environment variables (no `NEXT_PUBLIC_` prefix)
   - ❌ **DON'T**: Expose secrets with `NEXT_PUBLIC_*` variables
   - ✅ **DO**: Keep secrets in `.env.local` (ignored by Git)
   - ❌ **DON'T**: Commit real secrets to version control

### **Vercel Deployment Setup**

1. **In your Vercel Project Dashboard**:
   - Go to **Settings** → **Environment Variables**
   - Add each variable individually:

2. **Production Environment Variables**:
   ```bash
   NODE_ENV=production
   OPENAI_API_KEY=your_production_openai_key
   DATABASE_URL=your_production_database_url
   NEXTAUTH_SECRET=your_production_nextauth_secret
   ```

3. **Environment-Specific Variables**:
   - **Production**: Set all required variables
   - **Preview**: Can use same as production or separate staging values
   - **Development**: Uses your local `.env.local` file

### **Environment Validation**

The app uses `src/env.ts` to validate environment variables at startup:
- ✅ **Type-safe**: Full TypeScript support
- ✅ **Fail-fast**: App won't start with invalid/missing required vars
- ✅ **Server-only**: Never exposes secrets to the client
- ✅ **Optional keys**: OPENAI_API_KEY and others are optional for development

## 📜 Available Scripts

- **`npm run dev`** - Start the development server
- **`npm run build`** - Build the application for production
- **`npm run start`** - Start the production server
- **`npm run lint`** - Run ESLint to check for code issues
- **`npm run lint:fix`** - Run ESLint and automatically fix issues
- **`npm run format`** - Format code with Prettier
- **`npm run format:check`** - Check if code is properly formatted
- **`npm run test`** - Run tests once
- **`npm run test:watch`** - Run tests in watch mode
- **`npm run test:ui`** - Run tests with Vitest UI
- **`npm run typecheck`** - Run TypeScript type checking

## 🧪 Testing

This project uses **Vitest** with **React Testing Library** for testing:

```bash
# Run all tests
npm run test

# Run tests in watch mode during development
npm run test:watch

# Run tests with UI interface
npm run test:ui
```

Test files should be placed in the `tests/` directory or co-located with components using the `.test.ts` or `.spec.ts` extension.

## 🔍 Linting & Formatting

The project uses ESLint and Prettier for code quality:

```bash
# Check for linting issues
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format code with Prettier
npm run format

# Check if code is properly formatted
npm run format:check
```

## 🏗️ Building for Production

```bash
# Build the application
npm run build

# Start the production server
npm run start
```

The build artifacts will be stored in the `.next/` directory.

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Deploy automatically on every push to main branch

### Other Platforms

The application can be deployed to any platform that supports Node.js:

- **Netlify**: Use the `npm run build` command
- **Railway**: Connect your GitHub repository
- **Docker**: Create a Dockerfile for containerized deployment

### Environment Variables for Production

Make sure to set the following environment variables in your production environment:

```bash
NODE_ENV=production
# Add other environment variables as needed
```

## 📁 Project Structure

```
mini-crossword/
├── app/                    # Next.js App Router pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Home page
│   └── health/           # Health check endpoint
├── src/
│   ├── components/       # React components
│   │   └── ui/          # shadcn/ui components
│   ├── lib/             # Utility functions
│   ├── types/           # TypeScript type definitions
│   └── env.ts           # Environment variable validation
├── tests/               # Test files
├── public/              # Static assets
├── .github/
│   └── workflows/       # GitHub Actions CI/CD
└── ...config files
```

## 🔧 Configuration Files

- **`tsconfig.json`** - TypeScript configuration
- **`tailwind.config.ts`** - Tailwind CSS configuration
- **`next.config.mjs`** - Next.js configuration
- **`.eslintrc.json`** - ESLint configuration
- **`.prettierrc`** - Prettier configuration
- **`vitest.config.ts`** - Vitest testing configuration
- **`components.json`** - shadcn/ui configuration

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Build fails with TypeScript errors**:
   ```bash
   npm run typecheck
   ```

2. **Linting errors**:
   ```bash
   npm run lint:fix
   ```

3. **Tests failing**:
   ```bash
   npm run test -- --reporter=verbose
   ```

### Getting Help

- Check the [Next.js documentation](https://nextjs.org/docs)
- Review [Tailwind CSS docs](https://tailwindcss.com/docs)
- Browse [shadcn/ui components](https://ui.shadcn.com/)

## 🔗 Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
