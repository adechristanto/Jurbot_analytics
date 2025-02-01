import React, { useMemo } from 'react';
import { ChatSession } from '@/types/chat';
import ChatMessage from './ChatMessage';

interface Props {
  messages: ChatSession[];
}

export default function ChatWindow({ messages }: Props) {
  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col bg-base-100 h-screen">
      <div className="p-4 border-b border-base-300">
        <h1 className="text-2xl font-bold text-base-content">Chat History</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {sortedMessages.map((session, index) => (
            <ChatMessage
              key={`${session.session_id}-${index}`}
              message={session.message}
              timestamp={session.created_at}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 