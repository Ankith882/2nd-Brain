
import React from 'react';

interface BackgroundLayerProps {
  isDarkMode: boolean;
  currentTheme?: any;
}

export const BackgroundLayer: React.FC<BackgroundLayerProps> = ({ isDarkMode, currentTheme }) => {
  const backgroundStyle = currentTheme?.backgroundImage 
    ? {
        backgroundImage: `url(${currentTheme.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    : {};

  const backgroundClass = currentTheme?.backgroundImage 
    ? '' 
    : isDarkMode 
      ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
      : 'bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100';

  return (
    <div 
      className={`fixed inset-0 w-full h-full ${backgroundClass}`}
      style={{
        ...backgroundStyle,
        zIndex: -1,
        pointerEvents: 'none'
      }}
    >
      {/* Overlay for better readability when background image is used */}
      {currentTheme?.backgroundImage && (
        <div 
          className={`absolute inset-0 ${isDarkMode ? 'bg-black/20' : 'bg-white/15'}`}
          style={{ pointerEvents: 'none' }}
        />
      )}
      
      {/* Background bubbles - only show when no background image */}
      {!currentTheme?.backgroundImage && (
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 animate-pulse ${
            isDarkMode ? 'bg-purple-500' : 'bg-blue-400'
          }`} />
          <div className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-15 animate-pulse delay-1000 ${
            isDarkMode ? 'bg-pink-500' : 'bg-indigo-400'
          }`} />
        </div>
      )}
    </div>
  );
};
