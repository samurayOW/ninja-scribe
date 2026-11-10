
# AGENTS.md

## Project Overview

Project name: «NinjaScribe»

«NinjaScribe» is a browser-based web application for managing meeting notes and automatically generating structured meeting summaries using artificial intelligence.

The application allows users to:
- Register and authenticate.
- Create, view, edit, and delete folders.
- Create, view, edit, and delete meeting notes.
- Organize notes into folders.
- Submit note content for AI-powered analysis.
- Generate structured summaries containing key topics, decisions, and action items.
- View and edit generated summaries.

The application is designed as a minimal MVP. Avoid implementing features outside the agreed scope unless explicitly requested.

## Technology Stack

### Programming Language
- TypeScript

### Frontend
- React
- React Router
- Vite
- Tailwind CSS

### Backend and Cloud Services
- Firebase Authentication — user registration and authentication.
- Cloud Firestore — storage of users, folders, notes, and analysis results.
- Firebase AI Logic — integration between the client application and Gemini models.
- Gemini API — AI-powered text analysis and summary generation.

### Development Tools
- npm — package and dependency management.
- Git — version control.
- GitHub — remote repository hosting.
- ESLint — code quality and static analysis.
- Prettier — code formatting.
- Firebase CLI — Firebase project management and deployment.
- Visual Studio Code — primary code editor.

## Architecture and Design Principles

### General Architecture
- Use a client-side React application built with Vite.
- Use Firebase as the primary backend infrastructure.
- Do not introduce a separate Node.js/Express backend unless explicitly requested.
- Keep application logic, UI components, and data access responsibilities separated.
- Prefer modular, reusable, and maintainable solutions.

### Feature-Sliced Design (FSD)

Organize the frontend application according to Feature-Sliced Design principles.

Use the following layers when appropriate:
- `app` — application initialization, global providers, routing, and global styles.
- `pages` — application pages and route-level composition.
- `widgets` — complex UI blocks composed of multiple features and entities.
- `features` — user interactions and business features.
- `entities` — core domain entities and their related logic.
- `shared` — reusable UI components, utilities, hooks, and configuration.

Follow FSD dependency rules:
- Higher layers may import from lower layers.
- Lower layers must not depend on higher layers.
- Avoid circular dependencies.
- Use public API entry points (`index.ts`) for cross-slice imports where appropriate.
- Do not create unnecessary layers, slices, or abstractions for a small MVP.

### Routing
- Use React Router for client-side navigation.
- Keep route definitions and route-related configuration in the `app` layer.
- Use layouts for shared page structure where appropriate.
- Implement protected routes for authenticated areas.
- Unauthenticated users must not access protected application pages.
- Redirect authenticated users away from guest-only pages when appropriate.
- Handle unknown routes with a dedicated 404 page.

## TypeScript Guidelines

- Enable and maintain strict TypeScript settings.
- Avoid using `any`. Prefer explicit types, interfaces, and type guards.
- Define types for application entities and Firebase data.
- Avoid unnecessary type assertions.
- Keep types close to the modules that use them.
- Reuse shared types when they represent common domain concepts.

## React Guidelines

- Use functional components and React Hooks.
- Prefer small, focused, reusable components.
- Keep components responsible for presentation separate from business logic when appropriate.
- Avoid unnecessary state and prop drilling.
- Use controlled components for forms when appropriate.
- Add stable keys when rendering lists.
- Avoid unnecessary use of `useEffect`.
- Do not place complex business logic directly inside JSX.
- Follow React best practices and keep components readable.

## Styling Guidelines

- Use Tailwind CSS as the primary styling solution.
- Follow the established dark visual theme.
- The main color palette should use dark grays, purples, and blues.
- Maintain consistent spacing, typography, borders, and component states.
- Design interfaces to be responsive.
- Support screen widths from 320px to 1440px.
- Ensure sufficient contrast and clear visual hierarchy.
- Avoid introducing additional CSS frameworks or UI libraries without approval.

## Firebase Guidelines

