// app/student/settings/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import {
  User,
  Mail,
  Lock,
  Moon,
  Sun,
  Camera,
  Save,
  Eye,
  EyeOff,
  Shield,
  Smartphone,
  Monitor,
  Palette,
  Languages,
  Volume2,
  LogOut,
  CheckCircle,
  XCircle,
  Download,
  Trash2,
  HelpCircle,
  Upload,
  Loader2
} from 'lucide-react';
import Image from 'next/image';

interface UserProfile {
  name: string;
  email: string;
  studentId: string;
  department: string;
  semester: number;
  phone: string;
  avatar?: string;
  dateOfBirth: string;
  address: string;
  bio?: string;
}

interface PrivacySettings {
  showProfileToClassmates: boolean;
  showResultsPublicly: boolean;
  shareActivity: boolean;
}

export default function StudentSettingsPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Language state
  const [language, setLanguage] = useState('en');

  // Profile state
  const [profile, setProfile] = useState<UserProfile>({
    name: session?.user?.name || 'John Student',
    email: session?.user?.email || 'john.student@university.edu',
    studentId: 'STU2024001',
    department: 'Computer Science',
    semester: 3,
    phone: '+1 234 567 8900',
    dateOfBirth: '2000-01-15',
    address: '123 University Ave, Campus Town, ST 12345',
    bio: 'Computer Science student passionate about software development and artificial intelligence.'
  });

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    showProfileToClassmates: true,
    showResultsPublicly: false,
    shareActivity: true
  });

  // Password state
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [passwordErrors, setPasswordErrors] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  // Load saved preferences from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    const savedPrivacy = localStorage.getItem('privacySettings');
    const savedAvatar = localStorage.getItem('userAvatar');

    if (savedLanguage) setLanguage(savedLanguage);
    if (savedPrivacy) setPrivacySettings(JSON.parse(savedPrivacy));
    if (savedAvatar && !profile.avatar) setProfile(prev => ({ ...prev, avatar: savedAvatar }));
  }, []);

  // Handle avatar upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setSaveError('Please upload an image file (JPEG, PNG, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setSaveError('Image size must be less than 5MB');
      return;
    }

    setUploadingAvatar(true);
    setSaveError('');

    try {
      // Convert to base64 for preview (in real app, upload to server/cloud storage)
      const reader = new FileReader();
      
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });

      const base64 = await base64Promise;
      
      // Simulate API call to upload avatar
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update profile with new avatar
      setProfile(prev => ({ ...prev, avatar: base64 }));
      localStorage.setItem('userAvatar', base64);
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Avatar upload failed:', error);
      setSaveError('Failed to upload avatar. Please try again.');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Remove avatar
  const handleRemoveAvatar = async () => {
    if (window.confirm('Are you sure you want to remove your profile picture?')) {
      setProfile(prev => ({ ...prev, avatar: undefined }));
      localStorage.removeItem('userAvatar');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleProfileUpdate = async () => {
    setIsSaving(true);
    setSaveError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update session if name or email changed
      if (profile.name !== session?.user?.name || profile.email !== session?.user?.email) {
        await update({
          ...session,
          user: {
            ...session?.user,
            name: profile.name,
            email: profile.email
          }
        });
      }
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      setSaveError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const validatePassword = () => {
    const errors = {
      current: '',
      new: '',
      confirm: ''
    };

    if (!passwordData.current) {
      errors.current = 'Current password is required';
    }

    if (!passwordData.new) {
      errors.new = 'New password is required';
    } else if (passwordData.new.length < 8) {
      errors.new = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(passwordData.new)) {
      errors.new = 'Password must contain at least one uppercase letter';
    } else if (!/[0-9]/.test(passwordData.new)) {
      errors.new = 'Password must contain at least one number';
    } else if (!/[!@#$%^&*]/.test(passwordData.new)) {
      errors.new = 'Password must contain at least one special character';
    }

    if (passwordData.new !== passwordData.confirm) {
      errors.confirm = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return Object.values(errors).every(error => !error);
  };

  const handlePasswordChange = async () => {
    if (validatePassword()) {
      setIsSaving(true);
      setSaveError('');
      
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setSaveSuccess(true);
        setPasswordData({ current: '', new: '', confirm: '' });
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (error) {
        setSaveError('Failed to update password. Please try again.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handlePrivacyChange = async (key: keyof PrivacySettings, value: boolean) => {
    const updated = { ...privacySettings, [key]: value };
    setPrivacySettings(updated);
    localStorage.setItem('privacySettings', JSON.stringify(updated));
    
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      console.log('Account deletion requested');
    }
  };

  const handleExportData = async () => {
    const data = {
      profile,
      privacySettings,
      createdAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'privacy', label: 'Privacy', icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="flex">
        <Sidebar role="STUDENT" />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="mt-2 text-gray-600">
                Manage your account settings and preferences
              </p>
            </div>

            {/* Success/Error Messages */}
            {saveSuccess && (
              <Alert variant="success" className="mb-6">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Changes saved successfully!
                </div>
              </Alert>
            )}
            
            {saveError && (
              <Alert variant="danger" className="mb-6">
                <div className="flex items-center">
                  <XCircle className="h-5 w-5 mr-2" />
                  {saveError}
                </div>
              </Alert>
            )}

            <div className="flex flex-col md:flex-row gap-6">
              {/* Sidebar Tabs */}
              <div className="w-full md:w-64 flex-shrink-0">
                <Card>
                  <CardContent className="p-4">
                    <nav className="space-y-1">
                      {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                              activeTab === tab.id
                                ? 'bg-primary-50 text-primary-700'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <Icon className="h-5 w-5 mr-3" />
                            {tab.label}
                          </button>
                        );
                      })}
                    </nav>

                    <div className="mt-6 pt-6 border-t space-y-2">
                      <button
                        onClick={handleExportData}
                        className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                      >
                        <Download className="h-5 w-5 mr-3" />
                        Export Data
                      </button>
                      <button
                        onClick={() => window.open('/help', '_blank')}
                        className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                      >
                        <HelpCircle className="h-5 w-5 mr-3" />
                        Help & Support
                      </button>
                      <button
                        onClick={() => signOut({ callbackUrl: '/auth/login' })}
                        className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <LogOut className="h-5 w-5 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content */}
              <div className="flex-1">
                {activeTab === 'profile' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Avatar Upload - Enhanced Version */}
                        <div className="flex items-start gap-6">
                          <div className="relative group">
                            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden">
                              {profile.avatar ? (
                                <Image
                                  src={profile.avatar}
                                  alt={profile.name}
                                  width={96}
                                  height={96}
                                  className="rounded-full object-cover w-full h-full"
                                />
                              ) : (
                                <User className="h-12 w-12 text-primary-600" />
                              )}
                            </div>
                            
                            {/* Upload Overlay */}
                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                                disabled={uploadingAvatar}
                              >
                                {uploadingAvatar ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Camera className="h-4 w-4 text-gray-700" />
                                )}
                              </button>
                            </div>
                            
                            {/* Hidden File Input */}
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarUpload}
                              className="hidden"
                            />
                          </div>
                          
                          <div>
                            <h3 className="font-medium text-gray-900">{profile.name}</h3>
                            <p className="text-sm text-gray-600">{profile.studentId}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {profile.department} • Semester {profile.semester}
                            </p>
                            <div className="flex gap-2 mt-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingAvatar}
                              >
                                <Upload className="h-3 w-3 mr-1" />
                                Upload
                              </Button>
                              {profile.avatar && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleRemoveAvatar}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Remove
                                </Button>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              JPEG, PNG, or GIF. Max size 5MB.
                            </p>
                          </div>
                        </div>

                        {/* Profile Form */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Full Name
                            </label>
                            <Input
                              value={profile.name}
                              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email
                            </label>
                            <Input
                              type="email"
                              value={profile.email}
                              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Phone Number
                            </label>
                            <Input
                              value={profile.phone}
                              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Date of Birth
                            </label>
                            <Input
                              type="date"
                              value={profile.dateOfBirth}
                              onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Bio
                            </label>
                            <textarea
                              value={profile.bio}
                              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                              placeholder="Tell us about yourself..."
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Address
                            </label>
                            <Input
                              value={profile.address}
                              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button onClick={handleProfileUpdate} isLoading={isSaving}>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'security' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Security Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Change Password */}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                          <div className="space-y-4">
                            <div className="relative">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Current Password
                              </label>
                              <div className="relative">
                                <input
                                  type={showPassword ? 'text' : 'password'}
                                  value={passwordData.current}
                                  onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                >
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                              {passwordErrors.current && (
                                <p className="text-sm text-red-600 mt-1">{passwordErrors.current}</p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                New Password
                              </label>
                              <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={passwordData.new}
                                onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                              />
                              {passwordErrors.new && (
                                <p className="text-sm text-red-600 mt-1">{passwordErrors.new}</p>
                              )}
                            </div>

                            <div className="relative">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm New Password
                              </label>
                              <div className="relative">
                                <input
                                  type={showConfirmPassword ? 'text' : 'password'}
                                  value={passwordData.confirm}
                                  onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                >
                                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                              {passwordErrors.confirm && (
                                <p className="text-sm text-red-600 mt-1">{passwordErrors.confirm}</p>
                              )}
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                              <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
                              <ul className="space-y-1 text-sm">
                                <li className="flex items-center text-gray-600">
                                  {passwordData.new.length >= 8 ? (
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-gray-400 mr-2" />
                                  )}
                                  At least 8 characters
                                </li>
                                <li className="flex items-center text-gray-600">
                                  {/[A-Z]/.test(passwordData.new) ? (
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-gray-400 mr-2" />
                                  )}
                                  Contains uppercase letter
                                </li>
                                <li className="flex items-center text-gray-600">
                                  {/[0-9]/.test(passwordData.new) ? (
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-gray-400 mr-2" />
                                  )}
                                  Contains number
                                </li>
                                <li className="flex items-center text-gray-600">
                                  {/[!@#$%^&*]/.test(passwordData.new) ? (
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-gray-400 mr-2" />
                                  )}
                                  Contains special character
                                </li>
                              </ul>
                            </div>

                            <div className="flex justify-end">
                              <Button onClick={handlePasswordChange} isLoading={isSaving}>
                                Update Password
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Two-Factor Authentication */}
                        <div className="pt-6 border-t">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                              <p className="text-sm text-gray-600 mt-1">
                                Add an extra layer of security to your account
                              </p>
                            </div>
                            <Button variant="outline">Enable</Button>
                          </div>
                        </div>

                        {/* Active Sessions */}
                        <div className="pt-6 border-t">
                          <h3 className="font-medium text-gray-900 mb-4">Active Sessions</h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center">
                                <Monitor className="h-5 w-5 text-gray-400 mr-3" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">Current Session</p>
                                  <p className="text-xs text-gray-500">Chrome on Windows • Last active now</p>
                                </div>
                              </div>
                              <Badge className="bg-green-100 text-green-800">Active</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center">
                                <Smartphone className="h-5 w-5 text-gray-400 mr-3" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">iPhone 13</p>
                                  <p className="text-xs text-gray-500">Safari • Last active 2 days ago</p>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm">Sign Out</Button>
                            </div>
                          </div>
                        </div>

                        {/* Delete Account */}
                        <div className="pt-6 border-t">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium text-red-600">Delete Account</h3>
                              <p className="text-sm text-gray-600 mt-1">
                                Permanently delete your account and all associated data
                              </p>
                            </div>
                            <Button variant="danger" onClick={handleDeleteAccount}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Account
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'privacy' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Privacy Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="space-y-4">
                          {/* Profile Visibility */}
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <h3 className="font-medium text-gray-900">Profile Visibility</h3>
                              <p className="text-sm text-gray-600 mt-1">
                                Allow classmates to view your profile
                              </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={privacySettings.showProfileToClassmates}
                                onChange={(e) => handlePrivacyChange('showProfileToClassmates', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                          </div>

                          {/* Public Results */}
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <h3 className="font-medium text-gray-900">Public Results</h3>
                              <p className="text-sm text-gray-600 mt-1">
                                Show your exam results on public leaderboards
                              </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={privacySettings.showResultsPublicly}
                                onChange={(e) => handlePrivacyChange('showResultsPublicly', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                          </div>

                          {/* Share Activity */}
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <h3 className="font-medium text-gray-900">Share Activity</h3>
                              <p className="text-sm text-gray-600 mt-1">
                                Share your learning activity with classmates
                              </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={privacySettings.shareActivity}
                                onChange={(e) => handlePrivacyChange('shareActivity', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                          </div>
                        </div>

                        {/* Data Export */}
                        <div className="pt-4 border-t">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium text-gray-900">Export Your Data</h3>
                              <p className="text-sm text-gray-600 mt-1">
                                Download a copy of your personal data
                              </p>
                            </div>
                            <Button variant="outline" onClick={handleExportData}>
                              <Download className="h-4 w-4 mr-2" />
                              Export Data
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}