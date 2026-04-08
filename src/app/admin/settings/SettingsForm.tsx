'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

import { 
  Shield, Bell, Globe, Database, Lock, Server, RefreshCw, AlertTriangle, Save 
} from 'lucide-react';

import { updateSettings, refreshSystemStatus, createBackup, purgeAuditLogs, factoryReset } from './actions';

export default function SettingsForm() {
  const [isPending, startTransition] = useTransition();

  const [status, setStatus] = useState({
    database: 'Online',
    apiServer: 'Online',
    storage: '68% used',
    memory: '74%',
  });

  const [formData, setFormData] = useState({
    platformName: 'Secure Exam Platform',
    supportEmail: 'admin@secureexam.com',
    timeZone: 'UTC',
    dateFormat: 'DD/MM/YYYY',
    twoFactor: true,
    strongPassword: true,
    sessionTimeout: '30',
    emailNotifications: true,
    examAlerts: true,
    securityAlerts: true,
    performanceReports: false,
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const fd = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      fd.append(key, String(value));
    });

    startTransition(async () => {
      const result = await updateSettings(fd);
      if (result.success) {
        toast.success(result.message || 'Settings saved successfully!');
      } else {
        toast.error('Failed to save settings. Please check your inputs.');
      }
    });
  };

  const handleRefreshStatus = () => {
    startTransition(async () => {
      const newStatus = await refreshSystemStatus();
      setStatus(newStatus);
      toast.success('System status refreshed');
    });
  };

  return (
    <Tabs defaultValue="security" className="w-full">
      {/* SINGLE CLEAN TAB BAR - No duplicate */}
      <TabsList className="grid w-full grid-cols-4 bg-white border border-zinc-200 shadow-sm mb-8">
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="system">System</TabsTrigger>
      </TabsList>

      {/* ==================== SECURITY TAB ==================== */}
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
              <Switch 
                checked={formData.twoFactor} 
                onCheckedChange={(v) => handleInputChange('twoFactor', v)} 
              />
            </div>

            <div className="flex items-center justify-between py-4 border-b border-zinc-100">
              <div>
                <h3 className="font-medium">Strong Password Policy</h3>
                <p className="text-sm text-zinc-500">Enforce minimum 12 characters with complexity rules</p>
              </div>
              <Switch 
                checked={formData.strongPassword} 
                onCheckedChange={(v) => handleInputChange('strongPassword', v)} 
              />
            </div>

            <div className="flex items-center justify-between py-4 border-b border-zinc-100">
              <div>
                <h3 className="font-medium">Session Timeout</h3>
                <p className="text-sm text-zinc-500">Automatically log out inactive users</p>
              </div>
              <div className="flex items-center gap-3">
                <Select 
                  value={formData.sessionTimeout} 
                  onValueChange={(v) => handleInputChange('sessionTimeout', v)}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="240">4 hours</SelectItem>
                  </SelectContent>
                </Select>
                <Switch checked={true} onCheckedChange={() => {}} />
              </div>
            </div>

            <div className="flex items-center justify-between py-4">
              <div>
                <h3 className="font-medium">IP Whitelisting</h3>
                <p className="text-sm text-zinc-500">Restrict access to trusted IP ranges</p>
              </div>
              <Switch checked={false} onCheckedChange={() => {}} />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* ==================== NOTIFICATIONS TAB ==================== */}
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
              { key: 'emailNotifications', title: "Email Notifications", desc: "System events and critical alerts" },
              { key: 'examAlerts', title: "Exam Activity Alerts", desc: "Real-time notifications for exam sessions" },
              { key: 'securityAlerts', title: "Security Incidents", desc: "Immediate alerts on suspicious activity" },
              { key: 'performanceReports', title: "Performance Reports", desc: "Weekly system health summaries" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-4 border-b border-zinc-100 last:border-0">
                <div>
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-zinc-500">{item.desc}</p>
                </div>
                <Switch 
                  checked={formData[item.key as keyof typeof formData] as boolean} 
                  onCheckedChange={(v) => handleInputChange(item.key, v)} 
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      {/* ==================== GENERAL TAB ==================== */}
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
                <Input 
                  value={formData.platformName}
                  onChange={(e) => handleInputChange('platformName', e.target.value)}
                  className="focus:border-violet-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-600">Support Email</label>
                <Input 
                  type="email"
                  value={formData.supportEmail}
                  onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                  className="focus:border-violet-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-600">Time Zone</label>
                <Select value={formData.timeZone} onValueChange={(v) => handleInputChange('timeZone', v)}>
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
                <Select value={formData.dateFormat} onValueChange={(v) => handleInputChange('dateFormat', v)}>
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

      {/* ==================== SYSTEM TAB ==================== */}
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
                { label: "Database", status: status.database, color: "emerald" },
                { label: "API Server", status: status.apiServer, color: "emerald" },
                { label: "Storage", status: status.storage, color: "sky" },
                { label: "Memory Usage", status: status.memory, color: "amber" },
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

              <Button 
                onClick={handleRefreshStatus} 
                disabled={isPending} 
                variant="outline" 
                className="w-full gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
                Check System Health
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
              <Button 
                onClick={() => startTransition(async () => {
                  const res = await createBackup();
                  toast.success(res.message || 'Backup created');
                })} 
                variant="outline" 
                className="w-full justify-start"
              >
                Create Full Backup
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-rose-600 hover:bg-rose-50">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Purge Old Audit Logs
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Action</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete old audit logs. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => startTransition(async () => {
                        const res = await purgeAuditLogs();
                        toast.success(res.message);
                      })}
                    >
                      Purge Logs
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-rose-600 hover:bg-rose-50">
                    Factory Reset (Danger)
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Factory Reset</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will reset the entire system to default settings. All data will be lost. Are you absolutely sure?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => startTransition(async () => {
                        const res = await factoryReset();
                        toast.success(res.message);
                      })}
                    >
                      Reset System
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Floating Action Bar */}
      <div className="fixed bottom-8 right-8 flex gap-3 z-50">
        <Button 
          variant="outline" 
          size="lg" 
          onClick={() => window.location.reload()}
          className="shadow-md"
        >
          Discard Changes
        </Button>
        <Button 
          size="lg" 
          onClick={handleSave} 
          disabled={isPending}
          className="bg-violet-600 hover:bg-violet-700 text-white shadow-md flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isPending ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>
    </Tabs>
  );
}