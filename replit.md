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
- ✅ Frontend components and design system complete
- ✅ Backend API and storage layer complete
- ✅ Integration and i18n setup complete
- ⏳ End-to-end testing pending

## Recent Changes
- Created complete schema for learner progress, classifications, boundary maps, circuits, and simulations
- Implemented all five phase components with rich interactions
- Configured educational design system with process-specific colors
- Set up i18next for internationalization with comprehensive English translation file
- Built comprehensive assessment and feedback systems
- Integrated backend APIs with custom hooks for session management, classification, boundary mapping, circuit building, and simulation
- Implemented rubric-based evaluation for classifications and explanations
- Added calibration metrics to compare confidence vs actual performance
- Created in-memory storage with session persistence using localStorage
- All text content structured in translation JSON for easy future translation
