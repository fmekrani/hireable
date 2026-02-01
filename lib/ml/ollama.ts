import axios from 'axios';

const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'mistral';

/**
 * Generate text using Ollama (running locally)
 * Requires: ollama pull mistral (or other model)
 */
export async function generateWithOllama(prompt: string): Promise<string> {
  try {
    const response = await axios.post(
      `${OLLAMA_API_URL}/api/generate`,
      {
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
        temperature: 0.7,
      },
      {
        timeout: 60000, // 60 second timeout for generation
      }
    );

    return response.data.response || '';
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED') {
      throw new Error(
        `Ollama is not running. Start it with: ollama serve`
      );
    }
    throw error;
  }
}

/**
 * Check if Ollama is available
 */
export async function isOllamaAvailable(): Promise<boolean> {
  try {
    const response = await axios.get(`${OLLAMA_API_URL}/api/tags`, {
      timeout: 5000,
    });
    return response.status === 200;
  } catch {
    return false;
  }
}

/**
 * Parse JSON from Ollama response (sometimes has extra text)
 */
export function parseJSONFromResponse(response: string): any {
  try {
    // Try direct parse first
    return JSON.parse(response);
  } catch {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }

    // Try to find JSON object in response
    const objectMatch = response.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      return JSON.parse(objectMatch[0]);
    }

    // Try array
    const arrayMatch = response.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      return JSON.parse(arrayMatch[0]);
    }

    throw new Error('Could not extract JSON from response');
  }
}
