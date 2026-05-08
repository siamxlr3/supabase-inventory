'use client';

import React from 'react';
import { Input, Button, Select } from '@/components/ui';
import { Search, Filter, Calendar, X } from 'lucide-react';

interface SupplierFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
  fromDate: string;
  setFromDate: (val: string) => void;
  toDate: string;
  setToDate: (val: string) => void;
  onClear: () => void;
}

export const SupplierFilters: React.FC<SupplierFiltersProps> = ({
  search, setSearch,
  status, setStatus,
  fromDate, setFromDate,
  toDate, setToDate,
  onClear
}) => {
  return (
    <div className="flex flex-col lg:flex-row items-end gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mb-8">
      <div className="flex-1 w-full">
        <Input 
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="h-4 w-4 text-gray-400" />}
          className="w-full"
        />
      </div>
      
      <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
        <div className="flex flex-col gap-1.5 min-w-[140px]">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Status</span>
          <select 
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-10 rounded-xl border border-gray-100 bg-gray-50/50 px-3 text-xs font-bold text-gray-700 focus:border-indigo-500 focus:outline-none transition-all"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">From</span>
          <input 
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="h-10 rounded-xl border border-gray-100 bg-gray-50/50 px-3 text-xs font-bold text-gray-700 focus:border-indigo-500 focus:outline-none transition-all"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">To</span>
          <input 
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="h-10 rounded-xl border border-gray-100 bg-gray-50/50 px-3 text-xs font-bold text-gray-700 focus:border-indigo-500 focus:outline-none transition-all"
          />
        </div>
      </div>
    </div>
  );
};
