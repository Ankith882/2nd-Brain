import React, { useRef } from 'react';
import { Button, Input } from '@/components/ui';
import { Upload, FileIcon, X } from 'lucide-react';

interface FileUploadManagerProps {
  isDarkMode: boolean;
  isVisible: boolean;
  onFileUpload: (file: File, displayText?: string) => void;
  onClose: () => void;
  hasTextSelection?: boolean;
}

export const FileUploadManager: React.FC<FileUploadManagerProps> = ({
  isDarkMode,
  isVisible,
  onFileUpload,
  onClose,
  hasTextSelection = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [displayText, setDisplayText] = React.useState('');
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [dragActive, setDragActive] = React.useState(false);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    if (!displayText) {
      setDisplayText(file.name);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onFileUpload(selectedFile, displayText || selectedFile.name);
      setSelectedFile(null);
      setDisplayText('');
      onClose();
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Upload File
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Drag & Drop Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-blue-400 bg-blue-500/10' 
              : 'border-white/30 hover:border-white/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {selectedFile ? (
            <div className="space-y-2">
              <FileIcon className="h-12 w-12 mx-auto text-blue-400" />
              <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {selectedFile.name}
              </p>
              <p className={`text-xs ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className={`h-12 w-12 mx-auto ${isDarkMode ? 'text-white/60' : 'text-gray-400'}`} />
              <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Drag & drop a file here, or click to select
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white/10 border-white/20 hover:bg-white/20"
              >
                Choose File
              </Button>
            </div>
          )}
        </div>

        {/* Display Text Input - Hide when text is selected */}
        {!hasTextSelection && (
          <div className="mt-4 space-y-2">
            <label className={`text-sm font-medium ${isDarkMode ? 'text-white/80' : 'text-gray-700'}`}>
              Display Text (optional)
            </label>
            <Input
              value={displayText}
              onChange={(e) => setDisplayText(e.target.value)}
              placeholder="Enter display text..."
              className="bg-white/10 border-white/20"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-6">
          <Button
            onClick={handleUpload}
            disabled={!selectedFile}
            className="flex-1"
          >
            Upload File
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-white/10 border-white/20 hover:bg-white/20"
          >
            Cancel
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          className="hidden"
        />
      </div>
    </div>
  );
};