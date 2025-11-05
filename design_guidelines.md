# AI Agent Learning Platform - Design Guidelines

## Design Approach

**Selected Approach:** Design System - Material Design 3 foundations adapted for educational context

**Rationale:** This is a utility-focused educational application requiring clear information hierarchy, complex interactive components (drag-and-drop, circuit building, mapping), and accessibility. Material Design provides robust patterns for data-dense interfaces while maintaining clarity for learners.

**Core Principles:**
- Clarity over decoration - every visual element serves learning
- Consistent interaction patterns across all five phases
- Strong visual feedback for learner actions
- Scannable content hierarchy for text-heavy explanations

---

## Typography System

**Font Stack:** Inter (primary), system-ui fallback
- **Headings:** 
  - Phase titles: 32px, weight 700
  - Section headers: 24px, weight 600
  - Component headers: 18px, weight 600
- **Body Text:**
  - Explanatory content: 16px, weight 400, line-height 1.6
  - Instructions: 16px, weight 500
  - Card labels: 14px, weight 500
  - Tooltips/hints: 14px, weight 400
- **Interactive Elements:**
  - Buttons: 15px, weight 600, uppercase tracking
  - Input fields: 16px, weight 400

---

## Layout System

**Spacing Primitives:** Tailwind units of 4, 6, 8, 12, 16, 24 (p-4, gap-6, m-8, etc.)

**Container Structure:**
- Maximum width: max-w-7xl for main learning area
- Persistent left sidebar: w-64 for glossary/navigation (sticky)
- Main content area: Flexible width with consistent 24px padding
- Right feedback panel: w-80 (appears contextually)

**Grid Patterns:**
- Drag-and-drop columns: 6-column grid on desktop (grid-cols-6), 3 on tablet, 1 on mobile
- Boundary mapping canvas: Full-width with 12-column underlying grid for precise placement
- Circuit builder: 2-column layout (palette left w-72, canvas right flexible)

---

## Component Library

### Navigation & Progress
**Phase Stepper (Top Bar)**
- Horizontal progress indicator with 5 phases
- Completed phases: filled indicators with checkmarks
- Current phase: emphasized with border
- Locked phases: reduced opacity
- Height: h-16, sticky positioning

**Sidebar Glossary**
- Collapsible term list with category headers
- Hover reveals inline definition
- Click opens detailed explanation in overlay
- Visual indicators linking terms to the six processes

### Interactive Components

**Drag-and-Drop Cards**
- Card size: Minimum h-16, p-4 padding
- Border: 2px solid with 8px border-radius
- Dragging state: scale(1.05), elevated shadow
- Drop zone highlighting: Dashed border animation
- Spacing between cards: gap-2 in columns

**Classification Columns**
- Each column: flex-1 with min-w-48
- Column headers: sticky, h-12 with process name
- Drop zones: min-h-96, dashed borders when empty
- Visual feedback: background change on hover/drag-over

**Explanation Input Boxes**
- Appears below dropped card as textarea
- Width: Full column width minus 8px margin
- Min-height: h-24
- Character counter in bottom-right
- Validation indicator (checkmark/warning icon)

**Confidence Slider**
- Full-width range input with labels (0%, 50%, 100%)
- Live numerical readout
- Positioned above "Solve" button
- Height: h-12 with clear thumb indicator

### Boundary Mapping Canvas

**Canvas Area**
- Full-width with 1px border, min-h-screen
- Grid overlay with subtle lines (every 32px)
- Central agent box: w-64 h-64, emphasized styling
- Draggable elements: Icon + label, w-48

**Connection Lines**
- SVG paths between elements
- Curved bezier for readability
- Labels at midpoint showing process name
- Color-coded by process type (non-color implementation: varied dash patterns)

### Circuit Builder

**Block Palette (Left Panel)**
- Organized by six processes
- Each block: w-full h-16 with icon + label
- Drag to clone functionality
- Category headers with collapse/expand

**Builder Canvas (Right Panel)**
- Infinite scrollable workspace
- Snap-to-grid behavior (16px grid)
- Blocks: w-48 h-20 with input/output ports
- Connecting wires: Click port → click port flow
- Delete zone at bottom (trash icon)

