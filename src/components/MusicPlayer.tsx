import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Upload, Mic, Settings, Volume2 } from 'lucide-react';
import AudioVisualizer from './AudioVisualizer';
import KaraokeInterface from './KaraokeInterface';
import ThemeSelector from './ThemeSelector';
import { useToast } from '@/hooks/use-toast';
import { useLyricsDetection } from '@/hooks/useLyricsDetection';
import KaraokeMode from './KaraokeMode';
import { PreloadedSong } from '../data/preloadedSongs';

export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  style: 'neon' | 'minimal' | 'retro';
}

const themes: Theme[] = [
  {
    name: 'Neon Dreams',
    colors: {
      primary: '#ff00ff',
      secondary: '#00ffff',
      accent: '#ffff00',
      background: 'from-purple-900 via-blue-900 to-indigo-900'
    },
    style: 'neon'
  },
  {
    name: 'Minimal Wave',
    colors: {
      primary: '#4f46e5',
      secondary: '#06b6d4',
      accent: '#10b981',
      background: 'from-gray-900 via-gray-800 to-gray-900'
    },
    style: 'minimal'
  },
  {
    name: 'Retro Synthwave',
    colors: {
      primary: '#ff006e',
      secondary: '#8338ec',
      accent: '#3a86ff',
      background: 'from-pink-900 via-purple-900 to-blue-900'
    },
    style: 'retro'
  }
];

