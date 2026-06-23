import * as pdfjsLib from 'pdfjs-dist';
import { jsPDF } from 'jspdf';

// Setup PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

export async function compressPdf(file: File, quality = 0.6, scale = 1.5): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async function() {
      try {
        const typedarray = new Uint8Array(reader.result as ArrayBuffer);
        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
        const numPages = pdf.numPages;
        
        let newPdf: jsPDF | null = null;
        
        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale });
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) throw new Error("Could not get canvas context");
          
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          // Render page to canvas
          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;
          
          // Convert canvas to JPEG data URL
          const imgData = canvas.toDataURL('image/jpeg', quality);
          
          // Calculate PDF dimensions (in points, standard PDF unit)
          const pdfWidth = viewport.width / scale * 0.75;
          const pdfHeight = viewport.height / scale * 0.75;
          
          if (i === 1) {
            newPdf = new jsPDF({
              orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
              unit: 'pt',
              format: [pdfWidth, pdfHeight]
            });
          } else {
            newPdf!.addPage([pdfWidth, pdfHeight], pdfWidth > pdfHeight ? 'landscape' : 'portrait');
          }
          
          newPdf!.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        }
        
        if (!newPdf) throw new Error("Failed to create PDF");
        
        const blob = newPdf.output('blob');
        const compressedFile = new File([blob], file.name, { type: 'application/pdf' });
        resolve(compressedFile);
        
      } catch (err) {
        reject(err);
      }
    };
    
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
