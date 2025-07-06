
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Zap, Clock, Activity } from 'lucide-react';

export const UsageAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalRequests: 0,
    avgResponseTime: 0,
    modelUsage: [],
    platformUsage: [],
    hourlyUsage: []
  });

  useEffect(() => {
    // Load analytics from localStorage or API
    const mockData = {
      totalRequests: 1247,
      avgResponseTime: 1.8,
      modelUsage: [
        { name: 'Yeti-Core', usage: 45, color: '#3b82f6' },
        { name: 'Yeti-Local', usage: 25, color: '#10b981' },
        { name: 'Groq', usage: 15, color: '#f59e0b' },
        { name: 'Claude-3.5', usage: 10, color: '#ef4444' },
        { name: 'Perplexity', usage: 5, color: '#8b5cf6' }
      ],
      platformUsage: [
        { name: 'GitHub', requests: 89, success: 95 },
        { name: 'Gmail', requests: 67, success: 98 },
        { name: 'Slack', requests: 45, success: 92 },
        { name: 'Twitter', requests: 23, success: 88 }
      ],
      hourlyUsage: [
        { hour: '00', requests: 12 },
        { hour: '06', requests: 45 },
        { hour: '12', requests: 89 },
        { hour: '18', requests: 67 },
        { hour: '23', requests: 34 }
      ]
    };
    setAnalytics(mockData);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Usage Analytics</h2>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold">{analytics.totalRequests.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold">{analytics.avgResponseTime}s</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Models</p>
                <p className="text-2xl font-bold">{analytics.modelUsage.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Model Usage Distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Model Usage Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.modelUsage}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="usage"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {analytics.modelUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hourly Usage Pattern</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.hourlyUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="requests" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Platform Integration Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Integration Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.platformUsage.map((platform) => (
              <div key={platform.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">{platform.name}</p>
                    <p className="text-sm text-gray-600">{platform.requests} requests</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32">
                    <Progress value={platform.success} className="h-2" />
                  </div>
                  <Badge variant={platform.success > 90 ? "default" : "secondary"}>
                    {platform.success}% success
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
