# AI Agents Learning Platform

## Overview
This project is an interactive web application designed to teach the fundamentals of AI agents. It guides learners through five pedagogically structured phases, from conceptual understanding to building and debugging their own agents. The platform aims to demystify AI agent development through hands-on experience, visual learning, and immediate feedback. The core business vision is to provide an accessible and engaging educational tool for individuals interested in AI, leveraging a unique pedagogical approach to build foundational knowledge and practical skills in agent design.

## User Preferences
I prefer simple language and clear, concise explanations.
I want an iterative development process, with frequent check-ins and opportunities for feedback.
Please ask before making any major architectural changes or decisions.
I prefer detailed explanations for complex concepts but concise summaries for familiar ones.
Do not make changes to the `shared/runtime/` folder without explicit approval.
Do not modify the core `Health Coach` scenario files in `shared/scenarios/health-coach/`.

## Translation Workflow
**CRITICAL**: Whenever any changes are made to English text in `client/src/locales/en/translation.json`, the corresponding Russian (`client/src/locales/ru/translation.json`) and Latvian (`client/src/locales/lv/translation.json`) translations MUST be updated immediately with the highest quality, native-speaker-level translations. This ensures complete internationalization parity across all three languages at all times.

## Recent Changes (December 2024)

### Mobile Accessibility Improvements (WCAG 2.1 AA Compliance)
- **Touch targets**: All interactive elements now meet 44×44px minimum (WCAG 2.5.5) including buttons, dialog close buttons, draggable cards
- **Circuit Builder mobile support**: Added tap-to-add blocks for touch devices, pinch-to-zoom, pan gestures via React Flow configuration
- **Classification Activity**: Mobile-specific instructions ("Tap to select, tap to place") shown on touch devices instead of drag instructions
- **Responsive panels**: FeedbackPanel now full-width on mobile (w-full sm:w-96)
- **Touch-manipulation CSS**: Applied to all interactive draggable/pannable elements for better touch response
- **Translation parity**: All new mobile instructions available in EN, RU, and LV

### Phase Navigation Refactoring
- **Type-safe learning stages**: Replaced fractional phase numbers (0, 0.5, 0.75) with a type-safe `LearningStage` union type defined in `shared/learningTypes.ts`
- **Stage types**: Pre-phase stages (`'primer'`, `'workedExample'`, `'guidedPractice'`) and main phases (`1`, `2`, `3`, `4`, `5`)
- **Helper functions**: `isPrePhase()`, `isMainPhase()`, `getNextStage()`, `getPreviousStage()` for clean navigation logic
- **Benefits**: Cleaner code, better TypeScript type safety, easier to understand and maintain

### Shared Classification Data
- Created `shared/classificationData.ts` to centralize classification items used by both frontend and backend
- Eliminates sync issues between the 12 classification items across the codebase

### Phase Completion/Navigation Decoupling
- `markPhaseComplete(phase)`: Marks a phase complete without advancing (for re-saves, replays)
- `handlePhaseComplete()`: Marks complete AND advances to next phase (for explicit Continue actions)
- Allows users to revisit completed phases and perform actions without being auto-advanced

## System Architecture
The application is a React single-page application (SPA) utilizing Wouter for routing and i18next for internationalization. The UI/UX features a custom educational theme with distinct color coding for six core AI agent processes (Learning, Connections, Perception, Reasoning, Planning, Execution) to enhance visual learning. Shadcn UI components are used and customized for an educational context, ensuring WCAG compliance and keyboard navigation.

The learning journey is structured around five core phases:
1.  **Classification & Explanation**: Drag-and-drop interface with confidence calibration.
2.  **Boundary Mapping**: Interactive canvas for defining agent environment elements and their connections to processes.
3.  **Circuit Building**: Visual flow builder using React Flow for constructing agent logic.
4.  **Simulation & Testing**: Step-by-step execution tracer with deterministic failure injection for debugging.
5.  **Assessment & Review**: Metrics dashboard with calibration scoring.

Key technical implementations include a deterministic execution engine for simulations, a 4-slot fixed pipeline (Perception → Reasoning → Planning → Execution) with supporting "rails" for Memory and Tools. Comprehensive API validation is performed using Zod. Frontend state is managed with React hooks and localStorage persistence. The design emphasizes pedagogical principles like cognitive apprenticeship and metacognition, accessibility, and translatability, with full internationalization support for languages including Russian and Latvian. The platform provides flexible phase navigation and a retry mechanism for micro-checks to enhance the learning experience. User-facing terminology, such as "Interaction" renamed to "Connections," has been updated for clarity.

## External Dependencies
-   **Frontend Framework**: React
-   **Styling**: Tailwind CSS
-   **UI Components**: Shadcn UI
-   **Routing**: Wouter
-   **Visualization**: React Flow (`@xyflow/react`)
-   **Internationalization**: `i18next`, `react-i18next`
-   **Backend Framework**: Express.js (with in-memory storage)
-   **Data Validation**: Zod
-   **State Management/Data Fetching**: React Query