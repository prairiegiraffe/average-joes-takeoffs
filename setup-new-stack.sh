#!/bin/bash

# Clean setup script for Average Joe's Takeoffs SaaS

echo "🚀 Setting up new Average Joe's Takeoffs SaaS..."

# Install dependencies for a proper stack
npm install next@latest react@latest react-dom@latest
npm install @prisma/client prisma
npm install next-auth @auth/prisma-adapter
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-slot
npm install tailwindcss-animate class-variance-authority clsx tailwind-merge
npm install lucide-react
npm install @tanstack/react-query
npm install zod react-hook-form @hookform/resolvers

# Dev dependencies
npm install -D @types/node @types/react @types/react-dom typescript

echo "✅ Dependencies installed!"
echo "Next steps:"
echo "1. Set up Prisma schema"
echo "2. Configure NextAuth"
echo "3. Create the app structure"