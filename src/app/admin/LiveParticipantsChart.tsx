'use client';
import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const initialData = Array.from({ length: 20 }, (_, i) => ({
  time: `${i}:00`,
  participants: Math.floor(Math.random() * 800) + 1200,
}));

export default function LiveParticipantsChart() {
  const [data, setData] = useState(initialData);

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        const newData = [...prev.slice(1)];
        const last = prev[prev.length - 1].participants;
        newData.push({
          time: `${new Date().getMinutes()}:${new Date().getSeconds()}`,
          participants: Math.max(800, Math.min(3200, last + (Math.random() * 400 - 200))),
        });
        return newData;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-96 w-full -mx-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="lightNeon" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" stroke="#D1D5DB" fontSize={12} />
          <YAxis stroke="#D1D5DB" fontSize={12} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#FFFFFF', 
              border: '1px solid #E5E7EB', 
              borderRadius: '12px',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
            }} 
          />
          <Area type="natural" dataKey="participants" stroke="#14B8A6" strokeWidth={4} fill="url(#lightNeon)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}