import { useState, useCallback } from 'react';

export const useLyricsDetection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [artist, setArtist] = useState<string | null>(null);

  const clearLyrics = useCallback(() => {
    setLyrics(null);
    setError(null);
    setTitle(null);
    setArtist(null);
  }, []);

  return {
    isLoading,
    error,
    lyrics,
    title,
    artist,
    setLyrics,
    setTitle,
    setArtist,
    clearLyrics
  };
};
