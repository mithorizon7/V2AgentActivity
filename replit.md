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

## System Architecture
The application is a React single-page application (SPA) utilizing Wouter for routing and i18next for internationalization. The UI/UX features a custom educational theme with distinct color coding for six core AI agent processes (Learning, Interaction, Perception, Reasoning, Planning, Execution) to enhance visual learning. Shadcn UI components are used and customized for an educational context.

The learning journey is structured around five core phases:
1.  **Classification & Explanation**: Drag-and-drop interface with confidence calibration.
2.  **Boundary Mapping**: Interactive canvas for defining agent environment elements and their connections to processes.
3.  **Circuit Building**: Visual flow builder using React Flow for constructing agent logic.
4.  **Simulation & Testing**: Step-by-step execution tracer with deterministic failure injection for debugging.
5.  **Assessment & Review**: Metrics dashboard with calibration scoring.

Key technical implementations include a deterministic execution engine for simulations, a 4-slot fixed pipeline (Perception → Reasoning → Planning → Execution) with supporting "rails" for Memory and Tools, and comprehensive API validation using Zod. Frontend state is managed with React hooks and localStorage persistence. The design emphasizes pedagogical principles like cognitive apprenticeship and metacognition, accessibility (WCAG compliant, keyboard navigation), and translatability.

## Recent Improvements (November 2024)

### Pedagogical Content Enhancement
- **Primer Phase**: Rewrote with everyday analogies (email processing metaphor) to help beginners understand the 4+2 model
- **Micro-checks**: Changed from abstract definitions to scenario-based questions ("Which step chose to send encouragement?")
- **Worked Examples**: Added decision heuristics and thinking prompts ("Think: Is it READING data? Yes!")
- **Language Simplification**: Replaced technical jargon with accessible terms ("smart assistant" vs "autonomous system")
- **Guided Practice**: Enhanced scaffolding with simpler prompts and IN/OUT mental model for perception vs execution
- **Coach Messages**: Made encouraging and educational rather than purely technical
- **Phase Titles**: Made action-oriented ("Apply What You've Learned" vs "Classification")
- **Error Messages**: Focused on teaching debugging skills rather than just reporting failures
- **Near-miss Examples**: Clearer explanations distinguishing word association from actual function

## External Dependencies
-   **Frontend Framework**: React
-   **Styling**: Tailwind CSS
-   **UI Components**: Shadcn UI
-   **Routing**: Wouter
-   **Visualization**: React Flow (`@xyflow/react`)
-   **Internationalization**: `i18next`, `react-i18next`
-   **Backend Framework**: Express.js (with in-memory storage)
-   **Data Validation**: Zod
-   **State Management/Data Fetching**: React Query (for optimistic updates and cache management)