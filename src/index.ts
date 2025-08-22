#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import { DocumentCache } from './cache.js';
import { extractDocumentMetadata, getGeminiModel, isValidFileType } from './documentParser.js';
import { DocumentMetadata } from './types.js';
import { testGeminiConnection } from './testGemini.js';

const program = new Command();

program
  .name('gemini-summarize')
  .description('Extract metadata from PDF and EPUB files using Google Gemini')
  .version('1.0.0');

program
  .command('analyze <file>')
  .description('Analyze a PDF or EPUB file and extract metadata')
  .option('-m, --model <model>', 'Gemini model to use', 'gemini-2.0-flash')
  .option('--no-cache', 'Skip cache and force re-analysis')
  .action(async (file: string, options: { model: string; cache: boolean }) => {
    try {
      const filePath = path.resolve(file);
      
      // Check if file exists
      if (!(await fs.pathExists(filePath))) {
        console.error(`Error: File not found: ${filePath}`);
        process.exit(1);
      }

      // Check if file type is supported
      if (!isValidFileType(filePath)) {
        console.error(`Error: Unsupported file type. Only PDF and EPUB files are supported.`);
        process.exit(1);
      }

      const cache = new DocumentCache();
      let metadata: DocumentMetadata;

      // Check cache first (unless --no-cache is specified)
      if (options.cache) {
        const cached = await cache.get(filePath);
        if (cached) {
          console.log('📋 Using cached results:');
          printMetadata(cached);
          return;
        }
      }

      console.log(`🔍 Analyzing ${path.basename(filePath)} with ${options.model}...`);
      
      const model = getGeminiModel(options.model);
      const result = await extractDocumentMetadata(filePath, model);
      
      try {
        // Parse the content as JSON to get the metadata
        let content = result.content;
        console.log('📄 Raw Gemini response:', content);
        
        // Remove markdown code blocks if present
        if (content.includes('```json')) {
          content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          console.log('📄 Cleaned JSON:', content);
        }
        
        const parsedData = JSON.parse(content);
        
        // Convert Gemini's response format to our expected format
        metadata = {
          title: {
            value: parsedData.Title || parsedData.title || 'Unknown',
            confidence: parsedData['Confidence Scores']?.Title || parsedData.Title_confidence || parsedData.title?.confidence || 0.5
          },
          author: {
            value: parsedData.Author || parsedData.author || 'Unknown',
            confidence: parsedData['Confidence Scores']?.Author || parsedData.Author_confidence || parsedData.author?.confidence || 0.5
          },
          document_type: {
            value: (parsedData['Document Type'] || parsedData.document_type?.value || 'unknown') as any,
            confidence: parsedData['Confidence Scores']?.['Document Type'] || parsedData['Document Type_confidence'] || parsedData.document_type?.confidence || 0.5
          },
          summary: {
            value: parsedData.Summary || parsedData.summary?.value || 'No summary available',
            confidence: parsedData['Confidence Scores']?.Summary || parsedData.Summary_confidence || parsedData.summary?.confidence || 0.5
          }
        } as DocumentMetadata;
        
        // Save to cache
        await cache.set(filePath, metadata);
        
        console.log('📋 Analysis complete:');
        printMetadata(metadata);
      } catch (error) {
        console.error('❌ Failed to parse document analysis:', error);
        console.error('Raw content:', result.content);
        console.error('Content length:', result.content?.length || 0);
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }
  });

program
  .command('test')
  .description('Test with sample files from Downloads and Desktop')
  .action(async () => {
    const testDirs = [
      path.join(process.env.HOME || '', 'Downloads'),
      path.join(process.env.HOME || '', 'Desktop')
    ];

    const supportedExtensions = ['.pdf', '.epub'];
    const testFiles: string[] = [];

    for (const dir of testDirs) {
      if (await fs.pathExists(dir)) {
        try {
          const files = await fs.readdir(dir);
          for (const file of files) {
            const filePath = path.join(dir, file);
            const ext = path.extname(file).toLowerCase();
            if (supportedExtensions.includes(ext)) {
              testFiles.push(filePath);
            }
          }
        } catch (error) {
          console.warn(`Warning: Could not read directory ${dir}:`, error);
        }
      }
    }

    if (testFiles.length === 0) {
      console.log('No PDF or EPUB files found in Downloads or Desktop directories.');
      return;
    }

    console.log(`Found ${testFiles.length} test files:`);
    for (const file of testFiles) {
      console.log(`  - ${path.basename(file)}`);
    }

    console.log('\nTesting first 3 files...');
    const filesToTest = testFiles.slice(0, 3);

    for (const file of filesToTest) {
      console.log(`\n--- Testing ${path.basename(file)} ---`);
      try {
        const cache = new DocumentCache();
        const cached = await cache.get(file);
        
        if (cached) {
          console.log('📋 Using cached results:');
          printMetadata(cached);
        } else {
          console.log('🔍 Analyzing with Gemini...');
          const model = getGeminiModel();
          const result = await extractDocumentMetadata(file, model);
          
          try {
            // Parse the content as JSON to get the metadata
            let content = result.content;
            console.log('📄 Raw Gemini response:', content);
            
            // Remove markdown code blocks if present
            if (content.includes('```json')) {
              content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
              console.log('📄 Cleaned JSON:', content);
            }
            
            const parsedData = JSON.parse(content);
            
            // Convert Gemini's response format to our expected format
            const metadata = {
              title: {
                value: parsedData.Title || parsedData.title || 'Unknown',
                confidence: parsedData['Confidence Scores']?.Title || parsedData.Title_confidence || parsedData.title?.confidence || 0.5
              },
              author: {
                value: parsedData.Author || parsedData.author || 'Unknown',
                confidence: parsedData['Confidence Scores']?.Author || parsedData.Author_confidence || parsedData.author?.confidence || 0.5
              },
              document_type: {
                value: (parsedData['Document Type'] || parsedData.document_type?.value || 'unknown') as any,
                confidence: parsedData['Confidence Scores']?.['Document Type'] || parsedData['Document Type_confidence'] || parsedData.document_type?.confidence || 0.5
              },
              summary: {
                value: parsedData.Summary || parsedData.summary?.value || 'No summary available',
                confidence: parsedData['Confidence Scores']?.Summary || parsedData.Summary_confidence || parsedData.summary?.confidence || 0.5
              }
            } as DocumentMetadata;
            await cache.set(file, metadata);
            console.log('📋 Analysis complete:');
            printMetadata(metadata);
          } catch (error) {
            console.error('❌ Failed to parse document analysis:', error);
            console.error('Raw content:', result.content);
            console.error('Content length:', result.content?.length || 0);
          }
        }
      } catch (error) {
        console.error('❌ Error analyzing file:', error);
      }
    }
  });

program
  .command('cache')
  .description('Manage cache')
  .option('--clear', 'Clear all cached results')
  .option('--list', 'List all cached files')
  .action(async (options: { clear?: boolean; list?: boolean }) => {
    const cache = new DocumentCache();

    if (options.clear) {
      await cache.clear();
      console.log('✅ Cache cleared');
    } else if (options.list) {
      const files = await cache.list();
      if (files.length === 0) {
        console.log('No cached files');
      } else {
        console.log('Cached files:');
        for (const file of files) {
          console.log(`  - ${path.basename(file)}`);
        }
      }
    } else {
      console.log('Use --clear to clear cache or --list to list cached files');
    }
  });

program
  .command('test-gemini')
  .description('Test Gemini API connection')
  .action(async () => {
    try {
      const success = await testGeminiConnection();
      if (success) {
        console.log('🎉 Gemini API test passed!');
      } else {
        console.log('❌ Gemini API test failed!');
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Test error:', error);
      process.exit(1);
    }
  });

function printMetadata(metadata: DocumentMetadata): void {
  console.log(`📖 Title: ${metadata.title.value} (confidence: ${metadata.title.confidence})`);
  console.log(`👤 Author: ${metadata.author.value} (confidence: ${metadata.author.confidence})`);
  console.log(`📄 Type: ${metadata.document_type.value} (confidence: ${metadata.document_type.confidence})`);
  console.log(`📝 Summary: ${metadata.summary.value} (confidence: ${metadata.summary.confidence})`);
}

program.parse(); 
