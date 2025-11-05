Page 1: Explainer: 
AI AGENTS
AI Agents can be described as software entities that acts autonomously to make decisions, achieve goals, and respond dynamically to its environment. 
AI Agents are essentially functional workflows that operationalize AI models and turn it into practical actions through step-by-step processes that involve complex skills, which include:
Learning: The agent improves over time by absorbing new information and experiences, adjusting its behavior to become more effective.
Interaction: The agent communicates and engages with humans, digital environments, or other agents, exchanging information to achieve tasks.
Perception: The agent gathers data from its surroundings, interpreting sensory input (like text, images, sounds, or sensor readings) to understand context.
Reasoning: The agent analyzes information logically, drawing conclusions, solving problems, and deciding what to do next based on available data.
Planning: The agent formulates strategies, mapping out step-by-step actions needed to reach its goals efficiently.
Execution: The agent actively carries out planned actions, putting strategies into practice within its environment.

Page 2: 

Example 1: 
AI Agents are essentially functional workflows that operationalize AI models and turn it into practical actions through step-by-step processes that involve complex skills, which include:
Learning: The agent improves over time by absorbing new information and experiences, adjusting its behavior to become more effective.
Interaction: The agent communicates and engages with humans, digital environments, or other agents, exchanging information to achieve tasks.
Perception: The agent gathers data from its surroundings, interpreting sensory input (like text, images, sounds, or sensor readings) to understand context.
Reasoning: The agent analyzes information logically, drawing conclusions, solving problems, and deciding what to do next based on available data.
Planning: The agent formulates strategies, mapping out step-by-step actions needed to reach its goals efficiently.
Execution: The agent actively carries out planned actions, putting strategies into practice within its environment.

Below is a simple representation of these six processes. Click 'scramble' to randomize skills and techniques used within these process and place them under the process you think it fits into. Click 'solve' to see the correct configuration. 

Activity 1: 
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>AI Agents: Core Functions</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      text-align: center;
    }

    h1 {
      text-align: center;
    }

    .container {
      display: flex;
      justify-content: space-around;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap; /* Allows wrapping if screen is narrow */
    }

    .column {
      flex: 1;
      min-width: 180px;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 10px;
      min-height: 300px;
      background-color: #f9f9f9;
    }

    .column h2 {
      text-align: center;
      margin-top: 0;
    }

    .draggable {
      margin: 5px 0;
      padding: 8px;
      border: 1px solid #333;
      border-radius: 4px;
      background-color: #f0f0f0;
      cursor: move;
    }

    .column.over {
      background-color: #e0e0e0;
    }

    .button-container {
      margin-top: 20px;
    }

    button {
      padding: 10px 20px;
      font-size: 16px;
      margin: 5px;
      cursor: pointer;
    }
  </style>
</head>
<body>

<h1>AI Agents: Core Processes</h1>

<!-- Columns -->
<div class="container">
  <div class="column" id="learning"
       ondragover="allowDrop(event)"
       ondragenter="highlight(event)"
       ondragleave="unhighlight(event)"
       ondrop="dropItem(event)">
    <h2>LEARNING</h2>
  </div>

  <div class="column" id="interaction"
       ondragover="allowDrop(event)"
       ondragenter="highlight(event)"
       ondragleave="unhighlight(event)"
       ondrop="dropItem(event)">
    <h2>INTERACTION</h2>
  </div>

  <div class="column" id="perception"
       ondragover="allowDrop(event)"
       ondragenter="highlight(event)"
       ondragleave="unhighlight(event)"
       ondrop="dropItem(event)">
    <h2>PERCEPTION</h2>
  </div>

  <div class="column" id="reasoning"
       ondragover="allowDrop(event)"
       ondragenter="highlight(event)"
       ondragleave="unhighlight(event)"
       ondrop="dropItem(event)">
    <h2>REASONING</h2>
  </div>

  <div class="column" id="planning"
       ondragover="allowDrop(event)"
       ondragenter="highlight(event)"
       ondragleave="unhighlight(event)"
       ondrop="dropItem(event)">
    <h2>PLANNING</h2>
  </div>

  <div class="column" id="execution"
       ondragover="allowDrop(event)"
       ondragenter="highlight(event)"
       ondragleave="unhighlight(event)"
       ondrop="dropItem(event)">
    <h2>EXECUTION</h2>
  </div>
</div>

<!-- Buttons -->
<div class="button-container">
  <button onclick="scramble()">Scramble</button>
  <button onclick="solve()">Solve</button>
</div>

