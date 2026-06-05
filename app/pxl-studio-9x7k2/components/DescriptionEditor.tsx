"use client";

import { useState } from 'react';
import RichTextEditor from './RichTextEditor';

interface DescriptionEditorProps {
  initialValue: string;
  projectId?: string;
  serviceId?: string;
  name?: string;
}

export default function DescriptionEditor({ initialValue, projectId, serviceId, name = "description" }: DescriptionEditorProps) {
  const [content, setContent] = useState(initialValue || '');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAI = async () => {
    if (!projectId && !serviceId) {
      alert("Please save the item first before using AI generation (requires an ID).");
      return;
    }
    
    setIsGenerating(true);
    try {
      const res = await fetch('/api/admin/generate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, serviceId, name })
      });
      const data = await res.json();
      if (data.success && data.text) {
        setContent(data.text);
      } else {
        alert(data.error || "Failed to generate AI description.");
      }
    } catch(e) {
      console.error(e);
      alert("An error occurred while communicating with the AI.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <input type="hidden" name={name} value={content} />
      <RichTextEditor 
        content={content} 
        onChange={setContent} 
        onGenerateAI={handleGenerateAI}
        isGeneratingAI={isGenerating}
      />
    </>
  );
}
