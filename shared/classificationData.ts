import { AgentProcess } from "./schema";

export type ClassificationItemData = {
  id: string;
  correctProcess: AgentProcess;
  feedbackKey: string;
};

export const CLASSIFICATION_ITEMS_DATA: ClassificationItemData[] = [
  { id: "save_preferences", correctProcess: "learning", feedbackKey: "savePreferences" },
  { id: "update_rule", correctProcess: "learning", feedbackKey: "updateRule" },
  { id: "store_conversation", correctProcess: "learning", feedbackKey: "storeConversation" },
  { id: "send_message", correctProcess: "interaction", feedbackKey: "sendMessage" },
  { id: "call_external", correctProcess: "interaction", feedbackKey: "callExternal" },
  { id: "fetch_live_data", correctProcess: "interaction", feedbackKey: "fetchLiveData" },
  { id: "parse_message", correctProcess: "perception", feedbackKey: "parseMessage" },
  { id: "gather_state", correctProcess: "perception", feedbackKey: "gatherState" },
  { id: "assemble_context", correctProcess: "perception", feedbackKey: "assembleContext" },
  { id: "detect_progress", correctProcess: "perception", feedbackKey: "detectProgress" },
  { id: "interpret_request", correctProcess: "reasoning", feedbackKey: "interpretRequest" },
  { id: "recall_facts", correctProcess: "reasoning", feedbackKey: "recallFacts" },
  { id: "apply_rules", correctProcess: "reasoning", feedbackKey: "applyRules" },
  { id: "choose_best", correctProcess: "planning", feedbackKey: "chooseBest" },
  { id: "decide_sequence", correctProcess: "planning", feedbackKey: "decideSequence" },
  { id: "clarify_goal", correctProcess: "planning", feedbackKey: "clarifyGoal" },
  { id: "create_artifact", correctProcess: "execution", feedbackKey: "createArtifact" },
  { id: "format_response", correctProcess: "execution", feedbackKey: "formatResponse" },
];

export const CLASSIFICATION_FEEDBACK: Record<string, { correctProcess: AgentProcess; explanation: string }> = {
  save_preferences: {
    correctProcess: "learning",
    explanation: "Saving preferences stores information for future use - a core Memory/Learning function"
  },
  update_rule: {
    correctProcess: "learning",
    explanation: "Updating rules based on feedback is how agents learn and adapt over time"
  },
  store_conversation: {
    correctProcess: "learning",
    explanation: "Storing conversation summaries builds the agent's memory for future context"
  },
  send_message: {
    correctProcess: "interaction",
    explanation: "Sending messages to users is how agents interact with the outside world"
  },
  call_external: {
    correctProcess: "interaction",
    explanation: "Calling external services (APIs, tools) is how agents connect with outside systems"
  },
  fetch_live_data: {
    correctProcess: "interaction",
    explanation: "Fetching live data requires connecting to external sources - a Connections function"
  },
  parse_message: {
    correctProcess: "perception",
    explanation: "Parsing messages turns raw input into structured data - the first step in understanding"
  },
  gather_state: {
    correctProcess: "perception",
    explanation: "Gathering system state is how agents read and collect information about their environment"
  },
  assemble_context: {
    correctProcess: "perception",
    explanation: "Assembling context organizes available information for use - core Perception work"
  },
  detect_progress: {
    correctProcess: "perception",
    explanation: "Detecting progress signals means reading status information from the environment"
  },
  interpret_request: {
    correctProcess: "reasoning",
    explanation: "Interpreting what users want requires understanding meaning - core Reasoning work"
  },
  recall_facts: {
    correctProcess: "reasoning",
    explanation: "Recalling facts to understand situations uses stored knowledge during Reasoning"
  },
  apply_rules: {
    correctProcess: "reasoning",
    explanation: "Applying rules and policies is how agents use logic to make sense of data"
  },
  choose_best: {
    correctProcess: "planning",
    explanation: "Choosing the best approach among options is a Planning decision"
  },
  decide_sequence: {
    correctProcess: "planning",
    explanation: "Deciding action order and sequence is core Planning work"
  },
  clarify_goal: {
    correctProcess: "planning",
    explanation: "Clarifying goals sets the direction for what to achieve - a Planning function"
  },
  create_artifact: {
    correctProcess: "execution",
    explanation: "Creating artifacts (files, records, events) is taking action - Execution"
  },
  format_response: {
    correctProcess: "execution",
    explanation: "Formatting the final response for delivery is the last Execution step"
  },
};

export function getClassificationAnswer(itemId: string): { correctProcess: AgentProcess; explanation: string } | undefined {
  return CLASSIFICATION_FEEDBACK[itemId];
}
