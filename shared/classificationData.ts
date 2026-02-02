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

export const CLASSIFICATION_FEEDBACK: Record<string, { correctProcess: AgentProcess; explanationKey: string }> = {
  save_preferences: {
    correctProcess: "learning",
    explanationKey: "classificationFeedback.save_preferences"
  },
  update_rule: {
    correctProcess: "learning",
    explanationKey: "classificationFeedback.update_rule"
  },
  store_conversation: {
    correctProcess: "learning",
    explanationKey: "classificationFeedback.store_conversation"
  },
  send_message: {
    correctProcess: "interaction",
    explanationKey: "classificationFeedback.send_message"
  },
  call_external: {
    correctProcess: "interaction",
    explanationKey: "classificationFeedback.call_external"
  },
  fetch_live_data: {
    correctProcess: "interaction",
    explanationKey: "classificationFeedback.fetch_live_data"
  },
  parse_message: {
    correctProcess: "perception",
    explanationKey: "classificationFeedback.parse_message"
  },
  gather_state: {
    correctProcess: "perception",
    explanationKey: "classificationFeedback.gather_state"
  },
  assemble_context: {
    correctProcess: "perception",
    explanationKey: "classificationFeedback.assemble_context"
  },
  detect_progress: {
    correctProcess: "perception",
    explanationKey: "classificationFeedback.detect_progress"
  },
  interpret_request: {
    correctProcess: "reasoning",
    explanationKey: "classificationFeedback.interpret_request"
  },
  recall_facts: {
    correctProcess: "reasoning",
    explanationKey: "classificationFeedback.recall_facts"
  },
  apply_rules: {
    correctProcess: "reasoning",
    explanationKey: "classificationFeedback.apply_rules"
  },
  choose_best: {
    correctProcess: "planning",
    explanationKey: "classificationFeedback.choose_best"
  },
  decide_sequence: {
    correctProcess: "planning",
    explanationKey: "classificationFeedback.decide_sequence"
  },
  clarify_goal: {
    correctProcess: "planning",
    explanationKey: "classificationFeedback.clarify_goal"
  },
  create_artifact: {
    correctProcess: "execution",
    explanationKey: "classificationFeedback.create_artifact"
  },
  format_response: {
    correctProcess: "execution",
    explanationKey: "classificationFeedback.format_response"
  },
};

export function getClassificationAnswer(itemId: string): { correctProcess: AgentProcess; explanationKey: string } | undefined {
  return CLASSIFICATION_FEEDBACK[itemId];
}
