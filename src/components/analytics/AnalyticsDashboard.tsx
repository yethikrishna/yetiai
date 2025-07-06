
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import { 
  Brain, Zap, Shield, Users, TrendingUp, Activity, 
  Clock, AlertTriangle, CheckCircle, XCircle 
} from 'lucide-react';
import { advancedAnalytics } from '@/lib/analytics/AdvancedAnalytics';
import { securityMonitor } from '@/lib/security/SecurityMonitor';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function AnalyticsDashboard() {
  const [realtimeMetrics, setRealtimeMetrics] = useState<any>({});
  const [modelMetrics, setModelMetrics] = useState<any[]>([]);
  const [platformMetrics, setPlatformMetrics] = useState<any[]>([]);
  const [securityMetrics, setSecurityMetrics] = useState<any>({});
  const [userInsights, setUserInsights] = useState<any[]>([]);

  useEffect(() => {
    const updateMetrics = () => {
      setRealtimeMetrics(advancedAnalytics.getRealtimeMetrics());
      setModelMetrics(advancedAnalytics.getModelPerformanceMetrics());
      setPlatformMetrics(advancedAnalytics.getPlatformUsageMetrics());
      setSecurityMetrics(securityMonitor.getSecurityMetrics());
      setUserInsights(advancedAnalytics.getUserBehaviorInsights());
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const MetricCard = ({ title, value, icon: Icon, trend, color = "blue" }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}-600`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground">
            {trend > 0 ? '+' : ''}{trend}% from last period
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">🧊 Yeti Analytics Dashboard</h1>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-muted-foreground">Live</span>
          </div>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Events (24h)"
          value={realtimeMetrics.totalEvents || 0}
          icon={Activity}
          color="blue"
        />
        <MetricCard
          title="AI Requests"
          value={realtimeMetrics.aiRequests || 0}
          icon={Brain}
          color="purple"
        />
        <MetricCard
          title="Platform Actions"
          value={realtimeMetrics.platformActions || 0}
          icon={Zap}
          color="green"
        />
        <MetricCard
          title="Success Rate"
          value={`${((realtimeMetrics.successRate || 0) * 100).toFixed(1)}%`}
          icon={CheckCircle}
          color="emerald"
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="models">AI Models</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
                <CardDescription>Real-time system activity</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={[]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="events" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>System performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Response Time</span>
                    <span>{(realtimeMetrics.averageResponseTime || 0).toFixed(0)}ms</span>
                  </div>
                  <Progress value={Math.min((realtimeMetrics.averageResponseTime || 0) / 10, 100)} className="mt-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Security Score</span>
                    <span>{securityMetrics.securityScore || 0}/100</span>
                  </div>
                  <Progress value={securityMetrics.securityScore || 0} className="mt-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>System Health</span>
                    <span>95%</span>
                  </div>
                  <Progress value={95} className="mt-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Model Performance</CardTitle>
              <CardDescription>Comparative analysis of AI model usage and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={modelMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="modelName" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="totalRequests" fill="#8884d8" name="Total Requests" />
                  <Bar dataKey="successfulRequests" fill="#82ca9d" name="Successful Requests" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modelMetrics.map((model, index) => (
              <Card key={model.modelName}>
                <CardHeader>
                  <CardTitle className="text-lg">{model.modelName}</CardTitle>
                  <CardDescription>Model Performance Metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Success Rate:</span>
                    <Badge variant="outline">
                      {((model.successfulRequests / model.totalRequests) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Response Time:</span>
                    <span className="text-sm">{model.averageResponseTime?.toFixed(0)}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Cost Estimate:</span>
                    <span className="text-sm">${model.costEstimate?.toFixed(4)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Usage Distribution</CardTitle>
              <CardDescription>Usage statistics across connected platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={platformMetrics}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ platformId, percent }) => `${platformId} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="totalActions"
                  >
                    {platformMetrics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {platformMetrics.map((platform) => (
              <Card key={platform.platformId}>
                <CardHeader>
                  <CardTitle className="capitalize">{platform.platformId}</CardTitle>
                  <CardDescription>Platform Activity Summary</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Actions:</span>
                    <span className="font-medium">{platform.totalActions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Success Rate:</span>
                    <Badge variant={platform.errorRate < 0.1 ? "default" : "destructive"}>
                      {((1 - platform.errorRate) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Execution Time:</span>
                    <span className="text-sm">{platform.averageExecutionTime?.toFixed(0)}ms</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Security Score"
              value={`${securityMetrics.securityScore || 0}/100`}
              icon={Shield}
              color="green"
            />
            <MetricCard
              title="Active Threats"
              value={securityMetrics.activeThreats || 0}
              icon={AlertTriangle}
              color="red"
            />
            <MetricCard
              title="Total Threats (24h)"
              value={securityMetrics.totalThreats || 0}
              icon={XCircle}
              color="orange"
            />
            <MetricCard
              title="Response Time"
              value={`${(securityMetrics.averageResponseTime || 0).toFixed(0)}ms`}
              icon={Clock}
              color="blue"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Security Events by Type</CardTitle>
              <CardDescription>Distribution of security events in the last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(securityMetrics.threatsByType || {}).map(([type, count]) => ({ type, count }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ff6b6b" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Behavior Insights</CardTitle>
              <CardDescription>Understanding user engagement and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userInsights.slice(0, 5).map((user, index) => (
                  <div key={user.userId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">User {user.userId.substring(0, 8)}...</div>
                      <div className="text-sm text-muted-foreground">
                        {user.totalSessions} sessions • {user.expertiseLevel} level
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-sm">
                        Avg Session: {user.averageSessionDuration?.toFixed(1)}min
                      </div>
                      <div className="flex gap-1">
                        {user.preferredAIModels?.slice(0, 2).map((model: string) => (
                          <Badge key={model} variant="outline" className="text-xs">
                            {model}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
