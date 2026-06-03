"use client";

import { MessageCircle } from 'lucide-react';
import styles from './WhatsAppWidget.module.css';
import { trackWhatsAppClick } from '../../../lib/tracking';

export default function WhatsAppWidget() {
  const handleClick = () => {
    trackWhatsAppClick();
    window.open('https://wa.me/201060107536', '_blank');
  };

  return (
    <div className={styles.widget} onClick={handleClick} aria-label="Chat on WhatsApp">
      <MessageCircle size={32} />
    </div>
  );
}
