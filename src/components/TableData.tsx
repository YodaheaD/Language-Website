"use client";

import { useState } from "react";
import { ArrowIcon } from "./low-level/icons";
import JapaneseImage from "./Japanese-Image";
import { useTableData, useTableSize } from "@/hooks/useTableData";

export default function DataTable() {
  const [fetchDataSet, setFetchData] = useState<"spanish" | "japanese">(
    "spanish"
  );
  const [page, setPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);

  // React Query hooks
  const {
    data: tableDataResponse,
    isLoading: isDataLoading,
    error: dataError,
    isFetching: isDataFetching,
  } = useTableData(fetchDataSet, page, pageLimit);

  const {
    data: totalCount = 0,
    isLoading: isSizeLoading,
    error: sizeError,
  } = useTableSize(fetchDataSet);

  const tableData = tableDataResponse?.data || [];
  const isLoading = isDataLoading || isSizeLoading;
  const hasError = dataError || sizeError;

  // Fetch data on component mount and when dependencies change
  // useEffect(() => {
  //   fetchData();
  //   fetchTotalSize();
  // }, [fetchDataSet, page, pageLimit]);

  // Handle loading and error states
  if (hasError) {
    return (
      <div className="w-full max-w-6xl h-[90vh] mx-auto p-2 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <svg
            className="w-12 h-12 text-red-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Error Loading Data
          </h3>
          <p className="text-red-600">
            Failed to load {fetchDataSet} data. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl h-[90vh]  mx-auto p-2 ">
      {/* Table Container */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4 p-4">
          <div className="flex items-center space-x-2">
            {page !== 1 && (
              <button
                onClick={() => setPage(1)}
                className="px-2 py-1 inline-flex  text-sm font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500 transition-colors duration-200"
              >
                <ArrowIcon width={8} direction="left" />
              </button>
            )}
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1 || isDataFetching}
              className="px-2 py-1 text-sm font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500 transition-colors duration-200"
            >
              <ArrowIcon width={20} direction="left" />
            </button>

            <div className="flex items-center space-x-1">
              <select
                value={page}
                onChange={(e) => setPage(Number(e.target.value))}
                disabled={isDataFetching}
                className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 shadow-sm disabled:opacity-50"
              >
                {Array.from(
                  { length: Math.ceil(totalCount / pageLimit) || 1 },
                  (_, i) => i + 1
                ).map((pageNum) => (
                  <option key={pageNum} value={pageNum}>
                    Page {pageNum}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={
                page >= Math.ceil(totalCount / pageLimit) || isDataFetching
              }
              className="px-2 py-1  text-sm font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500 transition-colors duration-200"
            >
              <ArrowIcon width={20} direction="right" />
            </button>
            <span className="px-2 sm:px-8 text-sm">
              Total: {isLoading ? "..." : totalCount}
              {isDataFetching && (
                <span className="ml-2 text-blue-500 text-xs">Updating...</span>
              )}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
            <div className="flex items-center space-x-3">
              <label
                htmlFor="language-select"
                className="text-sm font-medium text-gray-700"
              >
                Language:
              </label>
              <select
                id="language-select"
                value={fetchDataSet}
                onChange={(e) => {
                  setFetchData(e.target.value as "spanish" | "japanese");
                  setPage(1); // Reset to first page when changing language
                }}
                disabled={isDataFetching}
                className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 shadow-sm disabled:opacity-50"
              >
                <option value="spanish">Spanish</option>
                <option value="japanese">Japanese</option>
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <label
                htmlFor="page-limit"
                className="text-sm font-medium text-gray-700"
              >
                Rows per page:
              </label>

              <select
                id="page-limit"
                value={pageLimit}
                onChange={(e) => {
                  setPageLimit(Number(e.target.value));
                  setPage(1); // Reset to first page when changing limit
                }}
                disabled={isDataFetching}
                className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 shadow-sm disabled:opacity-50"
              >
                {[5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, "All"].map(
                  (num) =>
                    num !== "All" ? (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ) : (
                      <option key={num} value={totalCount}>
                        All - {totalCount}
                      </option>
                    )
                )}
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
        {isDataFetching && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-20 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="text-sm text-gray-600">Loading...</span>
            </div>
          </div>
        )}
        <table className="w-full relative">
          {/* Table Header */}
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
            <tr>
              {tableData.length > 0 &&
                Object.keys(tableData[0]).map((key) => (
                  <th
                    key={key}
                    className={`px-3 sm:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${
                      key.toLowerCase() === "primaryid" ||
                      key.toLowerCase() === "type"
                        ? "hidden sm:table-cell"
                        : ""
                    }`}
                  >
                    {key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())}
                  </th>
                ))}
              {tableData.length === 0 && (
                <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Data
                </th>
              )}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {tableData.length > 0 ? (
              tableData.map((row, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  {Object.entries(row).map(([key, value], cellIndex) => (
                    <td
                      key={cellIndex}
                      className={`px-3 sm:px-6 py-4 text-sm text-gray-900 ${
                        key.toLowerCase() === "primaryid" ||
                        key.toLowerCase() === "type"
                          ? "hidden sm:table-cell"
                          : ""
                      }`}
                    >
                      {/* Special handling for definition column in Japanese */}
                      {key.toLowerCase() === "definition" &&
                      fetchDataSet === "japanese" ? (
                        <div className="flex items-center justify-center">
                          <JapaneseImage
                            value={String(value)}
                            type={row.type || ""}
                            height="h-16"
                            width="w-16"
                            addBorder={true}
                            alt={`${row.word || "Character"} - ${value}`}
                          />
                        </div>
                      ) : (
                        <div
                          className="max-w-[200px] truncate"
                          title={String(value)}
                        >
                          {String(value)}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={1}
                  className="px-3 sm:px-6 py-12 text-center text-gray-500 text-lg font-medium"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <svg
                      className="w-12 h-12 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m0 0V9a2 2 0 012-2h2m0 0V6a2 2 0 012-2h2.28a2 2 0 011.8 1.05l1.57 3.15A2 2 0 0116.72 9H14m-2-3v4m-2 0h4"
                      />
                    </svg>
                    <span>No data available</span>
                    <p className="text-sm text-gray-400">
                      {isLoading
                        ? `Loading ${fetchDataSet} data...`
                        : `No ${fetchDataSet} data found`}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
