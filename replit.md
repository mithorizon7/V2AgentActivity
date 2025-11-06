# AI Agents Learning Platform

## Overview
An interactive educational web application that teaches AI agent fundamentals through five pedagogically-designed phases. Learners progress from understanding core concepts to building and debugging their own agents.

## Project Structure

### Frontend Architecture
- **React SPA** with Wouter for routing
- **Internationalization**: i18next configured for easy future translation
- **Design System**: Custom educational theme with process-specific colors
- **Component Library**: Shadcn UI with custom educational components

### Core Learning Phases
1. **Classification & Explanation**: Drag-and-drop activity with required explanations and confidence slider
2. **Boundary Mapping**: Interactive canvas for mapping agent environment elements  
3. **Circuit Building**: Visual flow builder using React Flow
4. **Simulation & Testing**: Step-by-step execution tracer with failure injection
5. **Assessment & Review**: Comprehensive metrics dashboard with calibration scoring

### Six Agent Processes
Each with distinct color coding for visual learning:
- **Learning** (Purple): Memory, Adaptation, Feedback Loops
- **Interaction** (Blue): Communication, APIs, Output Generation
- **Perception** (Green): Input Processing, Context Understanding, State Tracking
- **Reasoning** (Orange): Logic, Knowledge Base, Heuristics
- **Planning** (Pink): Strategy, Optimization, Goal Setting
- **Execution** (Red-Orange): Tool Usage, Action Selection, Monitoring

### Key Features
- Real-time drag-and-drop classification with immediate feedback
- Confidence slider for metacognitive calibration
- Boundary mapping canvas with element-to-process connections
- Visual circuit builder with block palette
- Simulation tracer with step-by-step execution logs
- Failure injection for debugging practice
- Comprehensive assessment dashboard with rubric scoring
- Full keyboard navigation and ARIA labels for accessibility
- High-contrast mode toggle and reduced-motion support

### Technology Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Routing**: Wouter
- **Visualization**: React Flow (@xyflow/react)
- **i18n**: i18next, react-i18next
- **Backend**: Express.js with in-memory storage
- **State Management**: React hooks with localStorage persistence

### Design Philosophy
- **Pedagogical**: Based on cognitive apprenticeship, retrieval practice, and metacognition
- **Accessible**: WCAG compliant with keyboard navigation and screen reader support
- **Translatable**: All text content structured for easy translation
- **Visual**: Process-specific colors and clear visual hierarchy
- **Interactive**: Immediate feedback and step-by-step guidance

## Development Status
- ✅ Executable runtime engine with Health Coach scenario
- ✅ Fixed 4-slot pipeline with real causality demonstration
- ✅ Beginner-friendly UI with plain language dual labels
- ✅ Prefilled defaults and guided coach panel
- ✅ Deterministic failure injection for reproducible learning
- ✅ Backend API with server-side classification validation
- ✅ Complete i18n integration with translation-key architecture
- ⏳ Accessibility enhancements (keyboard navigation, ARIA) pending

## Recent Changes (November 2024)
**Phase 1: Runtime Core & Executable Blocks**
- Built deterministic execution engine (runPipeline, applyFailures, createInitialContext)
- Created 8 Health Coach blocks with real run() functions processing wearable data
- Implemented 3 test fixtures (normal, borderline, noisy sensor data)
- Replaced free-form graph editor with fixed 4-slot pipeline (Perception → Reasoning → Planning → Execution)
- Made failure injection deterministic (±15 BPM alternating, -800 steps) for educational reproducibility

**Phase 2: Beginner-Friendly Enhancements**
- Added plain language dual labels: "Read the data (Perception)", "Decide what it means (Reasoning)", etc.
- Prefilled pipeline with sensible defaults so learners can run immediately
- Built GuidedCoachPanel component providing step-by-step guidance and tips
- Updated primary CTA to "Run Demo" for progressive disclosure
- Enhanced fixture descriptions and outcome summary chips (Result • Steps • Tool Calls)
- Improved Phase 3 and Phase 4 layouts with coach panel in side column

**Phase 3: Complete i18n Integration**
- Implemented translation-key architecture: blocks store keys (e.g., `healthCoach.blocks.perception.parse.name`), UI translates via t()
- Expanded translation.json to 260+ keys covering all beginner flow strings
- All components use useTranslation(): GuidedCoachPanel, FixedPipelineBuilder, LearningPage, SimulationTracer
- Health Coach blocks fully localizable: labels, descriptions, dual labels, failure modes
- Zero hardcoded English in critical learner path (Phases 3-4)
- Production-ready for multi-language deployment

**Earlier Work**
- Classification activity with drag-and-drop and explanation textareas
- Boundary mapping canvas for environment-to-process connections
- Simulation tracer with step visualization
- Assessment dashboard with calibration metrics
- i18next framework with translation file structure
- Server-side classification validation replacing client trust
