import prisma from '@/lib/prisma';
import TestimonialForm from "./TestimonialForm";
import { Quote, Star } from "lucide-react";
import "./testimonials.css";
import { cookies } from "next/headers";
import enDict from "../../locales/en.json";

export async function generateMetadata() {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en';
  let dict: any = enDict;
  try { dict = (await import(`../../locales/${locale}.json`)).default; } catch(e) {}
  
  return {
    title: `${dict.testimonialsPage?.title || enDict.testimonialsPage?.title} | Pixelectro`,
    description: dict.testimonialsPage?.subtitle || enDict.testimonialsPage?.subtitle,
  };
}

export default async function TestimonialsPage() {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en';
  let dict: any = enDict;
  try { dict = (await import(`../../locales/${locale}.json`)).default; } catch(e) {}
  
  const t = (key: string) => dict.testimonialsPage?.[key] || (enDict as any).testimonialsPage?.[key] || key;
  const comments = await prisma.testimonialComment.findMany({
    where: { isHidden: false },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="testimonials-page">
      {/* Hero */}
      <section className="testimonials-hero">
        <div className="testimonials-hero-inner">
          <div className="testimonials-eyebrow">
            <Star size={14} fill="currentColor" />
            <Star size={14} fill="currentColor" />
            <Star size={14} fill="currentColor" />
            <Star size={14} fill="currentColor" />
            <Star size={14} fill="currentColor" />
            <span>{t('eyebrow')}</span>
          </div>
          <h1 className="testimonials-title">{t('title')}</h1>
          <p className="testimonials-subtitle">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="testimonials-grid-section">
        <div className="testimonials-container">
          {comments.length === 0 ? (
            <div className="testimonials-empty">
              <Quote size={48} />
              <p>{t('emptyState')}</p>
            </div>
          ) : (
            <div className="testimonials-grid">
              {comments.map((c, i) => (
                <div key={c.id} className={`testimonial-card ${i % 3 === 1 ? "testimonial-card--featured" : ""}`}>
                  <Quote className="testimonial-quote-icon" size={24} />
                  <p className="testimonial-content">{c.content}</p>
                  <div className="testimonial-author">
                    <div className="testimonial-avatar">
                      {c.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="testimonial-name">{c.authorName}</div>
                      <div className="testimonial-stars">
                        {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Submit Form */}
      <section className="testimonials-form-section">
        <div className="testimonials-container">
          <div className="testimonials-form-wrapper">
            <div className="testimonials-form-header">
              <h2>{t('formTitle')}</h2>
              <p>{t('formDesc')}</p>
            </div>
            <TestimonialForm />
          </div>
        </div>
      </section>
    </div>
  );
}
