import { ApiKeyManager } from './apiKeyManager.js';
import { getGeminiModel } from './documentParser.js';
import { Interaction } from 'umwelten/dist/interaction/interaction.js';
import { BaseModelRunner } from 'umwelten/dist/cognition/runner.js';
import { Stimulus } from 'umwelten/dist/interaction/stimulus.js';
import { z } from 'zod';

// Simple test schema
const TestSchema = z.object({
  message: z.string().describe('A simple test message'),
  timestamp: z.string().describe('Current timestamp')
});

async function testGeminiConnection() {
  try {
    console.log('🧪 Testing Gemini API connection...');
    
    // Get API key
    const apiKeyManager = ApiKeyManager.getInstance();
    const apiKey = await apiKeyManager.getGeminiApiKey();
    console.log('✅ API key retrieved successfully');
    
    // Set environment variable
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = apiKey;
    
    // Create a simple test prompt
    const testPrompt = new Stimulus();
    testPrompt.setRole('You are a helpful assistant.');
    testPrompt.setObjective('Respond with a simple test message.');
    
    // Create conversation
    const model = getGeminiModel();
    const conversation = new Interaction(model, testPrompt.getPrompt());
    conversation.addMessage({
      role: 'user',
      content: 'Say "Hello, this is a test!"'
    });
    
    // Run test with simple text generation instead of structured output
    console.log('🤖 Sending simple text request to Gemini...');
    const runner = new BaseModelRunner();
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Test timed out after 30 seconds')), 30000);
    });
    
    const result = await Promise.race([
      runner.generateText(conversation),
      timeoutPromise
    ]);
    
    console.log('✅ Gemini API test successful!');
    console.log('📄 Response:', result.content);
    
    return true;
  } catch (error) {
    console.error('❌ Gemini API test failed:', error);
    return false;
  }
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testGeminiConnection().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { testGeminiConnection };
