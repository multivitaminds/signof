# SignOf

A modern digital signature platform built with Next.js, React, and TypeScript.

## Overview

SignOf is a web application designed to streamline the digital signature process, providing a seamless experience for document signing and management.

## Tech Stack

- **Framework**: Next.js 16.1.6
- **UI Library**: React 19.2.3
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Linting**: ESLint 9 with Next.js config

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone https://github.com/multivitaminds/signof.git
cd signof
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Available Scripts

- `npm run dev` - Starts the development server
- `npm run build` - Creates an optimized production build
- `npm start` - Runs the production server
- `npm run lint` - Runs ESLint for code quality checks

## Project Structure

```
signof/
├── src/
│   └── app/
│       ├── layout.tsx    # Root layout component
│       ├── page.tsx      # Home page
│       ├── globals.css   # Global styles
│       └── favicon.ico   # App icon
├── public/               # Static assets
├── design-references/    # Design files (not tracked in git)
└── package.json          # Dependencies and scripts
```

## Development

This project uses:
- Next.js App Router for routing
- TypeScript for type safety
- Tailwind CSS for styling
- React Compiler for optimized builds

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

Private - All rights reserved.
