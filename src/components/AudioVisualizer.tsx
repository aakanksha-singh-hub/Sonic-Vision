import React, { useRef, useEffect, useState } from 'react';
import { Theme } from './MusicPlayer';

interface AudioVisualizerProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
  theme: Theme;
  analyser?: AnalyserNode;
  audioContext?: AudioContext;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ 
  audioRef, 
  isPlaying, 
  theme, 
  analyser: externalAnalyser,
  audioContext: externalAudioContext 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [visualizationType, setVisualizationType] = useState<'circular' | 'plasma'>('circular');

  useEffect(() => {
    if (isPlaying && externalAnalyser) {
      startVisualization();
    } else {
      stopVisualization();
    }

    return () => stopVisualization();
  }, [isPlaying, visualizationType, theme, externalAnalyser]);

  const startVisualization = () => {
    if (!externalAnalyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = externalAnalyser;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const animate = () => {
      analyser.getByteFrequencyData(dataArray);

      // Clear canvas with theme background
      const bgColor = theme.colors.background === 'from-gray-900 via-gray-800 to-gray-900' 
        ? 'rgba(17, 24, 39, 0.95)' 
        : theme.colors.background === 'from-pink-900 via-purple-900 to-blue-900'
        ? 'rgba(59, 7, 100, 0.95)'  
        : 'rgba(30, 27, 75, 0.95)';
      
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (visualizationType === 'circular') {
        drawCircularRadialVisualization(ctx, canvas, dataArray, bufferLength);
      } else if (visualizationType === 'plasma') {
        drawLiquidPlasmaWaveform(ctx, canvas, dataArray, bufferLength);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  const stopVisualization = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const drawCircularRadialVisualization = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, dataArray: Uint8Array, bufferLength: number) => {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const baseRadius = Math.min(centerX, centerY) * 0.3;

    ctx.save();
    ctx.translate(centerX, centerY);

    // Draw multiple concentric circles for depth
    for (let ring = 0; ring < 3; ring++) {
      const ringRadius = baseRadius * (1 + ring * 0.4);
      const ringOpacity = 1 - ring * 0.3;

      for (let i = 0; i < bufferLength; i++) {
        const angle = (i / bufferLength) * Math.PI * 2;
        const barHeight = (dataArray[i] / 255) * ringRadius * 0.8;

        // Create radial gradient for each bar
        const gradient = ctx.createRadialGradient(0, 0, ringRadius, 0, 0, ringRadius + barHeight);
        gradient.addColorStop(0, `${theme.colors.primary}${Math.floor(ringOpacity * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(0.5, `${theme.colors.secondary}${Math.floor(ringOpacity * 200).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, `${theme.colors.accent}${Math.floor(ringOpacity * 100).toString(16).padStart(2, '0')}`);

        ctx.fillStyle = gradient;

        // Add glow effect
        ctx.shadowColor = theme.colors.primary;
        ctx.shadowBlur = 20 * ringOpacity;

        const x1 = Math.cos(angle) * ringRadius;
        const y1 = Math.sin(angle) * ringRadius;
        const x2 = Math.cos(angle) * (ringRadius + barHeight);
        const y2 = Math.sin(angle) * (ringRadius + barHeight);

        // Draw radial bars
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = 4 - ring;
        ctx.strokeStyle = gradient;
        ctx.stroke();

        // Add particle effects at the tips
        if (barHeight > ringRadius * 0.3) {
          ctx.beginPath();
          ctx.arc(x2, y2, 2, 0, Math.PI * 2);
          ctx.fillStyle = theme.colors.accent;
          ctx.shadowBlur = 15;
          ctx.fill();
        }
      }
    }

    // Add central glow
    const centerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, baseRadius * 0.5);
    centerGlow.addColorStop(0, `${theme.colors.primary}30`);
    centerGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = centerGlow;
    ctx.beginPath();
    ctx.arc(0, 0, baseRadius * 0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  const drawLiquidPlasmaWaveform = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, dataArray: Uint8Array, bufferLength: number) => {
    const time = Date.now() * 0.001; // Time for animation
    
    // Create multiple flowing waveforms
    for (let layer = 0; layer < 3; layer++) {
      const layerOpacity = 1 - layer * 0.3;
      const yOffset = canvas.height / 2 + layer * 20;
      
      ctx.lineWidth = 6 - layer * 2;
      
      // Create flowing gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, `${theme.colors.primary}${Math.floor(layerOpacity * 255).toString(16).padStart(2, '0')}`);
      gradient.addColorStop(0.3, `${theme.colors.secondary}${Math.floor(layerOpacity * 200).toString(16).padStart(2, '0')}`);
      gradient.addColorStop(0.7, `${theme.colors.accent}${Math.floor(layerOpacity * 200).toString(16).padStart(2, '0')}`);
      gradient.addColorStop(1, `${theme.colors.primary}${Math.floor(layerOpacity * 255).toString(16).padStart(2, '0')}`);
      
      ctx.strokeStyle = gradient;

      // Add glow effect
      ctx.shadowColor = theme.colors.primary;
      ctx.shadowBlur = 25 * layerOpacity;

      ctx.beginPath();

      const points = [];
      const sliceWidth = canvas.width / bufferLength;

      // Generate smooth curve points
      for (let i = 0; i < bufferLength; i++) {
        const x = i * sliceWidth;
        const amplitude = (dataArray[i] / 255) * (canvas.height * 0.3);
        
        // Add flowing motion and organic curves
        const wave1 = Math.sin(x * 0.01 + time * 2 + layer) * 20;
        const wave2 = Math.sin(x * 0.005 + time * 1.5) * 15;
        const y = yOffset + amplitude * Math.sin(x * 0.02 + time + layer * 0.5) + wave1 + wave2;
        
        points.push({ x, y });
      }

      // Draw smooth curves using quadratic curves
      if (points.length > 0) {
        ctx.moveTo(points[0].x, points[0].y);
        
        for (let i = 1; i < points.length - 1; i++) {
          const currentPoint = points[i];
          const nextPoint = points[i + 1];
          const controlX = (currentPoint.x + nextPoint.x) / 2;
          const controlY = (currentPoint.y + nextPoint.y) / 2;
          
          ctx.quadraticCurveTo(currentPoint.x, currentPoint.y, controlX, controlY);
        }
        
        ctx.stroke();
      }

      // Add plasma particles
      for (let i = 0; i < bufferLength; i += 8) {
        if (dataArray[i] > 128) {
          const x = i * sliceWidth;
          const y = points[i]?.y || yOffset;
          
          ctx.beginPath();
          ctx.arc(x, y, (dataArray[i] / 255) * 3, 0, Math.PI * 2);
          ctx.fillStyle = `${theme.colors.accent}${Math.floor(layerOpacity * 150).toString(16).padStart(2, '0')}`;
          ctx.shadowBlur = 20;
          ctx.fill();
        }
      }
    }
  };

  // Auto-switch visualization based on theme
  useEffect(() => {
    if (theme.style === 'neon' || theme.name === 'Retro Synthwave') {
      setVisualizationType('plasma');
    } else {
      setVisualizationType('circular');
    }
  }, [theme]);

  return (
    <div className="relative">
      {/* Visualization Type Selector */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        {['circular', 'plasma'].map((type) => (
          <button
            key={type}
            onClick={() => setVisualizationType(type as any)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              visualizationType === type
                ? 'bg-white text-black'
                : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
            }`}
          >
            {type === 'circular' ? 'Radial' : 'Plasma'}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="w-full h-64 lg:h-80 rounded-xl"
          style={{ background: 'radial-gradient(circle at center, rgba(255,255,255,0.05) 0%, transparent 70%)' }}
        />
      </div>

      {/* Visualization Info */}
      <div className="text-center mt-4 text-white/70">
        <p className="text-sm">
          {!isPlaying ? 'Play music to see visualization' : 
           visualizationType === 'circular' ? 'Circular Radial Frequency Visualizer' : 'Liquid Plasma Waveform'}
        </p>
        <p className="text-xs text-white/50 mt-1">
          {visualizationType === 'circular' ? 'Multi-layered radial bars with glow particles' : 'Flowing organic waveforms with plasma effects'}
        </p>
      </div>
    </div>
  );
};

export default AudioVisualizer;
