import React, { useState, useMemo, useEffect } from 'react';
import { ChatSession } from '@/types/chat';
import moment from 'moment';
import { ArrowUpIcon, ArrowDownIcon, Cog6ToothIcon, UserCircleIcon, ChartBarIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useSettings, availableThemes } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import SidebarHeader from './SidebarHeader';
import SessionFilter from './SessionFilter';
import Link from 'next/link';
import { SunIcon } from '@heroicons/react/24/outline';

interface Props {
  sessions: Record<string, ChatSession[]>;
  selectedSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
}

type SortOrder = 'asc' | 'desc';

export default function ChatSessionList({ sessions, selectedSessionId, onSessionSelect }: Props) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { settings, updateSettings } = useSettings();
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredAndSortedSessions = useMemo(() => {
    if (!sessions) return {};
    
    // First filter
    let result = Object.entries(sessions);
    if (dateRange.start || dateRange.end) {
      result = result.filter(([_, messages]) => {
        const sessionDate = moment(messages[0].created_at);
        return (!dateRange.start || sessionDate.isAfter(dateRange.start)) &&
               (!dateRange.end || sessionDate.isBefore(dateRange.end));
      });
    }

    // Then sort
    result.sort(([, messagesA], [, messagesB]) => {
      const dateA = new Date(messagesA[0].created_at).getTime();
      const dateB = new Date(messagesB[0].created_at).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return Object.fromEntries(result);
  }, [sessions, dateRange, sortOrder]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleDateChange = (start: string, end: string) => {
    setDateRange({ start, end });
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleAnalyticsClick = () => {
    router.push('/analytics');
  };

  const handleThemeChange = async (theme: string) => {
    try {
      setError(null); // Clear any previous errors
      // Only send the theme property for non-admin users
      await updateSettings({ theme: theme });
    } catch (error) {
      console.error('Failed to update theme:', error);
      setError(error instanceof Error ? error.message : 'Failed to update theme');
      // Auto-clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    }
  };

  if (!user) {
    return (
      <div className="bg-base-200 w-80 h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="bg-base-200 w-80 h-screen overflow-hidden flex flex-col">
      <SidebarHeader />
      
      {error && (
        <div className="p-4">
          <div className="alert alert-error text-sm">
            <span>{error}</span>
          </div>
        </div>
      )}
      
      {/* Analytics Button - Only show for admin */}
      {user.role === 'admin' && (
        <button
          onClick={handleAnalyticsClick}
          className="btn btn-ghost gap-2 m-4 bg-base-100"
        >
          <ChartBarIcon className="w-5 h-5" />
          Analytics
        </button>
      )}

      {/* Filter and Sort Controls */}
      <div className="border-b border-base-300">
        <button
          onClick={() => setIsFilterVisible(!isFilterVisible)}
          className="w-full p-4 flex items-center justify-between hover:bg-base-300"
        >
          <h2 className="font-medium">Filter & Sort</h2>
          <ChevronDownIcon 
            className={`w-5 h-5 transition-transform ${isFilterVisible ? 'rotate-180' : ''}`}
          />
        </button>
        
        {isFilterVisible && (
          <div className="p-4 space-y-4">
            <div className="bg-base-100 rounded-box">
              <div className="p-3">
                <SessionFilter onDateChange={handleDateChange} />
              </div>
              <div className="divider m-0"></div>
              <div className="p-3">
                <button
                  onClick={toggleSortOrder}
                  className="w-full flex items-center justify-center gap-2 py-1 hover:bg-base-200 transition-colors rounded-lg"
                >
                  <span className="font-medium">
                    {sortOrder === 'asc' ? 'Oldest First' : 'Latest First'}
                  </span>
                  {sortOrder === 'asc' ? (
                    <ArrowUpIcon className="w-4 h-4" />
                  ) : (
                    <ArrowDownIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {Object.entries(filteredAndSortedSessions).map(([sessionId, messages]) => {
            const firstMessage = messages[0];
            const lastMessage = messages[messages.length - 1];
            const isSelected = sessionId === selectedSessionId;
            
            return (
              <button
                key={sessionId}
                onClick={() => onSessionSelect(sessionId)}
                className={`w-full text-left transition-all ${
                  isSelected 
                    ? 'bg-neutral text-neutral-content' 
                    : 'bg-base-100 hover:bg-base-200'
                } rounded-box`}
              >
                <div className="p-4">
                  <div className="font-medium line-clamp-2 mb-1">
                    {firstMessage.message.content}
                  </div>
                  <div className="text-xs opacity-50">
                    {moment(lastMessage.created_at).format('MMM D, YYYY HH:mm')}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="border-t border-base-300 p-4 flex justify-between items-center bg-base-200">
        <div className="flex gap-2">
          {user.role === 'admin' ? (
            <Link href="/settings" passHref>
              <button
                className="btn btn-ghost btn-circle btn-sm"
                aria-label="Settings"
              >
                <Cog6ToothIcon className="w-5 h-5" />
              </button>
            </Link>
          ) : (
            <div className="dropdown dropdown-top">
              <button
                className="btn btn-ghost btn-circle btn-sm"
                aria-label="Change theme"
              >
                <SunIcon className="w-5 h-5" />
              </button>
              <ul className="dropdown-content menu menu-sm bg-base-200 w-52 rounded-box p-2 shadow-lg">
                <li className="menu-title">
                  <span>Select Theme</span>
                </li>
                {availableThemes.map((theme) => (
                  <li key={theme}>
                    <button
                      onClick={() => handleThemeChange(theme)}
                      className={settings.theme === theme ? 'active' : ''}
                    >
                      {theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="dropdown dropdown-top">
            <button
              className="btn btn-ghost btn-circle btn-sm"
              aria-label="User menu"
            >
              <div className="avatar placeholder">
                <div className="bg-neutral text-neutral-content rounded-full w-8">
                  <span className="text-xs">{user.name.charAt(0)}</span>
                </div>
              </div>
            </button>
            <ul className="dropdown-content menu menu-sm bg-base-200 w-52 rounded-box">
              <li className="menu-title flex items-center gap-2 p-2">
                <div className="avatar placeholder">
                  <div className="bg-neutral text-neutral-content rounded-full w-8">
                    <span className="text-xs">{user.name.charAt(0)}</span>
                  </div>
                </div>
                <span>{user.name}</span>
              </li>
              <li>
                <button onClick={handleLogout} className="text-error">
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 