<script>
  // List of items and their correct columns
  const items = [
    // LEARNING
    { id: "feedback_loops", text: "Feedback Loops", correctColumn: "learning" },
    { id: "adaptation", text: "Adaptation", correctColumn: "learning" },
    { id: "memory", text: "Memory", correctColumn: "learning" },
    // INTERACTION
    { id: "communication", text: "Communication", correctColumn: "interaction" },
    { id: "api_integration", text: "API Integration", correctColumn: "interaction" },
    { id: "output_generation", text: "Output Generation", correctColumn: "interaction" },
    // PERCEPTION
    { id: "input_processing", text: "Input Processing", correctColumn: "perception" },
    { id: "context_understanding", text: "Context-Understanding", correctColumn: "perception" },
    { id: "state_tracking", text: "State Tracking", correctColumn: "perception" },
    // REASONING
    { id: "logical_interface", text: "Logical Interface", correctColumn: "reasoning" },
    { id: "knowledge_base", text: "Knowledge Base", correctColumn: "reasoning" },
    { id: "heuristics", text: "Heuristics", correctColumn: "reasoning" },
    // PLANNING
    { id: "optimization", text: "Optimization", correctColumn: "planning" },
    { id: "strategy", text: "Strategy", correctColumn: "planning" },
    { id: "goal_setting", text: "Goal-Setting", correctColumn: "planning" },
    // EXECUTION
    { id: "monitoring", text: "Monitoring", correctColumn: "execution" },
    { id: "tool_usage", text: "Tool Usage", correctColumn: "execution" },
    { id: "action_selection", text: "Action Selection", correctColumn: "execution" },
  ];

  // Create and place all draggable elements in their correct columns
  function createDraggableElements() {
    items.forEach(item => {
      const div = document.createElement("div");
      div.id = item.id;
      div.className = "draggable";
      div.draggable = true;
      div.ondragstart = dragItem;
      div.textContent = item.text;

      // For the initial layout, place each item in the correct column
      // We'll scramble them afterward to start in a random state
      document.getElementById(item.correctColumn).appendChild(div);
    });
  }

  // Randomly move each item into one of the 6 columns
  function scramble() {
    const columns = ["learning", "interaction", "perception", "reasoning", "planning", "execution"];
    items.forEach(item => {
      const randomColumn = columns[Math.floor(Math.random() * columns.length)];
      document.getElementById(randomColumn).appendChild(document.getElementById(item.id));
    });
  }

  // Return all items to their correct columns
  function solve() {
    items.forEach(item => {
      const correctCol = document.getElementById(item.correctColumn);
      correctCol.appendChild(document.getElementById(item.id));
    });
  }

  // Drag-and-drop functions
  function dragItem(event) {
    event.dataTransfer.setData("text", event.target.id);
  }

  function allowDrop(event) {
    event.preventDefault();
  }

  function highlight(event) {
    event.currentTarget.classList.add("over");
  }

  function unhighlight(event) {
    event.currentTarget.classList.remove("over");
  }

  function dropItem(event) {
    event.preventDefault();
    event.currentTarget.classList.remove("over");

    const draggedItemId = event.dataTransfer.getData("text");
    const draggedElement = document.getElementById(draggedItemId);
    event.currentTarget.appendChild(draggedElement);
  }

  // Set up the page
  createDraggableElements(); // First create in the correct columns
  scramble(); // Then scramble them to start
</script>
</body>
</html>



Page 3
Example 2: The AI Health Coach

Below is an example of an AI Agent in a relatable context. 
The AI Health Coach represented below is designed to manage of a wide range of health-related tasks.
Click 'scramble' to randomize skills and techniques used within these process and place them under the process you think it fits into. Click 'solve' to see the correct configuration. 


Activity 2: 
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>AI Health Coach - Core Functions</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      text-align: center;
    }

    h1 {
      text-align: center;
    }

    .container {
      display: flex;
      justify-content: space-around;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap; /* Allows wrapping if screen is narrow */
    }

    .column {
      flex: 1;
      min-width: 180px;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 10px;
      min-height: 300px;
      background-color: #f9f9f9;
    }

    .column h2 {
      margin-top: 0;
      text-transform: uppercase;
    }

    .draggable {
      margin: 5px 0;
      padding: 8px;
      border: 1px solid #333;
      border-radius: 4px;
      background-color: #f0f0f0;
      cursor: move;
    }

    .column.over {
      background-color: #e0e0e0;
    }

    .button-container {
      margin-top: 20px;
    }

    button {
      padding: 10px 20px;
      font-size: 16px;
      margin: 5px;
      cursor: pointer;
    }
  </style>
</head>
<body>

<h1>AI Health Coach: Core Processes</h1>

