"use client";

import { MessageCircle } from 'lucide-react';
import styles from './WhatsAppWidget.module.css';
import { trackWhatsAppClick } from '../../../lib/tracking';
import { useTranslation } from '../TranslationProvider';

export default function WhatsAppWidget() {
  const { t } = useTranslation();
  const handleClick = () => {
    trackWhatsAppClick();
    window.open('https://wa.me/201060107536', '_blank');
  };

  return (
    <div className={styles.widget} onClick={handleClick} aria-label={t('common.chatOnWhatsapp') || "Chat on WhatsApp"}>
      <MessageCircle size={32} />
    </div>
  );
}
