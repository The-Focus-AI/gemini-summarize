import { z } from 'zod';

// Define the output schema with Zod
export const DocumentMetadataSchema = z.object({
  title: z.object({
    value: z.string().describe('The title of the document'),
    confidence: z.number().min(0).max(1).describe('Confidence score for title (0-1)'),
  }),
  author: z.object({
    value: z.string().describe('The author of the document'),
    confidence: z.number().min(0).max(1).describe('Confidence score for author (0-1)'),
  }),
  document_type: z.object({
    value: z.enum(['book', 'paper', 'article', 'unknown']).describe('Type of document (book, paper, article, or unknown)'),
    confidence: z.number().min(0).max(1).describe('Confidence score for document type (0-1)'),
  }),
  summary: z.object({
    value: z.string().describe('A brief summary of the document content'),
    confidence: z.number().min(0).max(1).describe('Confidence score for summary (0-1)'),
  }),
});

export type DocumentMetadata = z.infer<typeof DocumentMetadataSchema>;

export interface CacheEntry {
  filePath: string;
  metadata: DocumentMetadata;
  timestamp: number;
  fileHash: string;
} 