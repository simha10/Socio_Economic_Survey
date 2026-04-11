"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
} from "lucide-react";

interface Column<T> {
  header: string;
  accessorKey: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  sortable?: boolean;
  sortAccessor?: keyof T | ((row: T) => string | number); // Separate accessor for sorting
}

interface ModernTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  searchPlaceholder?: string;
  emptyMessage?: string;
  rowsPerPageOptions?: number[];
  showSerialNumber?: boolean;
}

export default function ModernTable<T>({
  data,
  columns,
  keyField,
  isLoading = false,
  onRowClick,
  searchPlaceholder = "Search...",
  emptyMessage = "No data found",
  rowsPerPageOptions = [10, 25, 50],
  showSerialNumber = true,
}: ModernTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });

  // Filter data
  const filteredData = data.filter((row) => {
    if (!searchTerm.trim()) return true;

    const query = searchTerm.toLowerCase();

    // Check all column values (including function-based accessors)
    return columns.some((column) => {
      let value: any;

      // Get the value using accessorKey
      if (typeof column.accessorKey === "function") {
        value = column.accessorKey(row);
        // If it's a React element, we can't search it, so skip
        if (React.isValidElement(value)) return false;
      } else {
        value = row[column.accessorKey];
      }

      // Convert to string and check if it includes the search term
      return String(value).toLowerCase().includes(query);
    });
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue: any;
    let bValue: any;

    // Check if this is a custom sort key (starts with __sort_)
    if (String(sortConfig.key).startsWith("__sort_")) {
      // Find the column by matching the header name
      const headerName = String(sortConfig.key).replace("__sort_", "");
      const sortColumn = columns.find((col) => col.header === headerName);

      if (sortColumn && sortColumn.sortAccessor) {
        // Use custom sort accessor
        if (typeof sortColumn.sortAccessor === "function") {
          aValue = sortColumn.sortAccessor(a);
          bValue = sortColumn.sortAccessor(b);
        } else {
          aValue = a[sortColumn.sortAccessor];
          bValue = b[sortColumn.sortAccessor];
        }
      } else {
        console.warn(
          "Sort column not found or missing sortAccessor for:",
          headerName,
        );
        return 0; // Can't sort without proper accessor
      }
    } else {
      // Regular string-based accessorKey
      aValue = a[sortConfig.key];
      bValue = b[sortConfig.key];
    }

    if (aValue === bValue) return 0;

    // Handle mixed string/numeric values
    const aStr = String(aValue);
    const bStr = String(bValue);
    const aNum = parseFloat(aStr);
    const bNum = parseFloat(bStr);

    // If both can be converted to numbers, sort numerically
    if (!isNaN(aNum) && !isNaN(bNum)) {
      const comparison = aNum > bNum ? 1 : -1;
      return sortConfig.direction === "asc" ? comparison : -comparison;
    }

    // Otherwise, sort as strings
    const comparison = aStr > bStr ? 1 : -1;
    return sortConfig.direction === "asc" ? comparison : -comparison;
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const handleSort = (column: Column<T>) => {
    if (!column.sortable) return;

    // Determine the key to use for sorting
    let sortKey: string;

    if (column.sortAccessor) {
      // If there's a custom sort accessor, use a special key based on header
      sortKey = `__sort_${column.header}`;
    } else if (typeof column.accessorKey === "string") {
      sortKey = column.accessorKey;
    } else {
      // Can't sort function-based accessors without sortAccessor
      console.warn("Cannot sort column without sortAccessor:", column.header);
      return;
    }

    setSortConfig((current) => ({
      key: sortKey as any,
      direction:
        current.key === sortKey && current.direction === "asc" ? "desc" : "asc",
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
        <div className="overflow-x-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50 border-b border-slate-800">
                {showSerialNumber && (
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    #
                  </th>
                )}
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className={cn(
                      "px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider wrap-break-word",
                      column.sortable &&
                        "cursor-pointer hover:text-slate-200 transition-colors",
                      column.className,
                    )}
                    onClick={() => handleSort(column)}
                  >
                    <div className="flex items-center gap-1">
                      {column.header}
                      {column.sortable && (
                        <ArrowUpDown className="h-3 w-3 text-slate-600 shrink-0" />
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
                    {showSerialNumber && (
                      <td className="px-6 py-4">
                        <div className="h-4 bg-slate-800 rounded w-8"></div>
                      </td>
                    )}
                    {columns.map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginatedData.length > 0 ? (
                paginatedData.map((row, index) => {
                  const serialNumber =
                    (currentPage - 1) * rowsPerPage + index + 1;
                  return (
                    <tr
                      key={String(row[keyField])}
                      onClick={() => onRowClick && onRowClick(row)}
                      className={cn(
                        "hover:bg-slate-800/50 transition-colors duration-150",
                        onRowClick && "cursor-pointer",
                        "group",
                      )}
                    >
                      {showSerialNumber && (
                        <td className="px-6 py-4 text-sm text-slate-400 font-medium">
                          {serialNumber}
                        </td>
                      )}
                      {columns.map((column, colIndex) => (
                        <td
                          key={colIndex}
                          className={cn(
                            "px-4 py-3 text-sm text-slate-300 align-middle wrap-break-word",
                            column.className,
                          )}
                        >
                          {typeof column.accessorKey === "function"
                            ? column.accessorKey(row)
                            : (row[column.accessorKey] as React.ReactNode)}
                        </td>
                      ))}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={columns.length + (showSerialNumber ? 1 : 0)}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {/* First Page Button */}
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="First Page"
              >
                <ChevronsLeft size={16} />
              </button>
              {/* Previous Page Button */}
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-slate-300 font-medium">
                Page {currentPage} of{" "}
                {totalPages || Math.ceil(data.length / rowsPerPage) || 1}
              </span>
              {/* Next Page Button */}
              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(
                      totalPages || Math.ceil(data.length / rowsPerPage) || 1,
                      prev + 1,
                    ),
                  )
                }
                disabled={
                  currentPage ===
                  (totalPages || Math.ceil(data.length / rowsPerPage) || 1)
                }
                className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Next Page"
              >
                <ChevronRight size={16} />
              </button>
              {/* Last Page Button */}
              <button
                onClick={() =>
                  setCurrentPage(
                    totalPages || Math.ceil(data.length / rowsPerPage) || 1,
                  )
                }
                disabled={
                  currentPage ===
                  (totalPages || Math.ceil(data.length / rowsPerPage) || 1)
                }
                className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Last Page"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                {rowsPerPageOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