const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [selectedTheme, setSelectedTheme] = useState(themes[0]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [showKaraoke, setShowKaraoke] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [particleEffects, setParticleEffects] = useState(true);
  const [hasLyrics, setHasLyrics] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<'upload' | 'karaoke'>('upload');
  const [selectedPreloadedSong, setSelectedPreloadedSong] = useState<PreloadedSong | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const analyserRef = useRef<AnalyserNode>();
  const audioContextRef = useRef<AudioContext>();
  const sourceRef = useRef<MediaElementAudioSourceNode>();
  const { toast } = useToast();
  
  const { 
    lyrics, 
    artist, 
    title, 
    isLoading: isLoadingLyrics, 
    error: lyricsError, 
    setLyrics, 
    setTitle, 
    setArtist, 
    clearLyrics 
  } = useLyricsDetection();

  // Initialize audio context once
  const initializeAudioContext = () => {
    if (audioRef.current && !audioContextRef.current) {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaElementSource(audioRef.current);
        
        analyser.fftSize = 2048;
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        
        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        sourceRef.current = source;
        
        console.log('Audio context initialized successfully');
      } catch (error) {
        console.log('Audio context initialization failed:', error);
      }
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume, audioFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAudioFile(file);
    setAudioUrl(URL.createObjectURL(file));
    setHasLyrics(false);
    clearLyrics();
    setShowKaraoke(false);
  };

  const handlePreloadedSongSelect = (song: PreloadedSong) => {
    setSelectedPreloadedSong(song);
    setAudioFile(null);
    setAudioUrl(song.audioUrl);
    setLyrics(song.lyrics);
    setTitle(song.title);
    setArtist(song.artist);
    setHasLyrics(true);
    setShowKaraoke(true);
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        if (!audioContextRef.current) {
          initializeAudioContext();
        }
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleKaraokeToggle = () => {
    setShowKaraoke(!showKaraoke);
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Sophisticated Background */}
      <div className="absolute inset-0">
        {/* Primary gradient */}
        <div 
          className="absolute inset-0 opacity-60"
          style={{
            background: `radial-gradient(ellipse at top, ${selectedTheme.colors.primary}15 0%, transparent 50%), radial-gradient(ellipse at bottom right, ${selectedTheme.colors.secondary}10 0%, transparent 50%)`
          }}
        />
        
        {/* Subtle grid overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(${selectedTheme.colors.primary}40 1px, transparent 1px), linear-gradient(90deg, ${selectedTheme.colors.primary}40 1px, transparent 1px)`,
            backgroundSize: '80px 80px'
          }}
        />

        {/* Minimal particles */}
        {particleEffects && [...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/10 rounded-full animate-pulse"
            style={{
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 5 + 's',
              animationDuration: (Math.random() * 4 + 4) + 's',
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-6">
            {/* Main title */}
            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl font-light tracking-tight">
                <span 
                  className="bg-gradient-to-r bg-clip-text text-transparent font-extralight"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${selectedTheme.colors.primary}, ${selectedTheme.colors.secondary})`
                  }}
                >
                  SONIC
                </span>
                <span className="text-white/90 font-extralight"> VISION</span>
              </h1>
              <p className="text-lg text-white/60 tracking-wide font-light max-w-2xl mx-auto">
                Interactive music visualization and karaoke experience
              </p>
            </div>

            {/* Control bar */}
            <div className="flex items-center justify-center gap-8 pt-8">
              {/* Volume */}
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-white/40" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer slider-thumb"
                />
              </div>

              {/* Settings */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white/90 hover:bg-white/10 transition-all duration-300"
              >
                <Settings className="w-4 h-4" />
              </button>
              
              {/* Status indicator (formerly Karaoke mode button) */}
              {audioUrl && (
                <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-sm">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ 
                      backgroundColor: isPlaying ? selectedTheme.colors.primary : '#666'
                    }}
                  />
                  <span className="text-white/60 text-sm font-light tracking-wide">
                    {isPlaying ? 'Playing' : 'Ready'}
                  </span>
                </div>
              )}
            </div>
            
            {/* Status indicator */}
            {audioFile && (
              <div className="flex justify-center pt-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ 
                      backgroundColor: hasLyrics ? '#10b981' : '#6b7280'
                    }}
                  />
                  <span className="text-white/70">
                    {hasLyrics ? 'Vocals detected' : 'Instrumental track'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-32 right-6 z-30 w-80 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <ThemeSelector 
            themes={themes}
            selectedTheme={selectedTheme}
            onThemeChange={setSelectedTheme}
          />
          
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-sm font-light">Particle Effects</span>
              <button
                onClick={() => setParticleEffects(!particleEffects)}
                className={`relative w-10 h-6 rounded-full transition-all duration-300 ${
                  particleEffects ? 'bg-white/20' : 'bg-white/10'
                }`}
              >
                <div className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-all duration-300 ${
                  particleEffects ? 'left-5' : 'left-1'
                }`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Mode Selection */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/5 rounded-full p-1 inline-flex">
            <button
              onClick={() => {
                setMode('upload');
                clearLyrics();
                setAudioFile(null);
                setAudioUrl(null);
                setShowKaraoke(false);
              }}
              className={`px-6 py-2 rounded-full transition-all duration-300 ${
                mode === 'upload'
                  ? 'bg-white/20 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Upload Song
            </button>
            <button
              onClick={() => {
                setMode('karaoke');
                clearLyrics();
                setAudioFile(null);
                setAudioUrl(null);
                setSelectedPreloadedSong(null);
                setShowKaraoke(true);
              }}
              className={`px-6 py-2 rounded-full transition-all duration-300 ${
                mode === 'karaoke'
                  ? 'bg-white/20 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Karaoke Mode
            </button>
          </div>
        </div>

        {mode === 'upload' ? (
          <>
            {/* Upload Section */}
            <div className="text-center mb-16">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="group relative inline-flex items-center justify-center p-4 rounded-full border-2 border-dashed border-white/20 hover:border-white/40 transition-all duration-300"
              >
                <Upload className="w-8 h-8 text-white/60 group-hover:text-white transition-colors duration-300" />
                <span className="ml-3 text-white/60 group-hover:text-white transition-colors duration-300">
                  Upload Audio File
                </span>
              </button>
            </div>
          </>
        ) : (
          <KaraokeMode 
            onSongSelect={handlePreloadedSongSelect} 
            isPlaying={isPlaying}
          />
        )}

        {/* Common Player Controls and Karaoke Interface (visible if audioUrl is set) */}
        {audioUrl && (
          <div className="space-y-12">
            {/* Progress */}
            <div className="mb-12 space-y-4">
              <div className="bg-white/5 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-100"
                  style={{
                    width: `${(currentTime / duration) * 100}%`,
                    background: `linear-gradient(90deg, ${selectedTheme.colors.primary}, ${selectedTheme.colors.secondary})`
                  }}
                />
              </div>
              <div className="flex justify-between text-white/50 text-sm font-light">
                <span>{formatTime(currentTime)}</span>
                <span className="text-white/80 font-medium">
                  {mode === 'upload' && audioFile ? audioFile.name : selectedPreloadedSong?.title}
                </span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex justify-center items-center gap-8">
              <button
                onClick={togglePlayPause}
                disabled={!audioUrl}
                className="group p-6 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isPlaying ? 
                  <Pause className="w-8 h-8" /> : 
                  <Play className="w-8 h-8" />
                }
              </button>
            </div>
          </div>
        )}

        {/* Visualizer */}
        <div className="bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-3xl p-8 mt-12">
          <AudioVisualizer 
            audioRef={audioRef}
            isPlaying={isPlaying}
            theme={selectedTheme}
            analyser={analyserRef.current}
            audioContext={audioContextRef.current}
          />
        </div>

        {/* Karaoke Interface Display - Only render if in Karaoke Mode and showKaraoke is true */}
        {mode === 'karaoke' && showKaraoke && (
          <div className="bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden mt-12">
            <KaraokeInterface 
              currentTime={currentTime}
              theme={selectedTheme}
              lyrics={lyrics}
              artist={artist}
              title={title}
              isLoadingLyrics={isLoadingLyrics}
            />
          </div>
        )}
      </main>

      {/* Lyrics Error Display (if applicable) */}
      {lyricsError && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4">
          <p className="text-orange-300 text-sm">{lyricsError}</p>
        </div>
      )}

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={audioUrl || undefined} 
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
};

export default MusicPlayer;
