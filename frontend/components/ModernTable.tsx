"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Search, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";

interface Column<T> {
  header: string;
  accessorKey: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  sortable?: boolean;
}

interface ModernTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  searchPlaceholder?: string;
  emptyMessage?: string;
}

export default function ModernTable<T>({
  data,
  columns,
  keyField,
  isLoading = false,
  onRowClick,
  searchPlaceholder = "Search...",
  emptyMessage = "No data found",
}: ModernTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });

  // Filter data
  const filteredData = data.filter((row) => {
    // Convert row to a record type for safe property iteration
    const rowRecord = row as Record<string, unknown>;
    const rowValues = Object.values(rowRecord);
    return rowValues.some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue === bValue) return 0;
    
    const comparison = aValue > bValue ? 1 : -1;
    return sortConfig.direction === "asc" ? comparison : -comparison;
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSort = (column: Column<T>) => {
    if (!column.sortable || typeof column.accessorKey !== 'string') return;

    const key = column.accessorKey as keyof T;
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
        />
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50 border-b border-slate-800">
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className={cn(
                      "px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider",
                      column.sortable && "cursor-pointer hover:text-slate-200 transition-colors",
                      column.className
                    )}
                    onClick={() => handleSort(column)}
                  >
                    <div className="flex items-center gap-2">
                      {column.header}
                      {column.sortable && (
                        <ArrowUpDown className="h-3 w-3 text-slate-600" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                 // Loading skeleton
                 Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                        {columns.map((_, j) => (
                            <td key={j} className="px-6 py-4">
                                <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                            </td>
                        ))}
                    </tr>
                 ))
              ) : paginatedData.length > 0 ? (
                paginatedData.map((row) => (
                  <tr
                    key={String(row[keyField])}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={cn(
                      "hover:bg-slate-800/50 transition-colors duration-150",
                      onRowClick && "cursor-pointer",
                      "group"
                    )}
                  >
                    {columns.map((column, index) => (
                      <td
                        key={index}
                        className={cn("px-6 py-4 text-sm text-slate-300 align-middle", column.className)}
                      >
                         {typeof column.accessorKey === 'function' 
                            ? column.accessorKey(row) 
                            : (row[column.accessorKey] as React.ReactNode)}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-900">
            <p className="text-sm text-slate-500">
              Showing <span className="font-medium text-slate-300">{(currentPage - 1) * rowsPerPage + 1}</span> to{" "}
              <span className="font-medium text-slate-300">
                {Math.min(currentPage * rowsPerPage, sortedData.length)}
              </span>{" "}
              of <span className="font-medium text-slate-300">{sortedData.length}</span> results
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-1">
                 {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Simple pagination logic for now (showing first 5 or centered around current)
                    // For simplicity, just showing 1..5 or limited range could be complex.
                    // Let's just show current page number and total.
                    return null; 
                 })}
                 <span className="text-sm text-slate-400">
                    Page {currentPage} of {totalPages}
                 </span>
              </div>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
