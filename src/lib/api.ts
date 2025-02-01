import axios from 'axios';
import { ChatSession } from '@/types/chat';

const API_URL = 'https://ai.sollution.ai/webhook/8afed7ca-062c-44d9-9b70-f6616aa7ad52';

export const fetchChatSessions = async (): Promise<ChatSession[]> => {
  try {
    const response = await axios.get<ChatSession[]>(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    return [];
  }
};

export const groupSessionsBySessionId = (sessions: ChatSession[]) => {
  const groupedSessions = sessions.reduce((acc, session) => {
    if (!acc[session.session_id]) {
      acc[session.session_id] = [];
    }
    acc[session.session_id].push(session);
    return acc;
  }, {} as Record<string, ChatSession[]>);

  // Sort messages within each session by created_at
  Object.keys(groupedSessions).forEach(sessionId => {
    groupedSessions[sessionId].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  });

  return groupedSessions;
}; 