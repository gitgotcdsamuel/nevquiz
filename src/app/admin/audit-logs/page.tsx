'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, Filter, Download, Clock, User, Shield, AlertCircle, CheckCircle, MoreVertical, RefreshCw 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

type Log = {
  id: number | string;
  timestamp: string;
  user: string;
  action: string;
  description: string;
  ip: string;
  status: 'success' | 'failed' | 'warning';
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
};

interface AdminAuditLogsPageProps {
  initialLogs?: Log[];
  isDemoUser: boolean;
}

// Helper to format numbers
const formatNumber = (num: number): string => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
};

// Generate mock logs for demo mode
const generateMockLogs = (): Log[] => {
  const users = [
    { name: 'john.doe@example.com', role: 'Admin' },
    { name: 'jane.smith@example.com', role: 'Super Admin' },
    { name: 'mike.wilson@example.com', role: 'Moderator' },
    { name: 'sarah.johnson@example.com', role: 'Admin' },
    { name: 'robert.brown@example.com', role: 'User' },
    { name: 'emily.davis@example.com', role: 'Admin' },
    { name: 'david.miller@example.com', role: 'User' },
    { name: 'lisa.wilson@example.com', role: 'Moderator' },
  ];

  const actions = [
    { action: 'user.login', description: 'User logged in successfully', status: 'success' as const, severity: 'low' as const },
    { action: 'user.logout', description: 'User logged out', status: 'success' as const, severity: 'low' as const },
    { action: 'exam.create', description: 'Created new exam: "Final Examination 2024"', status: 'success' as const, severity: 'medium' as const },
    { action: 'exam.update', description: 'Updated exam settings and duration', status: 'success' as const, severity: 'medium' as const },
    { action: 'exam.delete', description: 'Deleted exam: "Practice Test v1"', status: 'success' as const, severity: 'high' as const },
    { action: 'user.create', description: 'Created new user account: new.student@example.com', status: 'success' as const, severity: 'medium' as const },
    { action: 'user.update', description: 'Updated user permissions and role', status: 'success' as const, severity: 'medium' as const },
    { action: 'user.delete', description: 'Deleted user account: inactive.user@example.com', status: 'success' as const, severity: 'high' as const },
    { action: 'exam.publish', description: 'Published exam to all students', status: 'success' as const, severity: 'high' as const },
    { action: 'exam.grade', description: 'Graded student submissions', status: 'success' as const, severity: 'medium' as const },
    { action: 'settings.update', description: 'Updated system configuration', status: 'success' as const, severity: 'medium' as const },
    { action: 'user.login.failed', description: 'Failed login attempt - invalid credentials', status: 'failed' as const, severity: 'medium' as const },
    { action: 'user.unauthorized', description: 'Unauthorized access attempt to admin panel', status: 'failed' as const, severity: 'high' as const },
    { action: 'exam.submit.failed', description: 'Student failed to submit exam due to network error', status: 'warning' as const, severity: 'low' as const },
    { action: 'system.timeout', description: 'System timeout detected during peak load', status: 'warning' as const, severity: 'medium' as const },
    { action: 'security.bruteforce', description: 'Multiple failed login attempts detected', status: 'failed' as const, severity: 'critical' as const },
    { action: 'data.export', description: 'Exported audit logs and user data', status: 'success' as const, severity: 'medium' as const },
    { action: 'exam.review', description: 'Started exam review process', status: 'success' as const, severity: 'low' as const },
    { action: 'backup.created', description: 'System backup created successfully', status: 'success' as const, severity: 'low' as const },
    { action: 'backup.failed', description: 'Scheduled backup failed due to storage limit', status: 'failed' as const, severity: 'high' as const },
  ];

  const ips = [
    '192.168.1.1', '10.0.0.1', '172.16.0.1', '192.168.1.100', '10.0.0.50',
    '203.0.113.1', '198.51.100.1', '192.168.1.55', '10.0.0.25', '172.31.0.1'
  ];

  const logs: Log[] = [];
  const now = new Date();
  
  for (let i = 0; i < 150; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    const randomIP = ips[Math.floor(Math.random() * ips.length)];
    
    const daysAgo = Math.floor(Math.random() * 30);
    const hoursAgo = Math.floor(Math.random() * 24);
    const minutesAgo = Math.floor(Math.random() * 60);
    const timestamp = new Date(now);
    timestamp.setDate(now.getDate() - daysAgo);
    timestamp.setHours(now.getHours() - hoursAgo);
    timestamp.setMinutes(now.getMinutes() - minutesAgo);
    
    let severity = randomAction.severity;
    if (randomAction.status === 'failed' && Math.random() > 0.7) {
      severity = 'high';
    }
    if (randomAction.action.includes('security') || randomAction.action.includes('unauthorized')) {
      severity = 'critical';
    }
    
    logs.push({
      id: i + 1,
      timestamp: timestamp.toISOString(),
      user: randomUser.name,
      action: randomAction.action,
      description: randomAction.description,
      ip: randomIP,
      status: randomAction.status,
      severity: severity,
    });
  }
  
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// API service for real logs
const auditLogAPI = {
  async getLogs(params?: any) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params?.severity && params.severity !== 'all') queryParams.append('severity', params.severity);
    
    const url = `/api/admin/audit-logs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch audit logs');
    }
    return response.json();
  },
  
  async exportLogs(params?: any) {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params?.severity && params.severity !== 'all') queryParams.append('severity', params.severity);
    queryParams.append('export', 'true');
    
    const url = `/api/admin/audit-logs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to export audit logs');
    return response.blob();
  }
};

