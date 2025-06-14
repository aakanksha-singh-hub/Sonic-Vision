import React, { useState, useEffect } from 'react';
import { Theme } from './MusicPlayer';

interface KaraokeInterfaceProps {
  currentTime: number;
  theme: Theme;
  lyrics?: string;
  artist?: string;
  title?: string;
  isLoadingLyrics?: boolean;
}

const KaraokeInterface: React.FC<KaraokeInterfaceProps> = ({
  currentTime,
  theme,
  lyrics,
  artist,
  title,
  isLoadingLyrics 
}) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [lyricsLines, setLyricsLines] = useState<string[]>([]);

  // Process lyrics into lines
  useEffect(() => {
    if (lyrics) {
      const lines = lyrics
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.trim());
      setLyricsLines(lines);
    }
  }, [lyrics]);

  // Auto-scroll through lyrics (pseudo-sync)
  useEffect(() => {
    if (lyricsLines.length > 0 && currentTime > 0) {
      // Estimate line timing based on song duration
      // Assume average song is 3-4 minutes, distribute lines evenly
      const estimatedDuration = 180; // 3 minutes
      const lineInterval = estimatedDuration / lyricsLines.length;
      const newLineIndex = Math.floor(currentTime / lineInterval);
      
      if (newLineIndex !== currentLineIndex && newLineIndex < lyricsLines.length) {
        setCurrentLineIndex(newLineIndex);
      }
    }
  }, [currentTime, lyricsLines.length, currentLineIndex]);

  const getLyricStyle = (index: number) => {
    if (index === currentLineIndex) {
      return {
        color: theme.colors.primary,
        transform: 'scale(1.05)',
        textShadow: theme.style === 'neon' ? `0 0 20px ${theme.colors.primary}` : 'none',
        filter: theme.style === 'neon' ? `drop-shadow(0 0 10px ${theme.colors.primary}50)` : 'none',
      };
    } else if (index < currentLineIndex) {
      return {
        color: theme.colors.secondary,
        opacity: 0.6,
      };
    } else {
      return {
        color: 'white',
        opacity: 0.4,
      };
    }
  };

  if (isLoadingLyrics) {
    return (
      <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-8 border border-white/10 relative overflow-hidden">
        <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
          <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-2">Detecting Lyrics...</h3>
            <p className="text-white/60">Analyzing audio to find song lyrics</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-8 border border-white/10 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated background particles and recording pulse effect removed */}
      </div>

      {/* Header */}
      <div className="relative z-10 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Karaoke Mode</h2>
            {(artist || title) && (
              <p className="text-white/70 mt-1">
                {artist && title ? `${artist} - ${title}` : artist || title}
              </p>
            )}
          </div>
          
          {/* Recording indicator removed */}
        </div>

        {/* Score display removed */}
      </div>

      {/* Lyrics Display */}
      <div className="relative z-10 min-h-[300px] flex flex-col justify-center">
        {lyrics && lyricsLines.length > 0 ? (
          <div className="space-y-3 text-center max-h-80 overflow-hidden">
            {lyricsLines.map((line, index) => (
              <div
                key={index}
                className="text-lg md:text-xl lg:text-2xl font-medium transition-all duration-500 ease-in-out leading-relaxed"
                style={getLyricStyle(index)}
              >
                {line}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-white/60">
            <p className="text-lg mb-2">No lyrics found for this song.</p>
            <p className="text-sm">Please select a song with lyrics or upload one.</p>
          </div>
        )}

        {/* Progress indicator */}
        {lyricsLines.length > 0 && (
          <div className="mt-8">
            <div className="bg-white/20 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${((currentLineIndex + 1) / lyricsLines.length) * 100}%`,
                  background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                  boxShadow: theme.style === 'neon' ? `0 0 10px ${theme.colors.primary}` : 'none',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Instructions removed */}
    </div>
  );
};

export default KaraokeInterface;
