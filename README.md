# AI Flashcards

## Table of Contents
- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description
**AI Flashcards** is a web application designed to help students efficiently generate and manage educational flashcards. It leverages artificial intelligence to quickly create flashcard suggestions from pasted text while also supporting manual flashcard creation, editing, and deletion. Integrated with a spaced repetition algorithm, the application enhances learning and retention. User account functionalities, including secure authentication, password changes, and account deletion, are powered by Supabase.

## Tech Stack
- **Frontend:** Astro 5, React 19, TypeScript 5, Tailwind CSS 4, Shadcn/ui
- **Backend:** Supabase
- **AI Integration:** Openrouter.ai
- **CI/CD & Hosting:** GitHub Actions, DigitalOcean
- **Testing:** 
  - **Unit Testing:** Vitest, React Testing Library, Storybook
  - **E2E Testing:** Playwright

## Getting Started Locally

### Prerequisites
- **Node.js:** Version specified in [`.nvmrc`](.nvmrc) (**22.14.0**)
- **npm:** Comes with Node.js

### Installation
Clone the repository and install the dependencies:
```bash
git clone <repository-url>
cd <project-directory>
npm install
```

### Running the Application
Start the development server:
```bash
npm run dev
```
The application will be available at [http://localhost:3000](http://localhost:3000).

## Available Scripts
From the project root, you can run:

- `npm run dev` — Starts the development server.
- `npm run build` — Builds the project for production.
- `npm run preview` — Previews the production build locally.
- `npm run astro` — Runs Astro-specific commands.
- `npm run lint` — Lints the source files.
- `npm run lint:fix` — Automatically fixes linting errors.
- `npm run format` — Formats the code using Prettier.
- `npm run test` — Runs unit tests with Vitest.
- `npm run test:ui` — Opens the Vitest UI for interactive testing.
- `npm run storybook` — Starts Storybook for component development.
- `npm run test:e2e` — Runs E2E tests with Playwright.

## Project Scope
The MVP of **AI Flashcards** includes:
- **AI-Generated Flashcards:** Users can input text to generate flashcard candidates using AI. These candidates can be quickly reviewed and edited.
- **Manual Flashcard Creation:** Users have the option to manually create flashcards by filling in "front" and "back" fields, with real-time validation.
- **Flashcard Management:** A user-friendly interface allows viewing, editing, and deletion of flashcards.
- **User Account Management:** Secure user functionalities such as login, password change, and account deletion implemented via Supabase.
- **Spaced Repetition Integration:** Approved flashcards are automatically integrated into a spaced repetition algorithm to enhance review sessions.

*Additional features and improvements are planned for future iterations.*

## Project Status
The project is currently in active development.

## License
This project is licensed under the **MIT License**.