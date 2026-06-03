"use client";

import { MessageCircle, Mail } from 'lucide-react';
import styles from './ContactForm.module.css';
import { trackWhatsAppClick, trackEmailClick } from '../../../lib/tracking';

export default function ContactForm() {
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
          <h1 className={styles.title}>Let's <span className={styles.titleAccent}>Create</span><br/>Together</h1>
          <p className={styles.subtitle}>
            Ready to elevate your brand to a cinematic level? Reach out to us directly or fill out the form, and our creative directors will get back to you.
          </p>
          <div className={styles.directAction}>
            <button className={`${styles.actionBtn} ${styles.whatsappBtn}`} onClick={handleWhatsApp}>
              <MessageCircle size={20} /> Chat on WhatsApp
            </button>
            <button className={`${styles.actionBtn} ${styles.emailBtn}`} onClick={handleEmail}>
              <Mail size={20} /> Email Us
            </button>
          </div>
        </div>

        <div className={styles.formSide}>
          <form onSubmit={(e) => {
            e.preventDefault();
            trackEmailClick();
            alert('Thank you! Your message has been sent successfully (mocked).');
          }}>
            <div className={styles.formGroup}>
              <input type="text" placeholder="Your Name" className={styles.input} required />
            </div>
            <div className={styles.formGroup}>
              <input type="email" placeholder="Your Email" className={styles.input} required />
            </div>
            <div className={styles.formGroup}>
              <input type="text" placeholder="Country" className={styles.input} required />
            </div>
            <div className={styles.formGroup}>
              <select className={styles.select} required>
                <option value="">Select Service Needed</option>
                <option value="branding">Branding & Design</option>
                <option value="video">Video Editing</option>
                <option value="animation">2D Animation</option>
                <option value="3d">3D & VFX</option>
                <option value="software">Software Development</option>
                <option value="content">Content Management</option>
                <option value="ads">Performance Marketing</option>
                <option value="ai">AI Solutions</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <textarea placeholder="Tell us about your project..." className={styles.textarea} required></textarea>
            </div>
            <button type="submit" className={styles.submitBtn}>Send Message</button>
          </form>
        </div>
      </div>
    </section>
  );
}