<!-- Columns -->
<div class="container">
  <div class="column" id="learning"
       ondragover="allowDrop(event)"
       ondragenter="highlight(event)"
       ondragleave="unhighlight(event)"
       ondrop="dropItem(event)">
    <h2>Learning</h2>
  </div>

  <div class="column" id="interaction"
       ondragover="allowDrop(event)"
       ondragenter="highlight(event)"
       ondragleave="unhighlight(event)"
       ondrop="dropItem(event)">
    <h2>Interaction</h2>
  </div>

  <div class="column" id="perception"
       ondragover="allowDrop(event)"
       ondragenter="highlight(event)"
       ondragleave="unhighlight(event)"
       ondrop="dropItem(event)">
    <h2>Perception</h2>
  </div>

  <div class="column" id="reasoning"
       ondragover="allowDrop(event)"
       ondragenter="highlight(event)"
       ondragleave="unhighlight(event)"
       ondrop="dropItem(event)">
    <h2>Reasoning</h2>
  </div>

  <div class="column" id="planning"
       ondragover="allowDrop(event)"
       ondragenter="highlight(event)"
       ondragleave="unhighlight(event)"
       ondrop="dropItem(event)">
    <h2>Planning</h2>
  </div>

  <div class="column" id="execution"
       ondragover="allowDrop(event)"
       ondragenter="highlight(event)"
       ondragleave="unhighlight(event)"
       ondrop="dropItem(event)">
    <h2>Execution</h2>
  </div>
</div>

<!-- Buttons -->
<div class="button-container">
  <button onclick="scramble()">Scramble</button>
  <button onclick="solve()">Solve</button>
</div>

<script>
  // List of items and their correct columns in an AI Health Coach scenario
  const items = [
    // LEARNING
    { id: "analyze_history", text: "Analyze Past Health Data", correctColumn: "learning" },
    { id: "adapt_plans", text: "Adapt Plans Based on Feedback", correctColumn: "learning" },
    { id: "store_user_prefs", text: "Store User Preferences", correctColumn: "learning" },

    // INTERACTION
    { id: "send_notifications", text: "Send Notifications & Alerts", correctColumn: "interaction" },
    { id: "chat_via_app", text: "Chat with User via App", correctColumn: "interaction" },
    { id: "api_integration", text: "Connect with Wearable/Calendar APIs", correctColumn: "interaction" },

    // PERCEPTION
    { id: "input_processing", text: "Process Wearable Sensor Data", correctColumn: "perception" },
    { id: "track_user_state", text: "Track User's Activity Level", correctColumn: "perception" },
    { id: "context_awareness", text: "Understand Context (Sleep/Stress)", correctColumn: "perception" },

    // REASONING
    { id: "recommend_exercises", text: "Recommend Exercises via Knowledge Base", correctColumn: "reasoning" },
    { id: "apply_health_rules", text: "Apply Health Rules & Logic", correctColumn: "reasoning" },
    { id: "use_heuristics", text: "Use Heuristics (e.g. 10k steps/day)", correctColumn: "reasoning" },

    // PLANNING
    { id: "optimize_routine", text: "Optimize Weekly Routine", correctColumn: "planning" },
    { id: "strategy_design", text: "Design Strategy for Weight Loss", correctColumn: "planning" },
    { id: "goal_setting", text: "Set Achievable Goals", correctColumn: "planning" },

    // EXECUTION
    { id: "monitor_progress", text: "Monitor Daily Progress", correctColumn: "execution" },
    { id: "notify_adjustments", text: "Notify When Adjustments Are Needed", correctColumn: "execution" },
    { id: "action_reminders", text: "Remind User to Complete Tasks", correctColumn: "execution" }
  ];

  // Create and place all draggable elements in their correct columns, then scramble
  function createDraggableElements() {
    items.forEach(item => {
      const div = document.createElement("div");
      div.id = item.id;
      div.className = "draggable";
      div.draggable = true;
      div.ondragstart = dragItem;
      div.textContent = item.text;
      // Place each item in its correct column initially
      document.getElementById(item.correctColumn).appendChild(div);
    });
  }

  // Randomly move each item into one of the 6 columns
  function scramble() {
    const columns = ["learning", "interaction", "perception", "reasoning", "planning", "execution"];
    items.forEach(item => {
      const randomColumn = columns[Math.floor(Math.random() * columns.length)];
      document.getElementById(randomColumn).appendChild(document.getElementById(item.id));
    });
  }

  // Return all items to their correct columns
  function solve() {
    items.forEach(item => {
      const correctCol = document.getElementById(item.correctColumn);
      correctCol.appendChild(document.getElementById(item.id));
    });
  }

  // Drag-and-drop event handlers
  function dragItem(event) {
    event.dataTransfer.setData("text", event.target.id);
  }

  function allowDrop(event) {
    event.preventDefault();
  }

  function highlight(event) {
    event.currentTarget.classList.add("over");
  }

  function unhighlight(event) {
    event.currentTarget.classList.remove("over");
  }

  function dropItem(event) {
    event.preventDefault();
    event.currentTarget.classList.remove("over");

    const draggedItemId = event.dataTransfer.getData("text");
    const draggedElement = document.getElementById(draggedItemId);
    event.currentTarget.appendChild(draggedElement);
  }

  // On page load: create items, then scramble them
  createDraggableElements();
  scramble();
</script>

</body>
</html>
