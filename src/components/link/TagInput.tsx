import React, { useState } from 'react';
import { Button, Input } from '@/components/ui';

interface TagInputProps {
  onTagAdd: (tag: string) => void;
}

export const TagInput: React.FC<TagInputProps> = ({ onTagAdd }) => {
  const [tag, setTag] = useState('');

  const handleAdd = () => {
    if (tag.trim()) {
      onTagAdd(tag.trim());
      setTag('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <div className="mt-3 flex gap-2">
      <Input
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Enter tag name..."
        className="bg-white/10 border-white/20 text-sm"
        autoFocus
      />
      <Button size="sm" onClick={handleAdd} disabled={!tag.trim()}>
        Add
      </Button>
    </div>
  );
};