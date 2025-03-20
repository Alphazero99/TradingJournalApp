"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight, DollarSign, BarChart2, TrendingUp, Award, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Chart from 'chart.js/auto';

// Types
interface DailyPnL {
  date: string;
  pnl: number;
}

interface TradeMetrics {
  totalPnL: number;
  winRate: number;
  avgRiskReward: number;
  totalTrades: number;
  profitFactor: number;
}

// Mock data - replace with actual API calls
const mockPnLData: DailyPnL[] = [
  { date: '2025-03-01', pnl: 240 },
  { date: '2025-03-02', pnl: -120 },
  { date: '2025-03-03', pnl: 350 },
  { date: '2025-03-04', pnl: 200 },
  { date: '2025-03-05', pnl: -180 },
  { date: '2025-03-06', pnl: 420 },
  { date: '2025-03-07', pnl: 150 },
  { date: '2025-03-08', pnl: -90 },
  { date: '2025-03-09', pnl: 180 },
  { date: '2025-03-10', pnl: 290 },
  { date: '2025-03-11', pnl: -150 },
  { date: '2025-03-12', pnl: 310 },
  { date: '2025-03-13', pnl: 220 },
  { date: '2025-03-14', pnl: -200 },
];

const mockMonthlyMetrics: TradeMetrics = {
  totalPnL: 1620,
  winRate: 71.4,
  avgRiskReward: 1.8,
  totalTrades: 42,
  profitFactor: 2.3,
};

const mockYearlyMetrics: TradeMetrics = {
  totalPnL: 24350,
  winRate: 68.9,
  avgRiskReward: 1.7,
  totalTrades: 312,
  profitFactor: 2.1,
};

type TimeRange = 'monthly' | 'yearly';

