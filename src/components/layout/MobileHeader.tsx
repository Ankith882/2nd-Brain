import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { ThemeSelector } from '../ThemeSelector';

interface MobileHeaderProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
  onThemeChange?: (theme: any) => void;
  onMenuClick: () => void;
  isMenuOpen: boolean;
  title?: string;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  isDarkMode,
  onThemeToggle,
  onThemeChange,
  onMenuClick,
  isMenuOpen,
  title = "2nd Brain"
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/50 md:hidden">
      {/* Safe area padding for notched devices */}
      <div className="px-4 py-3 pt-safe-area-inset-top">
        <div className="flex items-center justify-between">
          {/* Hamburger Menu Button */}
          <Button
            onClick={onMenuClick}
            variant="ghost"
            size="sm"
            className="h-touch w-touch rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>

          {/* App Title */}
          <h1 className="text-lg font-semibold text-foreground truncate px-2">
            {title}
          </h1>

          {/* Theme Selector */}
          <div className="h-touch w-touch flex items-center justify-center">
            <ThemeSelector 
              isDarkMode={isDarkMode}
              onThemeToggle={onThemeToggle}
              onThemeChange={onThemeChange}
            />
          </div>
        </div>
      </div>
    </header>
  );
};