### Firebase Authentication
- Use Firebase Authentication for user registration, login, and logout.
- Track the current authentication state.
- Do not store passwords or sensitive authentication credentials in Firestore.
- Use authentication state to control access to protected routes.

### Cloud Firestore

Use the following main collections:

#### users
- `uid` (primary key)
- `email`
- `displayName`
- `createdAt`
- `updatedAt`

#### folders
- `folderId` (primary key)
- `name`
- `description`
- `userId`
- `createdAt`
- `updatedAt`

#### notes
- `noteId` (primary key)
- `title`
- `content`
- `folderId`
- `userId`
- `summary`
- `keyTopics`
- `decisions`
- `actionItems`
- `createdAt`
- `updatedAt`

Firestore document IDs serve as unique identifiers:
- User document ID corresponds to Firebase Authentication `uid`.
- Folder document ID serves as `folderId`.
- Note document ID serves as `noteId`.

Important data rules:
- Every folder must belong to a specific user.
- Every note must belong to a specific user and folder.
- Store AI analysis results directly in the corresponding note document.
- Do not create a separate `analysisResults` collection unless explicitly requested.
- Use Firestore timestamps for date fields.
- Use Firestore Security Rules to restrict access to each user's data.
- Never rely exclusively on frontend checks for data security.

### Firebase AI Logic and Gemini API
- Use Firebase AI Logic as the integration layer for Gemini.
- Do not expose Gemini API keys or other secrets in client-side code.
- Send only the data required for the requested analysis.
- Validate and handle AI responses before saving them.
- Expect AI-generated content to be potentially incomplete or malformed.
- Handle API errors, unavailable services, and unexpected responses.
- Keep the AI response structure consistent.

The generated analysis should contain:
- `summary` — concise meeting summary.
- `keyTopics` — main topics discussed.
- `decisions` — decisions made during the meeting.
- `actionItems` — planned actions and tasks.

## Code Quality

- Follow ESLint rules.
- Use Prettier for consistent formatting.
- Prefer clear and descriptive names.
- Use camelCase for variables and functions.
- Use PascalCase for React components and TypeScript types.
- Use kebab-case for file names unless an established project convention requires otherwise.
- Avoid duplicated code.
- Keep functions focused on a single responsibility.
- Remove unused imports, variables, and dependencies.
- Do not introduce unnecessary dependencies.

## Error Handling

- Handle errors from Firebase services explicitly.
- Provide clear user-facing error messages.
- Do not expose internal errors, stack traces, or sensitive information to users.
- Handle loading, success, empty, and error states in the UI.
- Prevent duplicate form submissions where appropriate.
- Validate user input before performing operations.

## Security

- Never commit API keys, credentials, tokens, or `.env` files.
- Keep environment-specific configuration outside the source code.
- Use environment variables for public Firebase configuration where appropriate.
- Remember that Vite client-side environment variables are exposed to the browser and must never contain secrets.
- Configure Firestore Security Rules to enforce user-level access restrictions.
- Validate ownership of folders and notes when performing operations.
- Do not trust client-provided user IDs without verifying the authenticated user.

## Development Workflow

Before implementing a new feature:
1. Inspect the existing project structure and relevant files.
2. Understand the current architecture and conventions.
3. Identify the appropriate FSD layer.
4. Reuse existing components, utilities, and types where possible.
5. Implement only the functionality required by the task.

After implementing changes:
1. Check TypeScript errors.
2. Run ESLint.
3. Run the available build or validation scripts.
4. Fix errors introduced by the changes.
5. Summarize the implemented changes and mention any remaining issues.

## AI Agent Rules

- Follow this document when modifying the project.
- Do not rewrite or restructure unrelated parts of the application.
- Do not install additional dependencies without a clear reason.
- Do not introduce new architectural patterns without justification.
- Do not generate placeholder functionality when a working implementation is expected.
- Do not silently change the established data model or application behavior.
- Ask for clarification when a requirement is ambiguous and a wrong assumption could affect the architecture or existing functionality.
- Prefer simple, maintainable solutions over premature abstractions.
- Keep documentation and implementation consistent.
- Explain important architectural decisions when proposing significant changes.
