"use client";

import { useTranslation } from '../TranslationProvider';
import { MessageCircle, Mail } from 'lucide-react';
import styles from './ContactForm.module.css';
import { trackWhatsAppClick, trackEmailClick } from '../../../lib/tracking';

export default function ContactForm() {
  const { t } = useTranslation();
  const handleWhatsApp = () => {
    trackWhatsAppClick();
    window.open('https://wa.me/201060107536', '_blank');
  };

  const handleEmail = () => {
    trackEmailClick();
    window.open('mailto:hello@pixelectro.com', '_blank');
  };

  return (
    <section className={styles.contactSection}>
      <div className={styles.container}>
        <div className={styles.infoSide}>
          <h1 className={styles.title} dangerouslySetInnerHTML={{ __html: t('contactPage.title') }} />
          <p className={styles.subtitle}>
            {t('contactPage.subtitle')}
          </p>
          <div className={styles.directAction}>
            <button className={`${styles.actionBtn} ${styles.whatsappBtn}`} onClick={handleWhatsApp}>
              <MessageCircle size={20} /> {t('common.chatOnWhatsapp')}
            </button>
            <button className={`${styles.actionBtn} ${styles.emailBtn}`} onClick={handleEmail}>
              <Mail size={20} /> {t('common.getInTouch')}
            </button>
          </div>
        </div>

        <div className={styles.formSide}>
          <form onSubmit={(e) => {
            e.preventDefault();
            trackEmailClick();
            alert(t('common.messageSent') || 'Thank you! Your message has been sent successfully.');
          }}>
            <div className={styles.formGroup}>
              <input type="text" placeholder={t('contactPage.nameLabel')} className={styles.input} required />
            </div>
            <div className={styles.formGroup}>
              <input type="email" placeholder={t('contactPage.emailLabel')} className={styles.input} required />
            </div>
            <div className={styles.formGroup}>
              <input type="text" placeholder={t('contactPage.countryLabel') || 'Country'} className={styles.input} required />
            </div>
            <div className={styles.formGroup}>
              <select className={styles.select} required>
                <option value="">{t('contactPage.servicePlaceholder') || 'Select Service'}</option>
                <option value="branding">{t('contactPage.services.branding') || 'Branding & Design'}</option>
                <option value="video">{t('contactPage.services.video') || 'Video Editing'}</option>
                <option value="animation">{t('contactPage.services.animation') || '2D Animation'}</option>
                <option value="3d">{t('contactPage.services.threeD') || '3D & VFX'}</option>
                <option value="software">{t('contactPage.services.software') || 'Software Development'}</option>
                <option value="content">{t('contactPage.services.content') || 'Content Management'}</option>
                <option value="ads">{t('contactPage.services.ads') || 'Performance Marketing'}</option>
                <option value="ai">{t('contactPage.services.ai') || 'AI Solutions'}</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <textarea placeholder={t('contactPage.messageLabel')} className={styles.textarea} required></textarea>
            </div>
            <button type="submit" className={styles.submitBtn}>{t('contactPage.sendButton')}</button>
          </form>
        </div>
      </div>
    </section>
  );
}
