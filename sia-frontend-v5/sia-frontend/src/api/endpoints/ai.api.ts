import { getMockAiReply } from "@/data/aiKnowledgeBase";

/**
 * Unlike the other endpoint modules, this one is intentionally NOT wired to
 * `apiClient` yet — the brief asks for mock, keyword-based replies for now.
 * Swapping to a real backend later is a one-line change: replace the body
 * with `apiClient.post("/ai/chat", { message }).then(r => r.data.reply)`.
 */
export const aiApi = {
  sendMessage: async (message: string): Promise<string> => {
    // Simulated network delay so the typing-indicator has something to show.
    await new Promise((resolve) => setTimeout(resolve, 700 + Math.random() * 500));
    return getMockAiReply(message);
  },
};