export default function AdminAuditLogsPage({ initialLogs, isDemoUser: initialIsDemoUser }: AdminAuditLogsPageProps) {
  const { data: session } = useSession();
  
  // Determine if user is demo based on session or prop
  const isDemoUser = useMemo(() => {
    // If explicitly passed as demo user
    if (initialIsDemoUser) return true;
    // Check if no session
    if (!session?.user?.email) return true;
    // Check if demo email
    if (session.user.email === 'demo@example.com' || session.user.email?.includes('demo')) return true;
    // Otherwise real user
    return false;
  }, [session, initialIsDemoUser]);
  
  const [logs, setLogs] = useState<Log[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed' | 'warning'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [darkMode, setDarkMode] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [apiError, setApiError] = useState<string | null>(null);
  const pageSize = 10;

  // Fetch real logs from API for non-demo users
  const fetchRealLogs = useCallback(async (isRefreshing = false) => {
    if (isDemoUser) {
      // Demo user - use mock data
      setLogs(generateMockLogs());
      setTotalCount(generateMockLogs().length);
      setLoading(false);
      setApiError(null);
      return;
    }
    
    if (!isRefreshing) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    
    setApiError(null);
    
    try {
      const result = await auditLogAPI.getLogs({
        page,
        limit: pageSize,
        search: search || undefined,
        status: statusFilter,
        severity: severityFilter,
      });
      
      // Handle different response formats
      if (result.logs && Array.isArray(result.logs)) {
        setLogs(result.logs);
        setTotalCount(result.total || result.logs.length);
      } else if (result.data && Array.isArray(result.data)) {
        setLogs(result.data);
        setTotalCount(result.total || result.data.length);
      } else if (Array.isArray(result)) {
        setLogs(result);
        setTotalCount(result.length);
      } else {
        // If API returns unexpected format, show empty state
        console.warn('Unexpected API response format:', result);
        setLogs([]);
        setTotalCount(0);
        setApiError('Received unexpected data format from server');
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      setApiError(error instanceof Error ? error.message : 'Failed to fetch audit logs');
      setLogs([]);
      setTotalCount(0);
      
      // Show toast notification for real users
      if (!isRefreshing) {
        toast.error('Failed to load audit logs. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isDemoUser, page, search, statusFilter, severityFilter, pageSize]);

  // Initialize logs based on demo mode
  useEffect(() => {
    fetchRealLogs();
  }, [fetchRealLogs]);

  // Refetch when filters change
  useEffect(() => {
    if (!isDemoUser) {
      setPage(1); // Reset to first page when filters change
      fetchRealLogs();
    }
  }, [search, statusFilter, severityFilter, isDemoUser]);

  // Refetch when page changes
  useEffect(() => {
    if (!isDemoUser && page > 1) {
      fetchRealLogs();
    }
  }, [page, isDemoUser]);

  // Set up real-time polling for real users (every 30 seconds)
  useEffect(() => {
    if (isDemoUser) return;
    
    const interval = setInterval(() => {
      fetchRealLogs(true);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [isDemoUser, fetchRealLogs]);

  // Persist dark mode
  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved) setDarkMode(saved === 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Filtered logs for demo mode (for real users, logs are already filtered by API)
  const filteredLogs = useMemo(() => {
    if (isDemoUser) {
      let result = logs;
      
      if (search.trim()) {
        const term = search.toLowerCase();
        result = result.filter(log =>
          log.user.toLowerCase().includes(term) ||
          log.action.toLowerCase().includes(term) ||
          log.description.toLowerCase().includes(term) ||
          log.ip.includes(term)
        );
      }
      
      if (statusFilter !== 'all') {
        result = result.filter(log => log.status === statusFilter);
      }
      
      if (severityFilter !== 'all') {
        result = result.filter(log => log.severity === severityFilter);
      }
      
      return result;
    }
    
    return logs;
  }, [logs, search, statusFilter, severityFilter, isDemoUser]);

  // Pagination for demo mode only (real users use API pagination)
  const paginatedLogs = useMemo(() => {
    if (isDemoUser) {
      const start = (page - 1) * pageSize;
      return filteredLogs.slice(start, start + pageSize);
    }
    return filteredLogs;
  }, [filteredLogs, page, isDemoUser, pageSize]);

  const totalPages = isDemoUser 
    ? Math.ceil(filteredLogs.length / pageSize)
    : Math.ceil(totalCount / pageSize);

  const handleExport = async () => {
    if (isDemoUser) {
      if (filteredLogs.length === 0) {
        toast.error('No logs to export');
        return;
      }
      
      const headers = ['ID', 'Timestamp', 'User', 'Action', 'Description', 'IP', 'Status', 'Severity'];
      const rows = filteredLogs.map(log => [
        log.id,
        log.timestamp,
        `"${log.user}"`,
        log.action,
        `"${log.description}"`,
        log.ip,
        log.status,
        log.severity
      ]);
      
      const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Logs exported successfully');
    } else {
      try {
        const blob = await auditLogAPI.exportLogs({
          search: search || undefined,
          status: statusFilter,
          severity: severityFilter,
        });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('Logs exported successfully');
      } catch (error) {
        console.error('Failed to export logs:', error);
        toast.error('Failed to export logs. Please try again.');
      }
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success': return 'bg-emerald-100 text-emerald-800';
      case 'failed': return 'bg-rose-100 text-rose-800';
      case 'warning': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRefresh = () => {
    if (!isDemoUser) {
      fetchRealLogs(true);
      toast.info('Refreshing audit logs...');
    }
  };

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300",
      darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
    )}>
      <Navbar />
      <div className="flex">
        <Sidebar role="ADMIN" />

        <main className="flex-1 p-6 md:p-8 lg:p-10">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Audit Logs {isDemoUser && '(Demo Mode)'}
                </h1>
                <p className="mt-2 text-slate-500">
                  {isDemoUser 
                    ? 'Demo mode - Viewing simulated activity data' 
                    : 'Real-time system activity and security monitoring'}
                </p>
                {!isDemoUser && lastUpdated && (
                  <p className="text-xs text-slate-400 mt-1">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4">
                {!isDemoUser && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="rounded-full"
                  >
                    <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setDarkMode(!darkMode)}
                  className="rounded-full"
                >
                  {darkMode ? '☀️' : '🌙'}
                </Button>
                <Button onClick={handleExport} className="gap-2">
                  <Download className="h-4 w-4" />
                  Export Logs
                </Button>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by user, action, or description..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    if (!isDemoUser) setPage(1);
                  }}
                  className="pl-10 bg-white border-slate-200 focus:border-blue-400"
                />
              </div>

              <div className="flex gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2 bg-white">
                      <Filter className="h-4 w-4" />
                      Status: {statusFilter === 'all' ? 'All' : statusFilter}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setStatusFilter('all'); if (!isDemoUser) setPage(1); }}>All</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setStatusFilter('success'); if (!isDemoUser) setPage(1); }}>Success</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setStatusFilter('failed'); if (!isDemoUser) setPage(1); }}>Failed</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setStatusFilter('warning'); if (!isDemoUser) setPage(1); }}>Warning</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2 bg-white">
                      <AlertCircle className="h-4 w-4" />
                      Severity: {severityFilter === 'all' ? 'All' : severityFilter}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setSeverityFilter('all'); if (!isDemoUser) setPage(1); }}>All</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setSeverityFilter('low'); if (!isDemoUser) setPage(1); }}>Low</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setSeverityFilter('medium'); if (!isDemoUser) setPage(1); }}>Medium</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setSeverityFilter('high'); if (!isDemoUser) setPage(1); }}>High</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setSeverityFilter('critical'); if (!isDemoUser) setPage(1); }}>Critical</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Error Alert */}
            {apiError && !isDemoUser && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  <p className="text-sm font-medium">{apiError}</p>
                </div>
                <button 
                  onClick={() => fetchRealLogs()}
                  className="text-sm text-red-600 hover:text-red-800 mt-2"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-blue-700">Total Logs</p>
                      <p className="text-3xl font-bold mt-2 text-blue-900">
                        {loading ? '...' : formatNumber(isDemoUser ? filteredLogs.length : totalCount)}
                      </p>
                    </div>
                    <Shield className="h-10 w-10 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-emerald-700">Successful</p>
                      <p className="text-3xl font-bold mt-2 text-emerald-900">
                        {loading ? '...' : formatNumber(logs.filter(l => l.status === 'success').length)}
                      </p>
                    </div>
                    <CheckCircle className="h-10 w-10 text-emerald-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-rose-50 to-rose-100 border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-rose-700">Failed / Alerts</p>
                      <p className="text-3xl font-bold mt-2 text-rose-900">
                        {loading ? '...' : formatNumber(logs.filter(l => l.status === 'failed').length)}
                      </p>
                    </div>
                    <AlertCircle className="h-10 w-10 text-rose-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-purple-700">Critical Events</p>
                      <p className="text-3xl font-bold mt-2 text-purple-900">
                        {loading ? '...' : formatNumber(logs.filter(l => l.severity === 'critical').length)}
                      </p>
                    </div>
                    <AlertCircle className="h-10 w-10 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Logs Table */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="pb-0 border-b border-slate-100">
                <CardTitle className="text-xl flex items-center justify-between">
                  Recent Activity
                  <span className="text-sm font-normal text-slate-500">
                    {loading ? 'Loading...' : `Showing ${paginatedLogs.length} of ${isDemoUser ? filteredLogs.length : totalCount} logs`}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {loading ? (
                  <div className="text-center py-16">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-slate-500">Loading audit logs...</p>
                  </div>
                ) : paginatedLogs.length === 0 ? (
                  <div className="text-center py-16 text-slate-500">
                    <Shield className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p>No logs match your filters</p>
                    {(search || statusFilter !== 'all' || severityFilter !== 'all') && (
                      <Button 
                        variant="link" 
                        onClick={() => {
                          setSearch('');
                          setStatusFilter('all');
                          setSeverityFilter('all');
                        }}
                        className="mt-2"
                      >
                        Clear all filters
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paginatedLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 group"
                      >
                        <div className="flex items-start gap-4 flex-1">
                          <div className={cn(
                            "p-3 rounded-lg",
                            log.status === 'success' ? "bg-emerald-100" : "bg-rose-100"
                          )}>
                            {log.status === 'success' ? (
                              <CheckCircle className="h-6 w-6 text-emerald-600" />
                            ) : (
                              <AlertCircle className="h-6 w-6 text-rose-600" />
                            )}
                          </div>

                          <div className="space-y-1">
                            <p className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                              {log.description}
                            </p>
                            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500">
                              <span className="flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5" />
                                {log.user}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                {formatTimestamp(log.timestamp)}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Shield className="h-3.5 w-3.5" />
                                {log.ip}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mt-4 sm:mt-0">
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "px-3 py-1 text-xs font-medium",
                              log.severity === 'critical' && "border-rose-500 text-rose-700 bg-rose-50",
                              log.severity === 'high' && "border-rose-400 text-rose-700 bg-rose-50",
                              log.severity === 'medium' && "border-amber-500 text-amber-700 bg-amber-50",
                              log.severity === 'low' && "border-emerald-500 text-emerald-700 bg-emerald-50"
                            )}
                          >
                            {(log.severity || 'unknown').toUpperCase()}
                          </Badge>

                          <Badge className={cn("px-3 py-1 text-xs font-medium", getStatusBadge(log.status))}>
                            {(log.status || 'unknown').toUpperCase()}
                          </Badge>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Mark as Reviewed</DropdownMenuItem>
                              <DropdownMenuItem className="text-rose-600">
                                Flag for Investigation
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && !loading && (
                  <div className="flex justify-center items-center gap-4 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1 || loading}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-slate-600">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === totalPages || loading}
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}