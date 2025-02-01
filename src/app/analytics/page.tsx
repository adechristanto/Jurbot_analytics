'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Line, Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { addWeeks, addMonths, format, parseISO, compareAsc, eachMonthOfInterval, subMonths, subYears, subWeeks, isAfter, differenceInDays, isFuture } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

type TimeRange = 'year' | 'month' | 'day' | 'hour';

// Define days of week - one mutable for charts, one readonly for type safety
const DAYS_OF_WEEK_MUTABLE = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

export default function AnalyticsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [startDate, setStartDate] = useState<string>(() => {
    // Default to 1 month ago
    const date = subMonths(new Date(), 1);
    return format(date, 'yyyy-MM-dd');
  });
  const [endDate, setEndDate] = useState<string>(() => {
    // Default to today
    return format(new Date(), 'yyyy-MM-dd');
  });
  const [dateError, setDateError] = useState<string>('');

  // Function to validate and update date range
  const validateAndUpdateDates = (newStart: string, newEnd: string) => {
    const start = new Date(newStart);
    const end = new Date(newEnd);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check for future dates
    if (isFuture(end) || isFuture(start)) {
      setDateError("Cannot select future dates");
      return false;
    }

    // Check for minimum 1 week range
    const daysDifference = differenceInDays(end, start);
    if (daysDifference < 7) {
      setDateError("Date range must be at least 1 week");
      return false;
    }

    setDateError('');
    setStartDate(newStart);
    setEndDate(newEnd);
    return true;
  };

  // Function to adjust date range based on time range
  const adjustDateRangeForTimeRange = (newTimeRange: TimeRange) => {
    const today = new Date();
    let newStartDate: Date;

    switch (newTimeRange) {
      case 'year':
        newStartDate = subYears(today, 1);
        break;
      case 'month':
        newStartDate = subMonths(today, 1);
        break;
      case 'day':
      case 'hour':
        newStartDate = subWeeks(today, 1);
        break;
      default:
        newStartDate = subMonths(today, 1);
    }

    const formattedStart = format(newStartDate, 'yyyy-MM-dd');
    const formattedEnd = format(today, 'yyyy-MM-dd');
    
    validateAndUpdateDates(formattedStart, formattedEnd);
    setTimeRange(newTimeRange);
  };

  // Handle time range change
  const handleTimeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTimeRange = e.target.value as TimeRange;
    adjustDateRangeForTimeRange(newTimeRange);
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/chat-sessions');
        if (response.ok) {
          const data = await response.json();
          setSessions(data);
        }
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (!user || user.role !== 'admin' || loading) {
    return null;
  }

  // Filter sessions based on date range
  const filteredSessions = sessions.filter(session => {
    const sessionDate = new Date(session.created_at);
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the entire end date
    return sessionDate >= start && sessionDate <= end;
  });

  // Process data for charts using filteredSessions instead of sessions
  const messagesByType = filteredSessions.reduce((acc: any, session: any) => {
    const type = session.message.type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  // Function to format date based on selected time range
  const formatDate = (date: Date) => {
    switch (timeRange) {
      case 'year':
        return format(date, 'yyyy');
      case 'month':
        return format(date, 'MMM yyyy');
      case 'day':
        return format(date, 'dd MMM yyyy');
      case 'hour':
        return format(date, 'HH:mm dd MMM');
      default:
        return format(date, 'dd MMM yyyy');
    }
  };

  // Group messages by time range with proper date handling
  const messagesByDate = filteredSessions.reduce((acc: Record<string, number>, session: any) => {
    const date = new Date(session.created_at);
    const key = formatDate(date);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  // Generate all periods in the date range
  const getAllPeriods = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    switch (timeRange) {
      case 'month': {
        // Get all months in the range
        const months = eachMonthOfInterval({ start, end });
        return months.map(date => formatDate(date));
      }
      case 'year': {
        const years = [];
        for (let year = start.getFullYear(); year <= end.getFullYear(); year++) {
          years.push(year.toString());
        }
        return years;
      }
      // For day and hour views, use existing dates from messages
      default:
        return Object.keys(messagesByDate);
    }
  };

  // Get all periods and ensure each has a value (0 if no messages)
  const allPeriods = getAllPeriods();
  const completeMessagesByDate = allPeriods.reduce((acc: Record<string, number>, period) => {
    acc[period] = messagesByDate[period] || 0;
    return acc;
  }, {});

  // Sort periods chronologically
  const sortedDates = allPeriods.sort((a, b) => {
    const dateA = timeRange === 'year' ? new Date(a) : parseISO(`01 ${a}`);
    const dateB = timeRange === 'year' ? new Date(b) : parseISO(`01 ${b}`);
    return compareAsc(dateA, dateB);
  });

  // Update messageTimelineData to use complete data
  const messageTimelineData = {
    labels: sortedDates,
    datasets: [
      {
        label: 'Messages',
        data: sortedDates.map(date => completeMessagesByDate[date]),
        borderColor: '#36A2EB',
        tension: 0.4,
      },
    ],
  };

  // Process hourly distribution
  const messagesByHour = filteredSessions.reduce((acc: any, session: any) => {
    const hour = new Date(session.created_at).getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {});

  // Process daily distribution
  const messagesByDay = filteredSessions.reduce((acc: Record<DayOfWeek, number>, session: any) => {
    const dayIndex = new Date(session.created_at).getDay();
    const day = DAYS_OF_WEEK[dayIndex] as DayOfWeek;
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, Object.fromEntries(DAYS_OF_WEEK_MUTABLE.map(day => [day, 0])) as Record<DayOfWeek, number>);

  // Chart configurations
  const messageTypeData = {
    labels: Object.keys(messagesByType),
    datasets: [
      {
        data: Object.values(messagesByType),
        backgroundColor: ['#36A2EB', '#FF6384'],
        borderColor: ['#36A2EB', '#FF6384'],
      },
    ],
  };

  const hourlyDistributionData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: 'Messages by Hour',
        data: Array.from({ length: 24 }, (_, i) => messagesByHour[i] || 0),
        backgroundColor: '#36A2EB',
      },
    ],
  };

  const dailyDistributionData = {
    labels: DAYS_OF_WEEK_MUTABLE,
    datasets: [
      {
        label: 'Messages by Day',
        data: DAYS_OF_WEEK_MUTABLE.map((day) => messagesByDay[day as DayOfWeek]),
        backgroundColor: '#36A2EB',
      },
    ],
  } as const;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="min-h-screen bg-base-200 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="btn btn-ghost btn-sm"
            aria-label="Go back"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        </div>

        {/* Time Range and Date Filter */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="card bg-base-100 shadow w-full max-w-md">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Time Range Filter</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Start Date</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered"
                    value={startDate}
                    max={format(new Date(), 'yyyy-MM-dd')}
                    onChange={(e) => {
                      validateAndUpdateDates(e.target.value, endDate);
                    }}
                  />
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">End Date</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered"
                    value={endDate}
                    min={startDate}
                    max={format(new Date(), 'yyyy-MM-dd')}
                    onChange={(e) => {
                      validateAndUpdateDates(startDate, e.target.value);
                    }}
                  />
                </div>
              </div>

              {dateError && (
                <div className="alert alert-error mb-4">
                  <span>{dateError}</span>
                </div>
              )}

              <select 
                className="select select-bordered w-full"
                value={timeRange}
                onChange={handleTimeRangeChange}
              >
                <option value="year">Yearly View</option>
                <option value="month">Monthly View</option>
                <option value="day">Weekly View</option>
                <option value="hour">Hourly View</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Message Types */}
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h2 className="card-title">Message Distribution</h2>
              <div className="h-[300px] flex items-center justify-center">
                <Pie data={messageTypeData} />
              </div>
            </div>
          </div>

          {/* Message Timeline */}
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h2 className="card-title">Message Timeline</h2>
              <div className="h-[300px]">
                <Line options={chartOptions} data={messageTimelineData} />
              </div>
            </div>
          </div>

          {/* Hourly Distribution */}
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h2 className="card-title">Daily Activity Pattern</h2>
              <div className="h-[300px]">
                <Bar options={chartOptions} data={hourlyDistributionData} />
              </div>
            </div>
          </div>

          {/* Daily Distribution */}
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h2 className="card-title">Weekly Activity Pattern</h2>
              <div className="h-[300px]">
                <Bar options={chartOptions} data={dailyDistributionData} />
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="card bg-base-100 shadow md:col-span-2">
            <div className="card-body">
              <h2 className="card-title">Summary Statistics</h2>
              <div className="stats stats-vertical lg:stats-horizontal shadow">
                <div className="stat">
                  <div className="stat-title">Total Messages</div>
                  <div className="stat-value">{filteredSessions.length}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Human Messages</div>
                  <div className="stat-value">{messagesByType['human'] || 0}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">AI Messages</div>
                  <div className="stat-value">{messagesByType['ai'] || 0}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 