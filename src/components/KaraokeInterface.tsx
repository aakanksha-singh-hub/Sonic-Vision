import React, { useState, useEffect } from 'react';
import { Theme } from './MusicPlayer';

interface KaraokeInterfaceProps {
  currentTime: number;
  isRecording: boolean;
  score: number;
  theme: Theme;
  lyrics?: string;
  artist?: string;
  title?: string;
  isLoadingLyrics?: boolean;
}

const KaraokeInterface: React.FC<KaraokeInterfaceProps> = ({ 
  currentTime, 
  isRecording, 
  score, 
  theme, 
  lyrics,
  artist,
  title,
  isLoadingLyrics 
}) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [showScore, setShowScore] = useState(false);
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

  useEffect(() => {
    if (score > 0) {
      setShowScore(true);
      const timer = setTimeout(() => setShowScore(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [score]);

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
        {isRecording && (
          <>
            {/* Animated background particles */}
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full animate-ping"
                style={{
                  background: `radial-gradient(circle, ${theme.colors.primary}, transparent)`,
                  width: Math.random() * 10 + 5 + 'px',
                  height: Math.random() * 10 + 5 + 'px',
                  left: Math.random() * 100 + '%',
                  top: Math.random() * 100 + '%',
                  animationDelay: Math.random() * 2 + 's',
                }}
              />
            ))}
            
            {/* Recording pulse effect */}
            <div 
              className="absolute inset-0 rounded-2xl animate-pulse"
              style={{
                background: `linear-gradient(45deg, transparent, ${theme.colors.primary}20, transparent)`,
              }}
            />
          </>
        )}
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
          
          {/* Recording indicator */}
          {isRecording && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-white font-medium">Recording</span>
            </div>
          )}
        </div>

        {/* Score display */}
        {showScore && (
          <div 
            className="absolute top-0 right-0 px-6 py-3 rounded-full text-white font-bold text-xl animate-scale-in"
            style={{
              background: `linear-gradient(45deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
              boxShadow: theme.style === 'neon' ? `0 0 30px ${theme.colors.primary}50` : 'none',
            }}
          >
            Score: {score}/100
          </div>
        )}
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

      {/* Instructions */}
      {!isRecording && (
        <div className="relative z-10 mt-6 text-center text-white/60">
          <p className="text-sm">
            Click the microphone button to start recording your performance
          </p>
        </div>
      )}
    </div>
  );
};

export default KaraokeInterface;
