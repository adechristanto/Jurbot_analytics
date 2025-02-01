export interface ChatMessage {
  type: 'human' | 'ai';
  content: string;
  additional_kwargs: Record<string, any>;
  response_metadata: Record<string, any>;
}

export interface ChatSession {
  session_id: string;
  message: ChatMessage;
  created_at: string;
} 