#!/bin/bash

# Secure Exam Platform - Quick Start Script
# This script sets up the application automatically

set -e  # Exit on error

echo "🚀 Starting Secure Exam Platform Setup..."
echo ""

# Check Node.js
echo "📋 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo "✅ npm $(npm -v) detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Initialize database
echo "🗄️  Initializing database..."
npm run prisma:push
echo "✅ Database initialized"
echo ""

# Seed database
echo "🌱 Seeding database with demo data..."
npm run prisma:seed
echo "✅ Database seeded"
echo ""

echo "🎉 Setup completed successfully!"
echo ""
echo "📝 Demo Credentials:"
echo "   Admin:    admin@example.com / Admin@123456"
echo "   Lecturer: lecturer@example.com / Lecturer@123"
echo "   Student:  student@example.com / Student@123"
echo ""
echo "🚀 Starting development server..."
echo "   Open http://localhost:3000 in your browser"
echo ""

# Start dev server
npm run dev
