"use client"

import React, { useState } from 'react';
import Link from 'next/link';

// Mock data for trades
const mockTrades = [
  { 
    id: '1', 
    symbol: 'AAPL', 
    type: 'BUY', 
    entryPrice: 182.63, 
    exitPrice: 189.97,
    quantity: 50,
    entryDate: '2025-02-15',
    exitDate: '2025-03-01',
    pnl: 366.83,
    pnlPercentage: 4.02,
    status: 'CLOSED'
  },
  { 
    id: '2', 
    symbol: 'MSFT', 
    type: 'BUY', 
    entryPrice: 412.78, 
    exitPrice: 425.22,
    quantity: 25,
    entryDate: '2025-02-20',
    exitDate: '2025-03-05',
    pnl: 311.00,
    pnlPercentage: 3.01,
    status: 'CLOSED'
  },
  { 
    id: '3', 
    symbol: 'NVDA', 
    type: 'SELL', 
    entryPrice: 882.35, 
    exitPrice: 845.60,
    quantity: 15,
    entryDate: '2025-02-28',
    exitDate: '2025-03-10',
    pnl: 551.25,
    pnlPercentage: 4.17,
    status: 'CLOSED'
  },
  { 
    id: '4', 
    symbol: 'TSLA', 
    type: 'BUY', 
    entryPrice: 176.54, 
    exitPrice: null,
    quantity: 40,
    entryDate: '2025-03-15',
    exitDate: null,
    pnl: null,
    pnlPercentage: null,
    status: 'OPEN'
  },
  { 
    id: '5', 
    symbol: 'AMZN', 
    type: 'BUY', 
    entryPrice: 178.75, 
    exitPrice: null,
    quantity: 30,
    entryDate: '2025-03-18',
    exitDate: null,
    pnl: null,
    pnlPercentage: null,
    status: 'OPEN'
  }
];

// Filter options
type FilterOption = 'ALL' | 'OPEN' | 'CLOSED';
type SortOption = 'DATE_DESC' | 'DATE_ASC' | 'PNL_DESC' | 'PNL_ASC' | 'SYMBOL_ASC';

const TradesDashboard: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<FilterOption>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('DATE_DESC');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter and sort trades
  const filteredTrades = mockTrades
    .filter(trade => {
      // Filter by status
      if (filterStatus !== 'ALL' && trade.status !== filterStatus) {
        return false;
      }
      
      // Filter by search term
      if (searchTerm && !trade.symbol.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'DATE_DESC':
          return new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime();
        case 'DATE_ASC':
          return new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime();
        case 'PNL_DESC':
          if (a.pnl === null) return 1;
          if (b.pnl === null) return -1;
          return b.pnl - a.pnl;
        case 'PNL_ASC':
          if (a.pnl === null) return 1;
          if (b.pnl === null) return -1;
          return a.pnl - b.pnl;
        case 'SYMBOL_ASC':
          return a.symbol.localeCompare(b.symbol);
        default:
          return 0;
      }
    });

  // Calculate total statistics
  const totalPnL = mockTrades
    .filter(trade => trade.pnl !== null)
    .reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  
  const winningTrades = mockTrades
    .filter(trade => trade.pnl !== null && trade.pnl > 0).length;
  
  const totalClosedTrades = mockTrades
    .filter(trade => trade.status === 'CLOSED').length;
  
  const winRate = totalClosedTrades > 0
    ? (winningTrades / totalClosedTrades * 100).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">TradeTracker</h1>
          <div className="flex space-x-4 items-center">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              New Trade
            </button>
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
              <span className="text-white font-medium">JD</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <h3 className="text-gray-400 text-sm font-medium mb-1">Total P&L</h3>
            <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${totalPnL.toFixed(2)}
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <h3 className="text-gray-400 text-sm font-medium mb-1">Win Rate</h3>
            <p className="text-2xl font-bold text-indigo-400">{winRate}%</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <h3 className="text-gray-400 text-sm font-medium mb-1">Open Positions</h3>
            <p className="text-2xl font-bold text-white">
              {mockTrades.filter(trade => trade.status === 'OPEN').length}
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <h3 className="text-gray-400 text-sm font-medium mb-1">Closed Trades</h3>
            <p className="text-2xl font-bold text-white">{totalClosedTrades}</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex space-x-2">
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  filterStatus === 'ALL' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                All Trades
              </button>
              <button
                onClick={() => setFilterStatus('OPEN')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  filterStatus === 'OPEN' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Open Positions
              </button>
              <button
                onClick={() => setFilterStatus('CLOSED')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  filterStatus === 'CLOSED' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Closed Trades
              </button>
            </div>
            
            <div className="flex space-x-2">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search by symbol..."
                  className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
              >
                <option value="DATE_DESC">Newest First</option>
                <option value="DATE_ASC">Oldest First</option>
                <option value="PNL_DESC">Highest P&L</option>
                <option value="PNL_ASC">Lowest P&L</option>
                <option value="SYMBOL_ASC">Symbol (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Trades Table */}
        <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Symbol</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Entry Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Entry Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Exit Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Exit Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">P&L</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredTrades.length > 0 ? (
                  filteredTrades.map((trade) => (
                    <tr key={trade.id} className="hover:bg-gray-750">
                      <td className="px-4 py-3 text-sm font-medium">{trade.symbol}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          trade.type === 'BUY' 
                            ? 'bg-green-900 text-green-300' 
                            : 'bg-red-900 text-red-300'
                        }`}>
                          {trade.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">{trade.entryDate}</td>
                      <td className="px-4 py-3 text-sm">${trade.entryPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{trade.exitDate || '-'}</td>
                      <td className="px-4 py-3 text-sm">{trade.exitPrice ? `$${trade.exitPrice.toFixed(2)}` : '-'}</td>
                      <td className="px-4 py-3 text-sm">{trade.quantity}</td>
                      <td className="px-4 py-3 text-sm">
                        {trade.pnl !== null ? (
                          <div>
                            <span className={trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}>
                              ${trade.pnl.toFixed(2)}
                            </span>
                            <span className={`block text-xs ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {trade.pnl >= 0 ? '+' : ''}{trade.pnlPercentage}%
                            </span>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          trade.status === 'OPEN' 
                            ? 'bg-blue-900 text-blue-300' 
                            : 'bg-gray-600 text-gray-300'
                        }`}>
                          {trade.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex space-x-2">
                          <button className="text-indigo-400 hover:text-indigo-300">
                            View
                          </button>
                          {trade.status === 'OPEN' && (
                            <button className="text-green-500 hover:text-green-400">
                              Close
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="px-4 py-6 text-center text-sm text-gray-400">
                      No trades found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TradesDashboard;