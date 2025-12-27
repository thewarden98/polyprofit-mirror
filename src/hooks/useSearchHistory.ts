import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "polymarket_search_history";
const MAX_HISTORY_ITEMS = 20;

interface SearchHistoryItem {
  query: string;
  timestamp: number;
  count: number;
}

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Save to localStorage whenever history changes
  const saveHistory = useCallback((newHistory: SearchHistoryItem[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Add a search query to history
  const addSearch = useCallback((query: string) => {
    if (!query || query.length < 2) return;
    
    const normalizedQuery = query.toLowerCase().trim();
    
    setHistory(prev => {
      const existing = prev.find(item => item.query.toLowerCase() === normalizedQuery);
      
      let newHistory: SearchHistoryItem[];
      if (existing) {
        // Increment count and update timestamp
        newHistory = prev.map(item => 
          item.query.toLowerCase() === normalizedQuery
            ? { ...item, count: item.count + 1, timestamp: Date.now() }
            : item
        );
      } else {
        // Add new item
        newHistory = [
          { query: normalizedQuery, timestamp: Date.now(), count: 1 },
          ...prev
        ].slice(0, MAX_HISTORY_ITEMS);
      }
      
      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      } catch {
        // Ignore
      }
      
      return newHistory;
    });
  }, []);

  // Get top search terms by frequency
  const getTopSearches = useCallback((limit: number = 5): string[] => {
    return [...history]
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map(item => item.query);
  }, [history]);

  // Get recent searches
  const getRecentSearches = useCallback((limit: number = 5): string[] => {
    return [...history]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
      .map(item => item.query);
  }, [history]);

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }, []);

  return {
    history,
    addSearch,
    getTopSearches,
    getRecentSearches,
    clearHistory,
    hasHistory: history.length > 0,
  };
}
