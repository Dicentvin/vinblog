import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use flash for speed and free tier generosity
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const PROMPTS = {
  write: (title) =>
    `Write a comprehensive, engaging technical blog post about: "${title}".
    Structure it with:
    - An engaging introduction
    - 3 main sections with ## headings
    - Code examples where relevant
    - A clear conclusion
    Write in a professional but approachable tone for developers.`,

  fix: (content) =>
    `Fix all grammar errors, spelling mistakes, and improve sentence clarity in the following blog content.
    Return ONLY the corrected text with no preamble or explanation:
    
    ${content}`,

  format: (content) =>
    `Improve the formatting and readability of this blog content.
    Use proper markdown headings, bullet points, and code blocks where appropriate.
    Return ONLY the improved content with no preamble:
    
    ${content}`,

  seo: (content, title) =>
    `Analyze this blog content for SEO and return ONLY valid JSON (no markdown, no backticks):
    {
      "score": 75,
      "title_suggestion": "improved title here",
      "meta_description": "150 char description",
      "keywords": ["keyword1", "keyword2", "keyword3"],
      "tips": ["tip1", "tip2", "tip3"]
    }
    
    Title: ${title || 'untitled'}
    Content: ${content || title}`,
};

/**
 * Run an AI writing assistance task using Gemini
 * @param {'write'|'fix'|'format'|'seo'} type
 * @param {string} content
 * @param {string} title
 */
export async function runGeminiAssist(type, content = '', title = '') {
  const prompt = PROMPTS[type]?.(content, title) || PROMPTS.write(title);

  const result   = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}
