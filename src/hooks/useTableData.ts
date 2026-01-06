import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Types
interface TableDataItem {
  [key: string]: any;
}

interface FetchDataResponse {
  data: TableDataItem[];
  total?: number;
}

interface FetchSizeResponse {
  size: number;
}

// API functions
const fetchTableData = async (
  language: "spanish" | "japanese",
  page: number,
  limit: number
): Promise<FetchDataResponse> => {
  const response = await axios.get(
    `/api/data/fetch/${language}?page=${page}&limit=${limit}`
  );
  return {
    data: response.data.data || response.data,
    total: response.data.total || response.data.length,
  };
};

const fetchTableSize = async (
  language: "spanish" | "japanese"
): Promise<number> => {
  const response = await axios.get<FetchSizeResponse>(
    `/api/data/fetchSize/${language}`
  );
  return response.data.size || 0;
};

// Custom hooks
export const useTableData = (
  language: "spanish" | "japanese",
  page: number,
  limit: number
) => {
  return useQuery({
    queryKey: ["tableData", language, page, limit],
    queryFn: () => fetchTableData(language, page, limit),
    enabled: Boolean(language && page && limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useTableSize = (language: "spanish" | "japanese") => {
  return useQuery({
    queryKey: ["tableSize", language],
    queryFn: () => fetchTableSize(language),
    enabled: Boolean(language),
    staleTime: 10 * 60 * 1000, // 10 minutes - size changes less frequently
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Sets data types and API functions
interface SetData {
  setName: string;
  description: string;
  dateCreated: string;
  dateModified: string;
  primaryid: number;
}

interface FolderData {
  folder: string;
  langOfSet: string;
  sets: SetData[];
}

const fetchSetsData = async (): Promise<FolderData[]> => {
  const response = await axios.get(
    `/api/sets`
  );
  return response.data.data || response.data;
};

// Custom hook for sets data
export const useSetsData = () => {
  return useQuery({
    queryKey: ["setsData"],
    queryFn: fetchSetsData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors except 401/403
      if (error instanceof Error && 'status' in error) {
        const status = (error as any).status;
        if (status >= 400 && status < 500 && status !== 401 && status !== 403) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });
};

export type { SetData, FolderData };