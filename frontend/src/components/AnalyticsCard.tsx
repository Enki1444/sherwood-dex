import { useState } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockData = [
  { name: 'ETH/TREES', tvl: '125,420', volume: '45,230', apy: '24.5' },
  { name: 'ETH/USDC', tvl: '89,120', volume: '32,100', apy: '18.2' },
  { name: 'TREES/USDC', tvl: '67,890', volume: '21,450', apy: '15.8' },
];

const chartData = [
  { day: 'Mon', volume: 45000 },
  { day: 'Tue', volume: 52000 },
  { day: 'Wed', volume: 48000 },
  { day: 'Thu', volume: 61000 },
  { day: 'Fri', volume: 55000 },
  { day: 'Sat', volume: 67000 },
  { day: 'Sun', volume: 72000 },
];

export function AnalyticsCard() {
  const [selectedPair, setSelectedPair] = useState(mockData[0]);

  return (
    <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl p-6 border border-emerald-500/20 shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Analytics</h2>
        <BarChart3 className="w-6 h-6 text-emerald-400" />
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-gray-400 text-sm">Total TVL</span>
          </div>
          <div className="text-2xl font-bold text-white">$282,430</div>
          <div className="text-emerald-400 text-sm">+12.5%</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-gray-400 text-sm">24h Volume</span>
          </div>
          <div className="text-2xl font-bold text-white">$98,780</div>
          <div className="text-emerald-400 text-sm">+8.2%</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span className="text-gray-400 text-sm">LPs</span>
          </div>
          <div className="text-2xl font-bold text-white">1,234</div>
          <div className="text-emerald-400 text-sm">+42 today</div>
        </div>
      </div>

      {/* Volume Chart */}
      <div className="bg-gray-800 rounded-xl p-4 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Weekly Volume</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #10B981',
                  borderRadius: '8px' 
                }}
              />
              <Bar dataKey="volume" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pairs Table */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Top Pairs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-gray-400 text-sm border-b border-gray-700">
                <th className="text-left p-4">Pair</th>
                <th className="text-right p-4">TVL</th>
                <th className="text-right p-4">24h Volume</th>
                <th className="text-right p-4">APY</th>
              </tr>
            </thead>
            <tbody>
              {mockData.map((pair) => (
                <tr 
                  key={pair.name}
                  onClick={() => setSelectedPair(pair)}
                  className={`cursor-pointer transition-colors ${
                    selectedPair.name === pair.name 
                      ? 'bg-emerald-500/10' 
                      : 'hover:bg-gray-700'
                  }`}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600" />
                      <span className="font-medium text-white">{pair.name}</span>
                    </div>
                  </td>
                  <td className="text-right p-4 text-white">${pair.tvl}</td>
                  <td className="text-right p-4 text-white">${pair.volume}</td>
                  <td className="text-right p-4 text-emerald-400">{pair.apy}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
