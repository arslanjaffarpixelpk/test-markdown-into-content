import { createContext, useContext } from 'react';

export interface ChatContextValue {
  /**
   * Inject a new user turn into the chat and stream an assistant reply.
   * Called by interactive blocks (Compare buttons, Widget iframes).
   * Undefined in surfaces without a live chat (e.g. the static Gallery).
   */
  sendPrompt?: (text: string) => void;
}

export const ChatContext = createContext<ChatContextValue>({});

export function useChat(): ChatContextValue {
  return useContext(ChatContext);
}
