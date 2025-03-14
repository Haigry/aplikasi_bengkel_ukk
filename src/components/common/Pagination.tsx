import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  limit,
  onPageChange,
  onLimitChange,
}) => {
  const limits = [20, 50, 100];

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
      <div className="flex items-center">
        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {limits.map((l) => (
            <option key={l} value={l}>
              Show {l}
            </option>
          ))}
        </select>
      </div>
      
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50"
        >
          Previous
        </button>
        
        <span className="px-3 py-1">
          Page {currentPage} of {totalPages}
        </span>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
