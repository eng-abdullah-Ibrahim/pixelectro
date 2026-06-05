"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { useState, useEffect } from 'react';
import { Sparkles, Plus, Eraser } from 'lucide-react';

// 20 clear distinct colors in a 10x2 grid
const PRESET_COLORS = [
  // Row 1 – darks & neutrals
  '#000000', '#1a1a1a', '#374151', '#6b7280', '#9ca3af',
  '#d1d5db', '#f3f4f6', '#ffffff', '#7c3aed', '#1d4ed8',
  // Row 2 – vivid colors
  '#dc2626', '#ea580c', '#d97706', '#16a34a', '#0891b2',
  '#2563eb', '#9333ea', '#db2777', '#f59e0b', '#10b981',
];

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  onGenerateAI?: () => void;
  isGeneratingAI?: boolean;
}

// Inline SVG icons for a more premium look than lucide defaults
function BoldIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6 4h8a4 4 0 0 1 0 8H6V4Z"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={active ? 0 : 2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 12h9a4.5 4.5 0 0 1 0 9H6V12Z"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={active ? 0 : 2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ItalicIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="19" y1="4" x2="10" y2="4" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round"/>
      <line x1="14" y1="20" x2="5" y2="20" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round"/>
      <line x1="15" y1="4" x2="9" y2="20" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round"/>
    </svg>
  );
}

function UnderlineIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 4v6a6 6 0 0 0 12 0V4" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="4" y1="21" x2="20" y2="21" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round"/>
    </svg>
  );
}

export default function RichTextEditor({ content, onChange, onGenerateAI, isGeneratingAI }: RichTextEditorProps) {
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#dc2626');

  useEffect(() => {
    fetch('/api/admin/colors')
      .then(r => r.json())
      .then(data => { if (data.colors) setCustomColors(data.colors); })
      .catch(() => {});
  }, []);

  const saveCustomColor = async (color: string) => {
    if (customColors.includes(color)) return;
    const newColors = [color, ...customColors].slice(0, 10);
    setCustomColors(newColors);
    await fetch('/api/admin/colors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ colors: newColors }),
    }).catch(() => {});
  };

  const deleteCustomColor = async (colorToDelete: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newColors = customColors.filter(c => c !== colorToDelete);
    setCustomColors(newColors);
    await fetch('/api/admin/colors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ colors: newColors }),
    }).catch(() => {});
  };

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, TextStyle, Color, Underline],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'rte-content',
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="rte-skeleton">
        <div className="rte-skeleton-toolbar" />
        <div className="rte-skeleton-body" />
      </div>
    );
  }

  const applyColor = (color: string) => {
    editor.chain().focus().setColor(color).run();
    setShowColorPicker(false);
  };

  const handleAddCustomColor = () => {
    applyColor(selectedColor);
    saveCustomColor(selectedColor);
  };

  const activeColor = editor.getAttributes('textStyle').color || '#000000';

  return (
    <div className="rte-wrapper">
      {/* ── TOOLBAR ─────────────────────────────────── */}
      <div className="rte-toolbar">

        {/* Group 1: Text formatting */}
        <div className="rte-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`rte-btn ${editor.isActive('bold') ? 'rte-btn-active' : ''}`}
            title="Bold (Ctrl+B)"
          >
            <BoldIcon active={editor.isActive('bold')} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`rte-btn ${editor.isActive('italic') ? 'rte-btn-active' : ''}`}
            title="Italic (Ctrl+I)"
          >
            <ItalicIcon active={editor.isActive('italic')} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`rte-btn ${editor.isActive('underline') ? 'rte-btn-active' : ''}`}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon active={editor.isActive('underline')} />
          </button>
        </div>

        <div className="rte-divider" />

        {/* Group 2: Color picker */}
        <div className="rte-group rte-color-group">
          <button
            type="button"
            onClick={() => setShowColorPicker(v => !v)}
            className="rte-btn rte-color-btn"
            title="Text Color"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 21h18L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <line x1="5.5" y1="15" x2="18.5" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span
              className="rte-color-swatch"
              style={{ backgroundColor: activeColor }}
            />
          </button>

          {showColorPicker && (
            <div className="rte-color-panel">
              {/* Default colors */}
              <div className="rte-color-section-label">Default Colors</div>
              <div className="rte-color-grid">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    className="rte-swatch-btn"
                    style={{ backgroundColor: color }}
                    onClick={() => applyColor(color)}
                    title={color}
                  >
                    {activeColor === color && (
                      <svg width="10" height="10" viewBox="0 0 10 10">
                        <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>

              {/* Custom colors */}
              {customColors.length > 0 && (
                <>
                  <div className="rte-color-section-label" style={{ marginTop: '12px' }}>
                    Custom Colors <span style={{ opacity: 0.5 }}>({customColors.length}/10)</span>
                  </div>
                  <div className="rte-color-grid">
                    {customColors.map(color => (
                      <button
                        key={color}
                        type="button"
                        className="rte-swatch-btn"
                        style={{ backgroundColor: color, position: 'relative', overflow: 'visible' }}
                        onClick={() => applyColor(color)}
                        title={color}
                      >
                        <span
                          onClick={(e) => deleteCustomColor(color, e)}
                          style={{
                            position: 'absolute', top: -5, right: -5, background: '#ef4444', color: 'white',
                            borderRadius: '50%', width: '14px', height: '14px', fontSize: '10px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.3)', zIndex: 10
                          }}
                          title="Delete color"
                        >
                          ×
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Add custom color */}
              <div className="rte-color-add-row">
                <div className="rte-custom-color-preview" style={{ backgroundColor: selectedColor }}>
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={e => setSelectedColor(e.target.value)}
                    className="rte-color-input"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddCustomColor}
                  className="rte-add-color-btn"
                >
                  <Plus size={13} /> Add & Apply
                </button>
              </div>

              {/* Remove color */}
              <button
                type="button"
                onClick={() => { editor.chain().focus().unsetColor().run(); setShowColorPicker(false); }}
                className="rte-remove-color-btn"
              >
                <Eraser size={12} /> Remove Color
              </button>
            </div>
          )}
        </div>

        {/* Group 3: AI Generate (optional) */}
        {onGenerateAI && (
          <>
            <div className="rte-divider rte-divider-push" />
            <button
              type="button"
              onClick={onGenerateAI}
              disabled={isGeneratingAI}
              className="rte-ai-btn"
              title="Generate description with AI"
            >
              <Sparkles size={13} className={isGeneratingAI ? 'rte-spin' : ''} />
              {isGeneratingAI ? 'Generating…' : 'AI Generate'}
            </button>
          </>
        )}
      </div>

      {/* ── EDITOR BODY ─────────────────────────────── */}
      <div
        className="rte-body"
        onClick={() => editor.chain().focus().run()}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
