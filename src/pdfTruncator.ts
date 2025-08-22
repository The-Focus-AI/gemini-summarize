import fs from 'fs-extra';
import path from 'path';
import { PDFDocument } from 'pdf-lib';

export class PDFTruncator {
  private static instance: PDFTruncator;
  private tempDir: string;

  private constructor() {
    this.tempDir = path.join(process.cwd(), '.cache', 'temp');
  }

  static getInstance(): PDFTruncator {
    if (!PDFTruncator.instance) {
      PDFTruncator.instance = new PDFTruncator();
    }
    return PDFTruncator.instance;
  }

  async createTruncatedPDF(inputPath: string, maxPages: number = 3): Promise<string> {
    try {
      await fs.ensureDir(this.tempDir);
      
      const tempPath = path.join(this.tempDir, `truncated_${Date.now()}.pdf`);
      
      // Read the PDF file
      const pdfBytes = await fs.readFile(inputPath);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      
      // Create a new PDF with only the first few pages
      const newPdfDoc = await PDFDocument.create();
      const pageCount = Math.min(pdfDoc.getPageCount(), maxPages);
      
      for (let i = 0; i < pageCount; i++) {
        const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i]);
        newPdfDoc.addPage(copiedPage);
      }
      
      // Save the truncated PDF
      const newPdfBytes = await newPdfDoc.save();
      await fs.writeFile(tempPath, newPdfBytes);
      
      console.log(`📄 Created truncated PDF with ${pageCount} pages for faster analysis`);
      console.log(`📁 Stored at: ${tempPath}`);
      return tempPath;
    } catch (error) {
      console.warn('Failed to create truncated PDF, using original file:', error);
      return inputPath;
    }
  }

  async cleanupTempFile(filePath: string): Promise<void> {
    try {
      if (filePath.includes('.cache/temp/') && await fs.pathExists(filePath)) {
        await fs.remove(filePath);
      }
    } catch (error) {
      console.warn('Failed to cleanup temp file:', error);
    }
  }

  async cleanupAllTempFiles(): Promise<void> {
    try {
      if (await fs.pathExists(this.tempDir)) {
        await fs.remove(this.tempDir);
      }
    } catch (error) {
      console.warn('Failed to cleanup temp directory:', error);
    }
  }
}
