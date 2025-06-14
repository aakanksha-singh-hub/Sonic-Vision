import React, { useState } from 'react';
import { preloadedSongs, PreloadedSong } from '../data/preloadedSongs';
import { useToast } from '@/hooks/use-toast';
import { Music, Play } from 'lucide-react';

interface KaraokeModeProps {
  onSongSelect: (song: PreloadedSong) => void;
  isPlaying?: boolean;
}

const KaraokeMode: React.FC<KaraokeModeProps> = ({ onSongSelect, isPlaying }) => {
  const [selectedSong, setSelectedSong] = useState<PreloadedSong | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSongSelect = async (song: PreloadedSong) => {
    try {
      setIsLoading(true);
      setSelectedSong(song);
      onSongSelect(song);
      toast({
        title: "Song selected!",
        description: `Now playing: ${song.title} by ${song.artist}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-3xl p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Karaoke Mode</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {preloadedSongs.map((song) => (
          <button
            key={song.id}
            onClick={() => handleSongSelect(song)}
            disabled={isLoading}
            className={`p-4 rounded-xl text-left transition-all duration-300 relative group ${
              selectedSong?.id === song.id
                ? 'bg-white/20 border-2 border-white/30'
                : 'bg-white/5 border border-white/10 hover:bg-white/10'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">{song.title}</h3>
                <p className="text-white/60 text-sm">{song.artist}</p>
              </div>
              {selectedSong?.id === song.id ? (
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  {isPlaying ? (
                    <Music className="w-4 h-4 text-white" />
                  ) : (
                    <Play className="w-4 h-4 text-white" />
                  )}
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-white/10 flex items-center justify-center">
                  <Play className="w-4 h-4 text-white/60 group-hover:text-white" />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {selectedSong && (
        <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Selected Song</h3>
              <p className="text-white/80">
                {selectedSong.title} by {selectedSong.artist}
              </p>
            </div>
            {isPlaying ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-white/80 text-sm">Playing</span>
              </div>
            ) : (
              <p className="text-white/60 text-sm">
                Click the play button to start singing!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default KaraokeMode; 