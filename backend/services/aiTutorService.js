const OpenAI = require('openai');
const axios = require('axios');

/**
 * AI Tutor Service — Clean abstraction for LLM calls.
 * Supports OpenAI, Hugging Face, and Ollama providers.
 */

const getOpenAI = () => {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('Missing OPENAI_API_KEY for OpenAI provider');
    }
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

/**
 * Call OpenAI API
 * @param {Array} messages - Chat messages array
 * @returns {string} AI response text
 */
const callOpenAI = async (messages) => {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages,
        max_tokens: 300,
        temperature: 0.6,
    });
    return completion.choices[0]?.message?.content;
};

/**
 * Call local Ollama AI
 * @param {Array} messages - Chat messages array
 * @returns {string} AI response text
 */
const callOllama = async (messages) => {
    const prompt = messages
        .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
        .join('\n');

    const response = await axios.post('http://localhost:11434/api/generate', {
        model: process.env.LLM_MODEL || 'llama3',
        prompt: prompt,
        stream: false,
        options: {
            temperature: 0.5,
        },
    });

    return response.data.response;
};

/**
 * Call Hugging Face Inference API (free tier)
 * Includes retry logic for cold model loading (503 errors).
 * @param {Array} messages - Chat messages array
 * @param {number} retries - Number of retries for 503 errors
 * @returns {string} AI response text
 */
const callHuggingFace = async (messages, retries = 3) => {
    const model = process.env.HF_MODEL || 'HuggingFaceH4/zephyr-7b-beta';

    // Build a single prompt from the messages array
    // Strict pattern matching for Mistral models
    const prompt = messages
        .map((m) => {
            if (m.role === 'system') return `[INST] ${m.content} [/INST]`;
            if (m.role === 'user') return `[INST] ${m.content} [/INST]`;
            return m.content;
        })
        .join('\n');

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            console.log(`[AI Tutor] HF request attempt ${attempt + 1}/${retries + 1} to model: ${model}`);

            const response = await axios.post(
                `https://api-inference.huggingface.co/models/${model}`,
                {
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 300,
                        temperature: 0.6,
                        return_full_text: false,
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.HF_TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                    timeout: 60000,
                }
            );

            const text = response.data?.[0]?.generated_text;
            if (text) return text;

            console.warn('[AI Tutor] HF returned empty response:', JSON.stringify(response.data));
            return null;
        } catch (err) {
            const status = err.response?.status;
            const errData = err.response?.data;

            console.error(`[AI Tutor] HF error (attempt ${attempt + 1}):`, status, JSON.stringify(errData || err.message));

            // 503 = model is loading (cold start), retry after waiting
            if (status === 503 && attempt < retries) {
                const waitTime = errData?.estimated_time ? Math.ceil(errData.estimated_time) * 1000 : 15000;
                console.log(`[AI Tutor] Model loading, waiting ${waitTime / 1000}s before retry...`);
                await new Promise((r) => setTimeout(r, waitTime));
                continue;
            }

            throw err;
        }
    }
    return 'The AI model is taking too long to load. Please try again in 30 seconds.';
};

/**
 * Generate a tutor response using the configured LLM provider.
 * @param {Array} messages - Full messages array (system + history + user)
 * @returns {string} AI response text
 */
async function generateTutorResponse(messages) {
    const provider = process.env.LLM_PROVIDER || 'huggingface';

    console.log(`[AI Tutor] Using provider: ${provider}`);

    let aiResponse;

    if (provider === 'openai') {
        aiResponse = await callOpenAI(messages);
    } else if (provider === 'huggingface') {
        aiResponse = await callHuggingFace(messages);
    } else {
        aiResponse = await callOllama(messages);
    }

    if (!aiResponse) {
        aiResponse = 'I apologize, I could not generate a response. Please try again.';
    }

    return aiResponse;
}

module.exports = { generateTutorResponse, callHuggingFace };
