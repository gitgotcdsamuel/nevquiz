// app/admin/settings/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

import { 
  Settings, Shield, Bell, Globe, Database, Lock, Server, 
  RefreshCw, AlertTriangle, Save 
} from 'lucide-react';

import { saveSettings, refreshSystemStatus, createBackup, purgeAuditLogs, factoryReset } from './actions';

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-10">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-10 flex items-end justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white shadow-sm border border-zinc-200 rounded-2xl">
                  <Settings className="h-8 w-8 text-violet-600" />
                </div>
                <div>
                  <h1 className="text-4xl font-semibold tracking-tight">Settings</h1>
                  <p className="mt-1 text-zinc-500 text-lg">
                    Configure your platform securely and efficiently
                  </p>
                </div>
              </div>
            </div>

            <form action={saveSettings} className="space-y-8">
              <Tabs defaultValue="security" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-white border border-zinc-200 shadow-sm mb-8">
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="system">System</TabsTrigger>
                </TabsList>

                {/* Security Tab */}
                <TabsContent value="security">
                  <Card className="border-zinc-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <Shield className="h-6 w-6 text-emerald-600" />
                        Security Settings
                      </CardTitle>
                      <CardDescription>Protect your platform with advanced access controls</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8 pt-2">
                      <div className="flex items-center justify-between py-4 border-b border-zinc-100">
                        <div>
                          <h3 className="font-medium">Two-Factor Authentication</h3>
                          <p className="text-sm text-zinc-500">Require 2FA for all admin and user accounts</p>
                        </div>
                        <Switch name="twoFactor" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between py-4 border-b border-zinc-100">
                        <div>
                          <h3 className="font-medium">Strong Password Policy</h3>
                          <p className="text-sm text-zinc-500">Enforce minimum 12 characters with complexity rules</p>
                        </div>
                        <Switch name="strongPassword" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between py-4 border-b border-zinc-100">
                        <div>
                          <h3 className="font-medium">Session Timeout</h3>
                          <p className="text-sm text-zinc-500">Automatically log out inactive users</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Select name="sessionTimeout" defaultValue="30">
                            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="15">15 min</SelectItem>
                              <SelectItem value="30">30 min</SelectItem>
                              <SelectItem value="60">1 hour</SelectItem>
                              <SelectItem value="240">4 hours</SelectItem>
                            </SelectContent>
                          </Select>
                          <Switch name="sessionEnabled" defaultChecked />
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-4">
                        <div>
                          <h3 className="font-medium">IP Whitelisting</h3>
                          <p className="text-sm text-zinc-500">Restrict access to trusted IP ranges</p>
                        </div>
                        <Switch name="ipWhitelist" />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications">
                  <Card className="border-zinc-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <Bell className="h-6 w-6 text-amber-600" />
                        Notification Preferences
                      </CardTitle>
                      <CardDescription>Control how and when the system alerts you</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8 pt-2">
                      {[
                        { name: "emailNotifications", title: "Email Notifications", desc: "System events and critical alerts", default: true },
                        { name: "examAlerts", title: "Exam Activity Alerts", desc: "Real-time notifications for exam sessions", default: true },
                        { name: "securityAlerts", title: "Security Incidents", desc: "Immediate alerts on suspicious activity", default: true },
                        { name: "performanceReports", title: "Performance Reports", desc: "Weekly system health summaries", default: false },
                      ].map((item) => (
                        <div key={item.name} className="flex items-center justify-between py-4 border-b border-zinc-100 last:border-0">
                          <div>
                            <h3 className="font-medium">{item.title}</h3>
                            <p className="text-sm text-zinc-500">{item.desc}</p>
                          </div>
                          <Switch name={item.name} defaultChecked={item.default} />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* General Tab */}
                <TabsContent value="general">
                  <Card className="border-zinc-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <Globe className="h-6 w-6 text-sky-600" />
                        General Configuration
                      </CardTitle>
                      <CardDescription>Platform branding and regional settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-zinc-600">Platform Name</label>
                          <Input name="platformName" defaultValue="Secure Exam Platform" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-zinc-600">Support Email</label>
                          <Input name="supportEmail" type="email" defaultValue="admin@secureexam.com" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-zinc-600">Time Zone</label>
                          <Select name="timeZone" defaultValue="UTC">
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="UTC">UTC</SelectItem>
                              <SelectItem value="EST">EST</SelectItem>
                              <SelectItem value="CST">CST</SelectItem>
                              <SelectItem value="PST">PST</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-zinc-600">Date Format</label>
                          <Select name="dateFormat" defaultValue="DD/MM/YYYY">
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* System Tab */}
                <TabsContent value="system" className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* System Status */}
                    <Card className="border-zinc-200 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                          <Database className="h-6 w-6 text-emerald-600" />
                          System Status
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {[
                          { label: "Database", status: "Online", color: "emerald" },
                          { label: "API Server", status: "Online", color: "emerald" },
                          { label: "Storage", status: "68% used", color: "sky" },
                          { label: "Memory Usage", status: "74%", color: "amber" },
                        ].map((item, i) => (
                          <div key={i} className="flex justify-between items-center py-3 border-b border-zinc-100 last:border-0">
                            <div className="flex items-center gap-3 text-zinc-700">
                              <Server className="h-5 w-5 text-zinc-400" />
                              {item.label}
                            </div>
                            <Badge className={`bg-${item.color}-100 text-${item.color}-700 border-${item.color}-200`}>
                              {item.status}
                            </Badge>
                          </div>
                        ))}

                        <Button formAction={refreshSystemStatus} type="submit" variant="outline" className="w-full gap-2">
                          <RefreshCw className="h-4 w-4" />
                          Refresh Status
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Data Management */}
                    <Card className="border-zinc-200 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-rose-600">
                          <Lock className="h-6 w-6" />
                          Data Management
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button formAction={createBackup} type="submit" variant="outline" className="w-full justify-start">
                          Create Full Backup
                        </Button>

                        <Button formAction={purgeAuditLogs} type="submit" variant="outline" className="w-full justify-start text-rose-600 hover:bg-rose-50">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Purge Old Audit Logs
                        </Button>

                        <Button formAction={factoryReset} type="submit" variant="outline" className="w-full justify-start text-rose-600 hover:bg-rose-50">
                          Factory Reset (Danger)
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Main Save Button */}
              <div className="flex justify-end pt-6">
                <Button type="submit" size="lg" className="bg-violet-600 hover:bg-violet-700 text-white flex items-center gap-2 px-10">
                  <Save className="h-4 w-4" />
                  Save All Settings
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}