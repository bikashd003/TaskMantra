# Contributing to TaskMantra

Thank you for your interest in contributing to TaskMantra! This document provides guidelines and instructions for contributing to the project.

## Development Workflow

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Bun](https://bun.sh/) (v1.0 or higher)

### Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/TaskMantra.git
   cd TaskMantra
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Start the development server:
   ```bash
   bun run dev
   ```

## Code Quality Tools

We use several tools to ensure code quality:

### Husky

Husky is set up to run checks at different Git stages:

- **Pre-commit**: Runs linting and formatting on staged files
- **Pre-push**: Runs type checking, linting, and build to ensure the app compiles

### Commit Messages

Write clear and descriptive commit messages that explain what changes you've made.

## Pull Request Process

1. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them with clear descriptive messages.

3. Push your branch to GitHub:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a Pull Request against the main branch.

5. Ensure all checks pass before requesting a review.

## Troubleshooting

If you encounter issues with Husky hooks:

1. Make sure Husky is properly installed:
   ```bash
   bun run prepare
   ```

2. Check if the hooks are executable (on Unix-based systems):
   ```bash
   chmod +x .husky/*
   ```

3. If you need to bypass hooks temporarily (use sparingly):
   ```bash
   git commit --no-verify -m "your message"
   git push --no-verify
   ```
