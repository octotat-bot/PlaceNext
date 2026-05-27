const OpenAI = require('openai');
const Groq = require('groq-sdk');
const pdfParse = require('pdf-parse');
const fs = require('fs');

// Groq client for chatbot (very generous free tier)
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// Gemini client (for resume analysis JSON mode)
const gemini = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
});

// System prompt for resume analysis
const RESUME_ANALYSIS_PROMPT = `You are an expert ATS (Applicant Tracking System) resume analyzer for college placements and internships. 
Analyze the provided resume text thoroughly and provide a comprehensive analysis.

You must respond with ONLY valid JSON in this exact format:
{
  "atsScore": <number between 0-100>,
  "strengths": [<array of 3-5 specific strengths>],
  "weaknesses": [<array of 3-5 specific weaknesses>],
  "missingKeywords": [<array of important missing keywords for tech/software roles>],
  "suggestions": [<array of 5 specific, actionable improvements>],
  "improvedBullets": [<array of 3 example improved bullet points from their experience>]
}

Scoring criteria:
- 90-100: Excellent - Strong for top tech companies
- 80-89: Very Good - Will pass most ATS systems
- 70-79: Good - Some improvements needed
- 60-69: Fair - Significant improvements needed
- Below 60: Needs major revision

Focus on:
- Action verbs and quantifiable achievements
- Technical skills relevance
- Project descriptions and impact
- Education and certifications
- Overall formatting and structure`;

// System prompt for chatbot
const CHATBOT_SYSTEM_PROMPT = `You are a helpful AI placement assistant for a college placement cell. Your role is to help students with:
- Understanding placement policies and procedures
- Company selection processes and what to expect
- Interview preparation tips and strategies
- Eligibility criteria explanations
- Career guidance and job search advice
- Resume and cover letter tips (general)

IMPORTANT GUIDELINES:
1. Be concise, friendly, and professional
2. Only answer placement-related questions
3. If asked about unrelated topics, politely redirect: "I'm here to help with placement-related queries. Is there anything about placements, interviews, or career guidance I can help with?"
4. Use bullet points and clear formatting when listing information
5. Be encouraging and supportive

KNOWLEDGE BASE:
- First-year students can typically only apply for internships
- Minimum CGPA requirement varies by company (usually 6.0-7.5)
- Active backlogs often disqualify students from drives
- Resume should be ATS-friendly, single-page, PDF format
- Common selection process: Online Test → Technical Interview → HR Interview
- Important skills for tech roles: DSA, Programming Languages, System Design, Projects
- Students should prepare for behavioral questions (STAR method)
- Mock interviews and coding practice are highly recommended
- LinkedIn and GitHub profiles are increasingly important
- Networking and referrals can help significantly`;

// Analyze resume using OpenAI
const analyzeResume = async (resumePath) => {
    try {
        // Read and parse PDF
        const pdfBuffer = fs.readFileSync(resumePath);
        // Parse PDF using pdf-parse
        const pdfData = await pdfParse(pdfBuffer);
        const resumeText = pdfData.text;

        if (!resumeText || resumeText.trim().length < 100) {
            throw new Error('Could not extract sufficient text from the resume. Please ensure the PDF contains readable text.');
        }

        // Call Groq (Llama 3) for resume analysis — structured JSON via prompt
        const response = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [
                { role: 'system', content: RESUME_ANALYSIS_PROMPT },
                { role: 'user', content: `Analyze this resume:\n\n${resumeText}` },
            ],
            temperature: 0.3,
            max_tokens: 1500,
            response_format: { type: 'json_object' },
        });

        const content = response.choices[0].message.content;

        // Parse JSON response
        const analysis = JSON.parse(content);

        return {
            success: true,
            analysis,
            resumeText: resumeText.substring(0, 500) + '...', // First 500 chars for reference
        };
    } catch (error) {
        console.error('Resume analysis error:', error);

        if (error.message.includes('API')) {
            return {
                success: false,
                error: 'AI analysis temporarily unavailable. Please try again later.',
            };
        }

        if (error instanceof SyntaxError) {
            return {
                success: false,
                error: 'Failed to parse AI response. Please try again.',
            };
        }

        return {
            success: false,
            error: error.message || 'Failed to analyze resume',
        };
    }
};

// Chat with AI placement assistant
const chatWithAssistant = async (messages, userMessage, retryCount = 0) => {
    try {
        // Prepare conversation history
        // Ensure the conversation history always starts with a 'user' message
        let recentMessages = messages.slice(-10);
        if (recentMessages.length > 0 && recentMessages[0].role === 'assistant') {
            recentMessages = recentMessages.slice(1);
        }

        const conversationHistory = [
            { role: 'system', content: CHATBOT_SYSTEM_PROMPT },
            ...recentMessages.map((msg) => ({
                role: msg.role,
                content: msg.content,
            })),
        ];

        const response = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: conversationHistory,
            temperature: 0.7,
            max_tokens: 500,
        });

        const assistantMessage = response.choices[0].message.content;

        return {
            success: true,
            message: assistantMessage,
        };
    } catch (error) {
        console.error('Chatbot error status:', error.status, error.message);

        // Rate limit hit — wait 2s and retry once
        if (error.status === 429 && retryCount < 1) {
            console.log('Rate limit hit, retrying after 2s...');
            await new Promise((resolve) => setTimeout(resolve, 2000));
            return chatWithAssistant(messages, userMessage, retryCount + 1);
        }

        if (error.status === 429) {
            return {
                success: false,
                error: 'The AI assistant is busy right now (rate limit reached). Please wait a moment and try again.',
            };
        }

        return {
            success: false,
            error: 'AI assistant temporarily unavailable. Please try again later.',
        };
    }
};

module.exports = { analyzeResume, chatWithAssistant };
