"use client";

import { MessageCircle } from 'lucide-react';
import styles from './WhatsAppWidget.module.css';

export default function WhatsAppWidget() {
  const handleClick = () => {
    // Log WhatsApp click event
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'WHATSAPP_CLICK',
        targetId: 'whatsapp_widget',
        targetName: 'WhatsApp Contact Widget',
      }),
    }).catch(err => console.error('WhatsApp track error:', err));

    window.open('https://wa.me/201060107536', '_blank');
  };

  return (
    <div className={styles.widget} onClick={handleClick} aria-label="Chat on WhatsApp">
      <MessageCircle size={32} />
    </div>
  );
}
