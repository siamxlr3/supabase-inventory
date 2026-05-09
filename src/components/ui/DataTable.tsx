'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { SearchInput } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface Column<T> {
  key: string;
  header: string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  actions?: React.ReactNode;
  filters?: React.ReactNode;
  isLoading?: boolean;
  emptyMessage?: string;
  emptyState?: React.ReactNode;
  className?: string;
  expandableRow?: (row: T) => React.ReactNode;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  actions,
  filters,
  isLoading,
  emptyMessage = 'No data found',
  emptyState,
  className,
  expandableRow,
}: DataTableProps<T>) {
  const [expandedRows, setExpandedRows] = React.useState<Record<number, boolean>>({});

  const toggleRow = (index: number) => {
    setExpandedRows(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 shadow-sm', className)}>
      {/* Toolbar */}
      {(onSearchChange || actions || filters) && (
        <div className="px-4 py-3 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3 flex-1">
            {onSearchChange && (
              <div className="w-full sm:w-72">
                <SearchInput
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                />
              </div>
            )}
            {filters}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100">
              {expandableRow && <th className="w-10 bg-gray-50/50" />}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50',
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {expandableRow && <td className="px-4 py-3"><div className="h-4 w-4 bg-gray-100 rounded animate-pulse" /></td>}
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (expandableRow ? 1 : 0)} className="px-4 py-12 text-center text-gray-400 text-sm">
                  {emptyState || emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <React.Fragment key={i}>
                  <tr 
                    className={cn(
                      "hover:bg-gray-50/50 transition-colors cursor-pointer",
                      expandedRows[i] && "bg-gray-50/30"
                    )}
                    onClick={() => expandableRow && toggleRow(i)}
                  >
                    {expandableRow && (
                      <td className="px-4 py-3 text-gray-400">
                        {expandedRows[i] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className={cn('px-4 py-3 text-sm text-gray-700', col.className)}>
                        {col.cell ? col.cell(row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                  {expandableRow && expandedRows[i] && (
                    <tr>
                      <td colSpan={columns.length + 1} className="px-4 py-0 border-t-0">
                        <div className="py-4 animate-in slide-in-from-top-2 duration-200">
                          {expandableRow(row)}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {onPageChange && totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Page {currentPage} of {totalPages}
          </p>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  );
}
