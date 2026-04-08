'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { X } from 'lucide-react';

interface Filters {
  department?: string;
  program?: string;
  semester?: string;
  minScore?: string;
  maxScore?: string;
  examType?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface MoreFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: Filters) => void;
  currentFilters: Filters;
}

export function MoreFiltersModal({
  isOpen,
  onClose,
  onApply,
  currentFilters
}: MoreFiltersModalProps) {
  const [filters, setFilters] = useState<Filters>(currentFilters);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApply(filters);
  };

  const handleClear = () => {
    setFilters({});
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">More Filters</h3>
              <button
                type="button"
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={filters.department || ''}
                  onChange={(e) => setFilters({...filters, department: e.target.value})}
                  placeholder="e.g., Computer Science"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="program">Program</Label>
                <Input
                  id="program"
                  value={filters.program || ''}
                  onChange={(e) => setFilters({...filters, program: e.target.value})}
                  placeholder="e.g., BSCS"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="semester">Semester</Label>
                <select
                  id="semester"
                  value={filters.semester || ''}
                  onChange={(e) => setFilters({...filters, semester: e.target.value})}
                  className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="">All Semesters</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="examType">Exam Type</Label>
                <Input
                  id="examType"
                  value={filters.examType || ''}
                  onChange={(e) => setFilters({...filters, examType: e.target.value})}
                  placeholder="e.g., Final, Quiz"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="minScore">Minimum Score (%)</Label>
                <Input
                  id="minScore"
                  type="number"
                  min="0"
                  max="100"
                  value={filters.minScore || ''}
                  onChange={(e) => setFilters({...filters, minScore: e.target.value})}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="maxScore">Maximum Score (%)</Label>
                <Input
                  id="maxScore"
                  type="number"
                  min="0"
                  max="100"
                  value={filters.maxScore || ''}
                  onChange={(e) => setFilters({...filters, maxScore: e.target.value})}
                  placeholder="100"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="dateFrom">From Date</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="dateTo">To Date</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="flex justify-between gap-3 mt-6 pt-6 border-t">
              <div>
                <Button type="button" variant="outline" onClick={handleClear}>
                  Clear All
                </Button>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}