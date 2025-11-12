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
The application is a React single-page application (SPA) utilizing Wouter for routing and i18next for internationalization. The UI/UX features a custom educational theme with distinct color coding for six core AI agent processes (Learning, Connections, Perception, Reasoning, Planning, Execution) to enhance visual learning. Shadcn UI components are used and customized for an educational context.

The learning journey is structured around five core phases:
1.  **Classification & Explanation**: Drag-and-drop interface with confidence calibration.
2.  **Boundary Mapping**: Interactive canvas for defining agent environment elements and their connections to processes.
3.  **Circuit Building**: Visual flow builder using React Flow for constructing agent logic.
4.  **Simulation & Testing**: Step-by-step execution tracer with deterministic failure injection for debugging.
5.  **Assessment & Review**: Metrics dashboard with calibration scoring.

Key technical implementations include a deterministic execution engine for simulations, a 4-slot fixed pipeline (Perception → Reasoning → Planning → Execution) with supporting "rails" for Memory and Tools, and comprehensive API validation using Zod. Frontend state is managed with React hooks and localStorage persistence. The design emphasizes pedagogical principles like cognitive apprenticeship and metacognition, accessibility (WCAG compliant, keyboard navigation), and translatability.

## Recent Improvements (November 2024)

### Award-Caliber UX/UI Visual Refresh (November 10, 2024)
Completed comprehensive design systems pass on Primer component (pages 2-5) achieving professional educational UI standards:

**Design System Compliance:**
- Typography aligned to exact specifications (32px/24px/18px using text-[2rem]/text-2xl/text-lg)
- Eliminated all design system violations (removed one-sided borders on rounded elements)
- Consistent spacing rhythm using 8px grid system (space-y-8/10, p-6/10, gap-4/6)
- Responsive layouts with flex-wrap, mobile-first breakpoints, and proper min-widths

**Enhanced User Experience:**
- Progress indicators on all 5 Primer pages showing learner position in flow
- Stronger component affordances with hover-elevate, focus rings (WCAG 2.2 AA compliant)
- Better visual hierarchy through systematic card padding and max-width constraints
- Improved readability with leading-relaxed and proper line-heights
- Touch-friendly targets (min 44px, p-5 on options, min-w-48 on buttons)

**Micro-interactions & Polish:**
- Smooth transitions (duration-200/300) with animate-in effects for feedback
- Icon containers with colored backgrounds for visual interest
- Progressive disclosure through consistent interaction states
- Localization-resilient with flexible layouts supporting varied string lengths

**Accessibility (WCAG 2.2 AA):**
- Proper ARIA attributes (role="progressbar", aria-valuenow)
- Keyboard navigation with visible focus indicators
- Color not sole information carrier (icons + text + structure)
- Semantic HTML throughout

### Primer Micro-Check Retry Flow (November 10, 2024)
Fixed critical UX issue where learners had no way to progress after answering incorrectly:

**Retry Mechanism:**
- Added "Try Again" button that appears immediately when answer is incorrect
- Button clears selection and feedback state, allowing fresh attempt
- Uses outline variant to visually differentiate from primary submit action
- Prevents learners from being stuck in dead-end state

**Progressive Disclosure:**
- After 2 failed attempts, "Continue Anyway" button appears alongside "Try Again"
- Balances learning goals (mastery) with user autonomy (progression)
- Ensures no learner gets permanently blocked from advancing
- Maintains explanatory feedback visibility so learners still see correct reasoning

**State Management:**
- Added attempt counters (check1Attempts, check2Attempts) to track retry behavior
- Clean state transitions on retry (clears answer, hides feedback)
- Proper cleanup when advancing to next step

**User Impact:**
- Learners can retry until they understand the concept
- No more dead-end states blocking progression
- Maintains pedagogical value while respecting user autonomy
- Smooth, intuitive retry experience with clear affordances

### Classification Page Viewport Optimization (November 10, 2024)
Fixed critical usability issue where drag-drop boxes were too large to see targets on same screen:

**Layout Improvements:**
- Reduced ProcessColumn heights from min-h-96 (384px) to min-h-72 (288px) saving ~96px per column
- Implemented smart-collapsible textareas: start at min-h-10 (40px), expand to min-h-20 on focus or when containing content
- Auto-collapse empty textareas on blur to preserve vertical space savings
- Changed grid layout from 6-column XL to max 3 columns (prevents horizontal overflow on 1366×768 viewports)
- Smooth transitions on textarea expansion/collapse for polished UX

**User Impact:**
- Unsorted tray + 2-3 drop zones now visible without scrolling on laptop displays
- Cards are ~40px shorter when explanations not needed
- Better drag-and-drop flow - users can see source AND target in one viewport
- Maintains WCAG 2.2 AA compliance and keyboard navigation

### Flexible Phase Navigation (November 12, 2024)
Implemented comprehensive navigation system allowing learners to move freely between phases:

**Navigation Improvements:**
- PhaseProgress bar now clickable for ALL phases (not just completed ones) enabling direct jumps
- Added Previous/Next buttons to ALL pages: Primer, WorkedExample, GuidedPractice, and Phases 1-5
- Navigation handlers properly support fractional phase IDs (0, 0.5, 0.75, 1-5)
- All user answers preserved via localStorage when jumping between phases

**User Impact:**
- Adult learners can explore content in their preferred order
- No forced linear progression - respects user autonomy
- Maintains pedagogical scaffolding while allowing flexibility
- Smooth transitions with consistent button placement across all pages

### Terminology Update: "Interaction" → "Connections" (November 12, 2024)
Updated user-facing terminology to improve clarity for non-technical learners:

**Changes:**
- Renamed "Interaction (Tools)" to "Connections (People & Tools)" throughout UI
- Updated all labels, tooltips, hints, and accessibility text (11 translation strings)
- Maintained process color coding (cyan #0891B2) for visual consistency
- Backend identifiers remain as "interaction" (no breaking changes)

**Rationale:**
- "Connections" clearer for learners: means "talk to people or call outside services"
- Reduces confusion with "Execution" step
- Better conveys the collaborative nature of the supporting system
- Aligns with pedagogical goal of accessible, everyday language

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