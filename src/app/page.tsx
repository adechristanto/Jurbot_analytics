'use client';

import React, { useEffect, useState } from 'react';
import { ChatSession } from '@/types/chat';
import { fetchChatSessions, groupSessionsBySessionId } from '@/lib/api';
import ChatSessionList from '@/components/ChatSessionList';
import ChatWindow from '@/components/ChatWindow';

export default function Home() {
  const [sessions, setSessions] = useState<Record<string, ChatSession[]>>({});
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const data = await fetchChatSessions();
        const grouped = groupSessionsBySessionId(data);
        setSessions(grouped);
        
        // Select the first session by default
        const firstSessionId = Object.keys(grouped)[0];
        if (firstSessionId) {
          setSelectedSessionId(firstSessionId);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading sessions:', error);
        setLoading(false);
      }
    };

    loadSessions();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <main className="flex h-screen bg-base-300">
      <ChatSessionList
        sessions={sessions}
        selectedSessionId={selectedSessionId}
        onSessionSelect={setSelectedSessionId}
      />
      {selectedSessionId && sessions[selectedSessionId] ? (
        <ChatWindow messages={sessions[selectedSessionId]} />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-lg text-base-content opacity-50">
            Select a chat session to view messages
          </p>
        </div>
      )}
    </main>
  );
}
