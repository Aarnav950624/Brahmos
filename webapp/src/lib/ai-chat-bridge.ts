export const OPEN_AI_CHAT_EVENT = "healnexus:open-ai-chat";

export type OpenAiChatDetail = {
  prompt?: string;
  startVoice?: boolean;
};

export function openAiCareChat(detail: OpenAiChatDetail = {}) {
  window.dispatchEvent(
    new CustomEvent<OpenAiChatDetail>(OPEN_AI_CHAT_EVENT, { detail }),
  );
}
