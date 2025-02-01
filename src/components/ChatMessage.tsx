import React from 'react';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import moment from 'moment';
import { useSettings } from '@/contexts/SettingsContext';

interface Props {
  message: ChatMessageType;
  timestamp: string;
}

export default function ChatMessage({ message, timestamp }: Props) {
  const { settings } = useSettings();
  const isAI = message.type === 'ai';
  
  return (
    <div className={`chat ${isAI ? 'chat-start' : 'chat-end'}`}>
      <div className="chat-header opacity-50">
        {isAI ? settings.ai_name : settings.user_name}
        <time className="text-xs ml-2">
          {moment(timestamp).format('HH:mm')}
        </time>
      </div>
      <div className="chat-bubble">
        {message.content}
      </div>
    </div>
  );
} 