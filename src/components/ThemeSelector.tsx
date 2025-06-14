
import React from 'react';
import { Theme } from './MusicPlayer';

interface ThemeSelectorProps {
  themes: Theme[];
  selectedTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ themes, selectedTheme, onThemeChange }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-white/90 text-lg font-light tracking-wide">Theme Selection</h3>
      
      <div className="space-y-3">
        {themes.map((theme) => (
          <button
            key={theme.name}
            onClick={() => onThemeChange(theme)}
            className={`w-full p-4 rounded-xl transition-all duration-300 text-left ${
              selectedTheme.name === theme.name
                ? 'bg-white/10 border border-white/20'
                : 'bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-white/90 font-medium text-sm">{theme.name}</div>
                <div className="text-white/50 text-xs font-light mt-1">{theme.style}</div>
              </div>
              
              <div className="flex gap-2">
                {[theme.colors.primary, theme.colors.secondary, theme.colors.accent].map((color, index) => (
                  <div
                    key={index}
                    className="w-4 h-4 rounded-full border border-white/20"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary}, ${theme.colors.accent})`
                }}
              />
            </div>

            {selectedTheme.name === theme.name && (
              <div className="mt-2 flex items-center gap-2">
                <div 
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: theme.colors.primary }}
                />
                <span className="text-white/60 text-xs font-light">Active</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;
