import { z } from 'zod';
import { ModelDetails, ModelResponse } from 'umwelten/dist/cognition/types.js';
import { Interaction } from 'umwelten/dist/interaction/interaction.js';
import { BaseModelRunner } from 'umwelten/dist/cognition/runner.js';
import { Stimulus } from 'umwelten/dist/interaction/stimulus.js';
import { DocumentMetadataSchema, DocumentMetadata } from './types.js';
import { ApiKeyManager } from './apiKeyManager.js';
import { PDFTruncator } from './pdfTruncator.js';
import path from 'path';

// Create the Stimulus (Prompt)
const documentPrompt = new Stimulus();
documentPrompt.setRole('You are an expert document analyst and metadata extractor.');
documentPrompt.setObjective(`
Given a PDF or EPUB document, extract the following metadata as a JSON object:
- Title: The title of the document
- Author: The author or authors of the document
- Document Type: Whether this is a book, paper, article, or unknown
- Summary: A brief summary of the document content

Analyze the document carefully and provide confidence scores for each field.
`);

// Core extraction function
export async function extractDocumentMetadata(
  filePath: string, 
  model: ModelDetails
): Promise<ModelResponse> {
  // Get API key from 1Password if not set in environment
  const apiKeyManager = ApiKeyManager.getInstance();
  const apiKey = await apiKeyManager.getGeminiApiKey();
  
  // Set the API key in environment for this process
  process.env.GOOGLE_GENERATIVE_AI_API_KEY = apiKey;
  
  let fileToAnalyze = filePath;
  let isTempFile = false;
  
  // For PDFs, create a truncated version for faster analysis
  if (path.extname(filePath).toLowerCase() === '.pdf') {
    const pdfTruncator = PDFTruncator.getInstance();
    fileToAnalyze = await pdfTruncator.createTruncatedPDF(filePath, 3);
    console.log('📄 Using truncated PDF:', fileToAnalyze);
    isTempFile = fileToAnalyze !== filePath;
  }
  
  try {
    console.log('🤖 Creating conversation with Gemini...');
    const conversation = new Interaction(model, documentPrompt.getPrompt());
    
    console.log('📎 Adding file attachment...');
    await conversation.addAttachmentFromPath(fileToAnalyze);
    
    console.log('🏃 Starting Gemini analysis...');
    const runner = new BaseModelRunner();
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Analysis timed out after 60 seconds')), 60000);
    });
    
    const result = await Promise.race([
      runner.generateText(conversation),
      timeoutPromise
    ]);
    
    console.log('✅ Gemini analysis completed successfully');
    console.log('📊 Response metadata:', {
      provider: result.metadata.provider,
      model: result.metadata.model,
      tokenUsage: result.metadata.tokenUsage
    });
    return result;
  } catch (error) {
    console.error('❌ Error during Gemini analysis:', error);
    throw error;
  } finally {
    // Clean up temporary file if we created one
    if (isTempFile) {
      const pdfTruncator = PDFTruncator.getInstance();
      await pdfTruncator.cleanupTempFile(fileToAnalyze);
    }
  }
}

// Function to get Google Gemini model details
export function getGeminiModel(modelName: string = 'gemini-2.0-flash'): ModelDetails {
  return {
    name: modelName,
    provider: 'google'
  };
}

// Function to validate file type
export function isValidFileType(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return ext === '.pdf' || ext === '.epub';
}
