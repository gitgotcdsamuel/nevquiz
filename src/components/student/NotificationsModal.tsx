// components/student/NotificationsModal.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link'; // Add this import
import { Button } from '@/components/ui/Button';
import { Bell, X, CheckCircle, AlertCircle, Info, Calendar, ChevronRight } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'event';
  createdAt: Date;
  priority: 'high' | 'medium' | 'low';
}

interface NotificationsModalProps {
  announcements: Announcement[];
}

export function NotificationsModal({ announcements }: NotificationsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dismissed, setDismissed] = useState<string[]>([]);

  const activeAnnouncements = announcements.filter(a => !dismissed.includes(a.id));
  const unreadCount = activeAnnouncements.length;

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'event':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'event':
        return <Calendar className="h-5 w-5 text-purple-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">High</span>;
      case 'medium':
        return <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">Medium</span>;
      default:
        return <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-800 rounded-full">Low</span>;
    }
  };

  const dismissAll = () => {
    setDismissed(announcements.map(a => a.id));
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-end z-50">
          <div className="bg-white w-full max-w-md h-full overflow-y-auto animate-slide-left">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {unreadCount} unread • {announcements.length} total
                </p>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={dismissAll}>
                    Dismiss all
                  </Button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {activeAnnouncements.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                  <p className="text-gray-500">No new notifications</p>
                </div>
              ) : (
                activeAnnouncements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className={`p-4 rounded-lg border ${getTypeStyles(announcement.type)} relative group`}
                  >
                    <button
                      onClick={() => setDismissed([...dismissed, announcement.id])}
                      className="absolute top-2 right-2 p-1 hover:bg-black hover:bg-opacity-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>

                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {getIcon(announcement.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                          {getPriorityBadge(announcement.priority)}
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{announcement.content}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {formatDate(announcement.createdAt)}
                          </span>
                          <Button variant="link" size="sm" className="p-0 h-auto text-xs">
                            View details
                            <ChevronRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t px-6 py-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/student/notifications">View all notifications</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}