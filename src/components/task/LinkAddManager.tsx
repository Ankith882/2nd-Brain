import React, { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { X, Link as LinkIcon, ExternalLink } from 'lucide-react';

interface LinkAddManagerProps {
  isDarkMode: boolean;
  isVisible: boolean;
  onAddLink: (url: string, displayText?: string) => void;
  onClose: () => void;
  selectedText?: string;
  hasTextSelection?: boolean;
}

export const LinkAddManager: React.FC<LinkAddManagerProps> = ({
  isDarkMode,
  isVisible,
  onAddLink,
  onClose,
  selectedText,
  hasTextSelection = false
}) => {
  const [url, setUrl] = useState('');
  const [displayText, setDisplayText] = useState(selectedText || '');
  const [isValidUrl, setIsValidUrl] = useState(true);

  const validateUrl = (urlString: string) => {
    try {
      // Allow various URL formats
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
      return urlPattern.test(urlString) || urlString.startsWith('http://') || urlString.startsWith('https://');
    } catch {
      return false;
    }
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);
    setIsValidUrl(value === '' || validateUrl(value));
  };

  const handleAddLink = () => {
    if (url && isValidUrl) {
      onAddLink(url, displayText || url);
      setUrl('');
      setDisplayText('');
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && url && isValidUrl) {
      handleAddLink();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Add Link
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* URL Input */}
          <div className="space-y-2">
            <label className={`text-sm font-medium ${isDarkMode ? 'text-white/80' : 'text-gray-700'}`}>
              URL *
            </label>
            <div className="relative">
              <Input
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="https://example.com"
                className={`bg-white/10 border-white/20 pr-10 ${
                  !isValidUrl ? 'border-red-400' : ''
                }`}
              />
              <ExternalLink className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
            </div>
            {!isValidUrl && (
              <p className="text-red-400 text-xs">Please enter a valid URL</p>
            )}
          </div>

          {/* Display Text Input - Hide when text is selected */}
          {!hasTextSelection && (
            <div className="space-y-2">
              <label className={`text-sm font-medium ${isDarkMode ? 'text-white/80' : 'text-gray-700'}`}>
                Display Text (optional)
              </label>
              <Input
                value={displayText}
                onChange={(e) => setDisplayText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Link text to display..."
                className="bg-white/10 border-white/20"
              />
              <p className={`text-xs ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>
                Leave empty to use the URL as display text
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-6">
          <Button
            onClick={handleAddLink}
            disabled={!url || !isValidUrl}
            className="flex-1"
          >
            Add Link
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-white/10 border-white/20 hover:bg-white/20"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};