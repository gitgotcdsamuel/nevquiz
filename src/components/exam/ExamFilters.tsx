// components/exams/ExamFilters.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

type FilterType = 'ALL' | 'ACTIVE' | 'UPCOMING' | 'COMPLETED' | 'DRAFT';

interface ExamFiltersProps {
  currentFilter: FilterType;
}

export function ExamFilters({ currentFilter }: ExamFiltersProps) {
  const router = useRouter();

  const filters: { label: string; value: FilterType }[] = [
    { label: 'All Exams', value: 'ALL' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Upcoming', value: 'UPCOMING' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Drafts', value: 'DRAFT' },
  ];

  const handleFilterChange = (filter: FilterType) => {
    router.push(`/lecturer/exams?filter=${filter}`);
  };

  return (
    <div className="mb-6 flex flex-wrap gap-3">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant={currentFilter === filter.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilterChange(filter.value)}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}