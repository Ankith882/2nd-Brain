import React, { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { TaskLink } from './LinkItem';

interface LinkEditorProps {
  link: TaskLink;
  onSave: (url: string, text: string, description?: string) => void;
  onCancel: () => void;
}

export const LinkEditor: React.FC<LinkEditorProps> = ({
  link,
  onSave,
  onCancel
}) => {
  const [url, setUrl] = useState(link.url);
  const [text, setText] = useState(link.text);
  const [description, setDescription] = useState(link.description || '');

  const handleSave = () => {
    if (url.trim() && text.trim()) {
      onSave(url.trim(), text.trim(), description.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && url.trim() && text.trim()) {
      handleSave();
    }
  };

  return (
    <div className="space-y-3">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Link text"
        className="bg-white/10 border-white/20 text-sm"
        autoFocus
      />
      <Input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="URL"
        className="bg-white/10 border-white/20 text-sm"
      />
      <Input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Description (optional)"
        className="bg-white/10 border-white/20 text-sm"
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={!url.trim() || !text.trim()}>
          Save
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};