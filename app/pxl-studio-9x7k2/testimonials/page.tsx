import prisma from '@/lib/prisma';
import TestimonialsManager from "./TestimonialsManager";

export default async function TestimonialsPage() {
  const comments = await prisma.testimonialComment.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <div className="pageHeader">
        <div>
          <div className="pageTitle">Testimonials</div>
          <div className="pageSubtitle">
            Moderate and manage client testimonials. New submissions require your approval before appearing publicly.
          </div>
        </div>
      </div>
      <TestimonialsManager initialComments={comments} />
    </>
  );
}
