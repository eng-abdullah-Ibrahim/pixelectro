"use client";

import React, { useState, useEffect, useRef } from 'react';
import s from './ColorPicker.module.css';

const DEFAULT_COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#00FFFF', '#FF00FF', '#C0C0C0', '#808080',
  '#800000', '#808000', '#008000', '#800080', '#008080',
  '#000080', '#FFA500', '#A52A2A', '#800000', '#1565D8'
];

type ColorPickerProps = {
  onSelectColor: (hex: string) => void;
  onClose: () => void;
};

export default function ColorPicker({ onSelectColor, onClose }: ColorPickerProps) {
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [hexInput, setHexInput] = useState('#000000');
  const popupRef = useRef<HTMLDivElement>(null);

  // Fetch saved colors on mount
  useEffect(() => {
    fetch('/api/admin/settings?key=customColors')
      .then(res => res.json())
      .then(data => {
        if (data.value) {
          try {
            setCustomColors(JSON.parse(data.value));
          } catch(e) {}
        }
      });
  }, []);

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const saveCustomColor = async (color: string) => {
    const newColors = [color, ...customColors.filter(c => c !== color)].slice(0, 10);
    setCustomColors(newColors);
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'customColors', value: JSON.stringify(newColors) })
    });
  };

  const handleEyeDropper = async () => {
    if (!('EyeDropper' in window)) {
      alert('EyeDropper is not supported in your browser.');
      return;
    }
    try {
      const eyeDropper = new (window as any).EyeDropper();
      const result = await eyeDropper.open();
      setHexInput(result.sRGBHex);
      onSelectColor(result.sRGBHex);
      saveCustomColor(result.sRGBHex);
    } catch (e) {
      console.error(e);
    }
  };

  const handleApplyHex = () => {
    if (/^#[0-9A-F]{6}$/i.test(hexInput)) {
      onSelectColor(hexInput);
      saveCustomColor(hexInput);
    } else {
      alert('Invalid HEX color');
    }
  };

  return (
    <div className={s.pickerPopup} ref={popupRef}>
      <div className={s.section}>
        <div className={s.label}>Native Picker / HEX</div>
        <div className={s.hexRow}>
          <input 
            type="color" 
            value={hexInput} 
            onChange={(e) => setHexInput(e.target.value)} 
            className={s.nativeInput}
          />
          <input 
            type="text" 
            value={hexInput} 
            onChange={(e) => setHexInput(e.target.value)} 
            className={s.hexTextInput}
            placeholder="#000000"
          />
          <button onClick={handleApplyHex} className={s.applyBtn}>Apply</button>
        </div>
        <button onClick={handleEyeDropper} className={s.eyedropperBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2.5l7 7-2 2-7-7 2-2zM4 14.5L14.5 4l5.5 5.5L9.5 20 2 22l2-7.5z"/></svg>
          Pick from screen
        </button>
      </div>

      <div className={s.section}>
        <div className={s.label}>Default Colors</div>
        <div className={s.colorGrid}>
          {DEFAULT_COLORS.map(c => (
            <button 
              key={c} 
              className={s.colorSwatch} 
              style={{ backgroundColor: c }}
              onClick={() => onSelectColor(c)}
              title={c}
            />
          ))}
        </div>
      </div>

      <div className={s.section}>
        <div className={s.label}>Saved Colors</div>
        <div className={s.colorGrid}>
          {customColors.length === 0 && <span className={s.emptyMsg}>No saved colors yet</span>}
          {customColors.map(c => (
            <button 
              key={c} 
              className={s.colorSwatch} 
              style={{ backgroundColor: c }}
              onClick={() => onSelectColor(c)}
              title={c}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