### Run & Trace Simulator

**Execution View**
- 2-column layout: Agent flow (left 60%), State panel (right 40%)
- Step-by-step highlighting with animation
- Current step: bold border, pulsing effect
- Completed steps: reduced opacity
- Data flow visualization: animated arrows between blocks

**Trace Log Panel**
- Fixed height: h-96 with scrolling
- Monospace font for log entries: font-mono, 14px
- Timestamped entries with indent hierarchy
- Error states: Distinct styling with icon

### Failure Injection Interface

**Toggle Panel**
- Compact toggle switches: h-10 each
- Grouped by failure type
- Inline descriptions (14px)
- Visual preview of what each fault affects

**Comparison View**
- Side-by-side layout: 50/50 split
- "Before fault" | "After fault" labels
- Synchronized scrolling
- Difference highlights

### Feedback & Assessment

**Immediate Feedback Panel (Right Sidebar)**
- Slides in from right: w-80
- Close button (top-right)
- Sections: Correctness, Explanation quality, Common confusions
- Progress bar showing overall accuracy
- "View detailed rubric" expandable section

**Telemetry Dashboard**
- Card-based layout: grid-cols-3 on desktop
- Metrics cards: h-32 with icon, value, label
- Mini sparkline charts
- Comparison indicators (up/down arrows)

### Tooltips & Hints

**Glossary Tooltips**
- Max-width: max-w-xs
- Positioned above/below trigger with arrow
- Contains: Term, definition, process badge
- Appear on hover (300ms delay) or click

**Contextual Hints**
- Speech bubble style from relevant UI element
- Triggered after repeated incorrect actions
- Dismiss button + "Don't show again" checkbox
- Animation: fade in from trigger point

### Buttons & Actions

**Primary Actions**
- Height: h-12, px-8 padding
- Full rounded corners: rounded-lg
- "Scramble", "Solve", "Run Simulation", "Submit"

**Secondary Actions**
- Height: h-10, px-6 padding
- Border style: ring-2
- "Reset", "Skip", "View Hint"

**Danger Actions**
- "Clear All", "Delete Circuit"
- Additional confirmation modal required

### Modals & Overlays

**Full-Screen Overlays**
- For detailed explanations, rubrics, STAMPER spec entry
- Max-width: max-w-4xl, centered
- Close button (top-right) + ESC key support
- Scrollable content area with fixed header/footer

**Toast Notifications**
- Bottom-right positioning
- Auto-dismiss after 4 seconds
- Stack vertically with gap-2
- Success/info/warning/error variants

---

## Accessibility Features

- All interactive elements: min 44x44px touch target
- Keyboard navigation: Tab order follows visual flow, visible focus states (ring-2)
- ARIA labels on all drag-drop zones, buttons, and interactive elements
- Skip links to main content, glossary, navigation
- High contrast mode: Toggle in header (increases border weights, removes subtle backgrounds)
- Reduced motion: Respects prefers-reduced-motion, removes animations/transitions
- Screen reader announcements for: card drops, feedback reveals, simulation steps

---

## Responsive Breakpoints

- Mobile (base): Single column, stacked phases, full-width cards
- Tablet (md: 768px): 2-3 columns for classification, side-by-side builder
- Desktop (lg: 1024px): Full 6-column grid, persistent sidebars
- Large (xl: 1280px): Optimal spacing, max-w-7xl container

---

## Animation Guidelines

**Use Sparingly - Educational Context**
- Card drag: Subtle elevation change (150ms ease)
- Drop zone highlight: Border pulse (500ms repeat)
- Simulation trace: Step highlight (300ms fade in)
- Feedback panel slide: 250ms ease-out
- All animations respect prefers-reduced-motion

---

## Data Visualization

**Progress Indicators**
- Circular progress for completion percentage
- Linear bars for calibration metrics (confidence vs accuracy)
- Stacked bars for process distribution analysis

**Comparison Charts**
- Bar charts for before/after telemetry
- Simple color-free implementation: pattern fills