# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Next.js 16 app using the App Router, React 19, TypeScript, and Tailwind CSS v4. The actual app code lives in `teste_claudecode/`.

## Commands

Run all commands from `teste_claudecode/`:

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm start        # Start production server
npm run lint     # Run ESLint
```

## Architecture

Uses the **Next.js App Router** (`app/` directory):

- `app/layout.tsx` — Root layout with Geist font and metadata
- `app/page.tsx` — Home page
- `app/globals.css` — Global styles (Tailwind CSS)
- `public/` — Static assets (SVGs)

TypeScript is strictly configured via `tsconfig.json`. ESLint uses Next.js core web vitals preset (`eslint.config.mjs`). Tailwind CSS v4 is configured through PostCSS (`postcss.config.mjs`).
