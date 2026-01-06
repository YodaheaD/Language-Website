import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface DashboardStats {
  spanishWords: number;
  japaneseWords: number;
  totalSets: number;
}

// Individual query functions
const fetchSpanishCount = async (): Promise<number> => {
  const response = await axios.get(`/api/data/fetchSize/spanish`);
  return response.data.size || 0;
};

const fetchJapaneseCount = async (): Promise<number> => {
  const response = await axios.get(`/api/data/fetchSize/japanese`);
  return response.data.size || 0;
};

const fetchSetsCount = async (): Promise<number> => {
  const response = await axios.get(`/api/sets`);
  return response.data.length || 0;
};

export const useDashboardStats = () => {
  // Fetch Spanish word count
  const {
    data: spanishWords = 0,
    isLoading: isLoadingSpanish,
    error: spanishError
  } = useQuery({
    queryKey: ['spanish-count'],
    queryFn: fetchSpanishCount,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch Japanese word count  
  const {
    data: japaneseWords = 0,
    isLoading: isLoadingJapanese,
    error: japaneseError
  } = useQuery({
    queryKey: ['japanese-count'],
    queryFn: fetchJapaneseCount,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch sets count
  const {
    data: totalSets = 0,
    isLoading: isLoadingSets,
    error: setsError
  } = useQuery({
    queryKey: ['sets-count'],
    queryFn: fetchSetsCount,
    staleTime: 2 * 60 * 1000, // 2 minutes (shorter since sets change more frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Combine loading states
  const isLoading = isLoadingSpanish || isLoadingJapanese || isLoadingSets;
  
  // Combine error states
  const error = spanishError || japaneseError || setsError;

  // Return combined stats
  const stats: DashboardStats & { loading: boolean; error: any } = {
    spanishWords,
    japaneseWords,
    totalSets,
    loading: isLoading,
    error,
  };

  return stats;
};