// components/student/RecentAnnouncements.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Bell, Megaphone, Calendar, X, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'event';
  createdAt: Date;
  expiresAt?: Date;
  link?: string;
}

interface RecentAnnouncementsProps {
  announcements: Announcement[];
}

export function RecentAnnouncements({ announcements }: RecentAnnouncementsProps) {
  const [dismissed, setDismissed] = useState<string[]>([]);

  const activeAnnouncements = announcements.filter(a => !dismissed.includes(a.id));

  if (activeAnnouncements.length === 0) return null;

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'event':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <Megaphone className="h-5 w-5 text-yellow-600" />;
      case 'success':
        return <Bell className="h-5 w-5 text-green-600" />;
      case 'event':
        return <Calendar className="h-5 w-5 text-purple-600" />;
      default:
        return <Bell className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <div className="mb-6 space-y-3">
      {activeAnnouncements.map((announcement) => (
        <Card key={announcement.id} className={`border ${getTypeStyles(announcement.type)}`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {getIcon(announcement.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{announcement.title}</h3>
                    <p className="text-sm mt-1 opacity-90">{announcement.content}</p>
                  </div>
                  <button
                    onClick={() => setDismissed([...dismissed, announcement.id])}
                    className="p-1 hover:bg-black hover:bg-opacity-10 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs opacity-75">
                    {new Date(announcement.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  
                  {announcement.link && (
                    <Button variant="link" size="sm" className="p-0 h-auto text-xs font-medium" asChild>
                      <Link href={announcement.link}>
                        Learn more
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}