const TradingDashboard: React.FC = () => {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<TimeRange>('monthly');
  const [metrics, setMetrics] = useState<TradeMetrics>(mockMonthlyMetrics);
  const [pnlData, setPnlData] = useState<DailyPnL[]>(mockPnLData);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  useEffect(() => {
    // Update metrics based on selected time range
    // In a real app, this would fetch data from an API
    setMetrics(timeRange === 'monthly' ? mockMonthlyMetrics : mockYearlyMetrics);
  }, [timeRange]);

  useEffect(() => {
    // Create/update chart when component mounts or data changes
    const initChart = () => {
      if (!chartRef.current) return;
      
      // Destroy existing chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      
      const ctx = chartRef.current.getContext('2d');
      
      if (ctx) {
        // Prepare data for Chart.js
        const labels = pnlData.map(item => {
          const date = new Date(item.date);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        
        const values = pnlData.map(item => item.pnl);
        
        // Create gradient fill
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(129, 140, 248, 0.4)');
        gradient.addColorStop(1, 'rgba(129, 140, 248, 0.0)');
        
        chartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [{
              label: 'Daily P&L',
              data: values,
              borderColor: '#818cf8',
              backgroundColor: gradient,
              borderWidth: 3,
              pointBackgroundColor: '#818cf8',
              pointRadius: 4,
              pointHoverRadius: 6,
              tension: 0.2,
              fill: true,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return `P&L: $${context.parsed.y}`;
                  }
                },
                backgroundColor: '#1f2937',
                titleColor: '#e5e7eb',
                bodyColor: '#e5e7eb',
                borderColor: '#374151',
                borderWidth: 1
              },
              legend: {
                display: false
              }
            },
            scales: {
              x: {
                grid: {
                  display: false
                },
                ticks: {
                  font: {
                    size: 11
                  },
                  color: '#9ca3af'
                }
              },
              y: {
                grid: {
                  color: '#374151'
                },
                ticks: {
                  callback: function(value) {
                    return `$${value}`;
                  },
                  font: {
                    size: 11
                  },
                  color: '#9ca3af'
                }
              }
            }
          }
        });
      }
    };
    
    // Use a small timeout to ensure the DOM is ready
    const timer = setTimeout(() => {
      initChart();
    }, 100);
    
    // Cleanup on unmount
    return () => {
      clearTimeout(timer);
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [pnlData]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handlePreviousMonth = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentMonth(prevMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
  };

  const handleDayClick = (date: Date) => {
    // Format date as YYYY-MM-DD
    const formattedDate = date.toISOString().split('T')[0];
    router.push(`/add-trade?date=${formattedDate}`);
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDayOfMonth.getDate();
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    const calendarDays = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      calendarDays.push(
        <button
          key={`day-${day}`}
          onClick={() => handleDayClick(date)}
          className="h-10 w-10 rounded-full hover:bg-indigo-800 flex items-center justify-center font-medium text-gray-200"
        >
          {day}
        </button>
      );
    }
    
    return calendarDays;
  };

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Trading Dashboard</h1>
          <p className="text-gray-400 mt-1">Track your performance and manage your trades</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="mb-6 flex items-center">
          <span className="mr-4 text-gray-300 font-medium">View:</span>
          <div className="flex rounded-md overflow-hidden">
            <button
              onClick={() => setTimeRange('monthly')}
              className={`px-4 py-2 ${
                timeRange === 'monthly'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setTimeRange('yearly')}
              className={`px-4 py-2 ${
                timeRange === 'yearly'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Yearly
            </button>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-xl shadow-md border border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-green-900 rounded-lg">
                <DollarSign className="text-green-400" size={20} />
              </div>
              <h3 className="ml-3 text-gray-300 font-medium">Total P&L</h3>
            </div>
            <p className={`text-2xl font-bold mt-2 ${metrics.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(metrics.totalPnL)}
            </p>
            <p className="text-sm text-gray-400 mt-1">{timeRange === 'monthly' ? 'This month' : 'This year'}</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-xl shadow-md border border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-900 rounded-lg">
                <BarChart2 className="text-blue-400" size={20} />
              </div>
              <h3 className="ml-3 text-gray-300 font-medium">Win Rate</h3>
            </div>
            <p className="text-2xl font-bold mt-2 text-gray-200">{metrics.winRate}%</p>
            <p className="text-sm text-gray-400 mt-1">{metrics.totalTrades} trades</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-xl shadow-md border border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-purple-900 rounded-lg">
                <TrendingUp className="text-purple-400" size={20} />
              </div>
              <h3 className="ml-3 text-gray-300 font-medium">Risk/Reward</h3>
            </div>
            <p className="text-2xl font-bold mt-2 text-gray-200">{metrics.avgRiskReward}</p>
            <p className="text-sm text-gray-400 mt-1">Average ratio</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-xl shadow-md border border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-amber-900 rounded-lg">
                <Award className="text-amber-400" size={20} />
              </div>
              <h3 className="ml-3 text-gray-300 font-medium">Profit Factor</h3>
            </div>
            <p className="text-2xl font-bold mt-2 text-gray-200">{metrics.profitFactor}</p>
            <p className="text-sm text-gray-400 mt-1">Gains/Losses</p>
          </div>
          
          <div className="bg-indigo-700 p-6 rounded-xl shadow-md text-white">
            <div className="flex items-center mb-4">
              <Plus size={20} />
              <h3 className="ml-2 font-medium">Add New Trade</h3>
            </div>
            <Link 
              href="/add-trade" 
              className="block w-full mt-1 py-2 bg-indigo-600 rounded-lg text-center hover:bg-indigo-500 transition-all"
            >
              Record Trade
            </Link>
          </div>
        </div>
        
        {/* Chart Section */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-md border border-gray-700 mb-8">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Daily P&L Fluctuation</h3>
          <div className="h-64 w-full">
            <canvas ref={chartRef} height="256"></canvas>
          </div>
        </div>
        
        {/* Calendar Section */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-md border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-200">Trade Calendar</h3>
            <button
              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              className="flex items-center text-indigo-400 hover:text-indigo-300"
            >
              <Calendar size={16} className="mr-1" />
              <span>Add Trade</span>
            </button>
          </div>
          
          {isCalendarOpen && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <button onClick={handlePreviousMonth} className="p-1 rounded-full hover:bg-gray-700">
                  <ChevronLeft size={20} className="text-gray-300" />
                </button>
                <h4 className="font-medium text-gray-200">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h4>
                <button onClick={handleNextMonth} className="p-1 rounded-full hover:bg-gray-700">
                  <ChevronRight size={20} className="text-gray-300" />
                </button>
              </div>
              
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-400">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {generateCalendarDays()}
              </div>
            </div>
          )}
          
          {/* Recent Trades */}
          <h4 className="font-medium text-gray-200 mb-3">Recent Trades</h4>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-700 border border-gray-700">
                <div>
                  <p className="font-medium text-gray-200">AAPL {i === 1 ? 'Long' : i === 2 ? 'Short' : 'Long'}</p>
                  <p className="text-sm text-gray-400">Mar {13 + i}, 2025</p>
                </div>
                <div className={`text-right ${i === 2 ? 'text-red-400' : 'text-green-400'}`}>
                  <p className="font-medium">{i === 2 ? '-$125' : `+$${180 + i * 45}`}</p>
                  <p className="text-sm">{i === 2 ? '-1.2%' : `+${1.5 + i * 0.4}%`}</p>
                </div>
              </div>
            ))}
            
            <Link href="/view-all-trades" className="block text-center py-2 text-indigo-400 hover:text-indigo-300 font-medium mt-4">
              View All Trades
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingDashboard;