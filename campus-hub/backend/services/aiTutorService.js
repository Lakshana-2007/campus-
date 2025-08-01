const OpenAI = require('openai');
const axios = require('axios');

/**
 * AI Tutor Service — Clean abstraction for LLM calls.
 * Supports OpenAI, Hugging Face (serverless chat completions), and Ollama providers.
 */

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Call OpenAI API
 */
const callOpenAI = async (messages) => {
    const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages,
        max_tokens: 500,
        temperature: 0.6,
    });
    return completion.choices[0]?.message?.content;
};

/**
 * Call local Ollama AI
 */
const callOllama = async (messages) => {
    const prompt = messages
        .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
        .join('\n');

    const response = await axios.post('http://localhost:11434/api/generate', {
        model: process.env.LLM_MODEL || 'llama3',
        prompt,
        stream: false,
        options: { temperature: 0.5 },
    });

    return response.data.response;
};

/**
 * Call Hugging Face using the newer serverless chat-completions endpoint.
 * This endpoint supports role-based messages (system/user/assistant) and is
 * far more reliable than the old text-generation inference API.
 *
 * Compatible free models (set HF_MODEL in .env):
 *   - mistralai/Mistral-7B-Instruct-v0.3     (recommended, very capable)
 *   - HuggingFaceH4/zephyr-7b-beta
 *   - meta-llama/Llama-3.2-3B-Instruct       (fast & free)
 *   - Qwen/Qwen2.5-7B-Instruct
 */
const callHuggingFace = async (messages, retries = 2) => {
    const model = process.env.HF_MODEL || 'mistralai/Mistral-7B-Instruct-v0.3';
    const token = process.env.HF_TOKEN;

    if (!token) {
        throw new Error('HF_TOKEN is not set in .env');
    }

    // Use the newer serverless inference chat completions API
    const url = `https://api-inference.huggingface.co/models/${model}/v1/chat/completions`;

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            console.log(`[AI Tutor] HF chat attempt ${attempt + 1}/${retries + 1} → ${model}`);

            const response = await axios.post(
                url,
                {
                    model,
                    messages,
                    max_tokens: 500,
                    temperature: 0.6,
                    stream: false,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    timeout: 60000,
                }
            );

            const text = response.data?.choices?.[0]?.message?.content;
            if (text && text.trim()) {
                console.log('[AI Tutor] HF responded successfully.');
                return text.trim();
            }

            console.warn('[AI Tutor] HF empty response body:', JSON.stringify(response.data));
            return null;
        } catch (err) {
            const status = err.response?.status;
            const errData = err.response?.data;

            console.error(
                `[AI Tutor] HF error (attempt ${attempt + 1}):`,
                status,
                JSON.stringify(errData || err.message)
            );

            // 503 = model cold-starting, wait and retry
            if (status === 503 && attempt < retries) {
                const waitMs = errData?.estimated_time
                    ? Math.ceil(errData.estimated_time) * 1000
                    : 20000;
                console.log(`[AI Tutor] Model loading — waiting ${waitMs / 1000}s...`);
                await new Promise((r) => setTimeout(r, waitMs));
                continue;
            }

            // 429 = rate limited — wait fixed time
            if (status === 429 && attempt < retries) {
                console.log('[AI Tutor] Rate limited — waiting 10s...');
                await new Promise((r) => setTimeout(r, 10000));
                continue;
            }

            throw err;
        }
    }

    return null; // Trigger fallback in caller
};

/**
 * Fallback tutor response using a local knowledge base.
 * Always returns a useful, relevant answer when AI is unavailable.
 */
const getFallbackTutorResponse = (message) => {
    const msg = message.toLowerCase();

    const qaDatabase = [
        {
            keys: ['assignment', 'deadline', 'due date'],
            answer: 'Check the **Assignments** page to see all your assignments, their deadlines, and submission status. You can enable notifications to get reminders before deadlines.',
        },
        {
            keys: ['submit', 'submission', 'upload'],
            answer: 'To submit an assignment:\n1. Go to the **Assignments** page\n2. Click on the assignment\n3. Upload your file(s)\n4. Click **Submit** before the deadline\n\nMake sure your file is the correct format specified by your faculty.',
        },
        {
            keys: ['plagiarism', 'copy', 'originality'],
            answer: 'Plagiarism is taken seriously. Always write in your own words and cite sources properly. You can check your **Plagiarism Report** after submitting to see your originality score.',
        },
        {
            keys: ['grade', 'marks', 'score', 'feedback', 'result'],
            answer: 'Your grades and feedback are available on the **Assignments** page after faculty review. Faculty typically review submissions within a few days of the deadline.',
        },
        {
            keys: ['attendance', 'absent', 'present', 'percentage'],
            answer: 'View your attendance on the **Attendance** page. Universities typically require **75% minimum** attendance. Low attendance may affect placement eligibility.',
        },
        {
            keys: ['job', 'internship', 'placement', 'apply', 'company'],
            answer: 'Browse available jobs on the **Placements** page. You can filter by company, role, and salary. Apply for positions that match your skills and eligibility criteria.',
        },
        {
            keys: ['resume', 'cv', 'profile', 'skills'],
            answer: 'Keep your **Profile & Resume** updated:\n- Add all your skills and projects\n- Include certifications and achievements\n- A strong resume increases your placement chances significantly',
        },
        {
            keys: ['interview', 'preparation', 'prepare'],
            answer: '**Interview Preparation Tips:**\n1. Research the company thoroughly\n2. Practice common interview questions\n3. Review your technical skills\n4. Prepare 2-3 project stories (STAR method)\n5. Check interview schedules in Placements → Interview Lists',
        },
        {
            keys: ['study', 'learn', 'understand', 'concept', 'explain'],
            answer: 'For effective studying:\n- Break complex topics into smaller chunks\n- Use the **Pomodoro technique** (25 min focus + 5 min break)\n- Create mind maps for concepts\n- Practice with examples\n- Ask your faculty during office hours',
        },
        {
            keys: ['gpa', 'cgpa', 'improve grades'],
            answer: '**To improve your CGPA:**\n1. Attend all classes regularly\n2. Submit assignments on time\n3. Study consistently, not just before exams\n4. Seek help from faculty early when struggling\n5. Form study groups with classmates',
        },
        {
            keys: ['time management', 'schedule', 'procrastinat', 'busy', 'organize'],
            answer: '**Time Management Strategy:**\n1. Create a weekly timetable with fixed study slots\n2. Break large tasks into smaller milestones\n3. Use the **Assignments page** to track deadlines\n4. Tackle difficult tasks when your energy is highest\n5. Leave buffer time before deadlines',
        },
        {
            keys: ['event', 'seminar', 'workshop', 'conference'],
            answer: 'Check the campus events section to find upcoming seminars and workshops. Attending events boosts your professional network and can open internship opportunities.',
        },
        {
            keys: ['message', 'chat', 'contact', 'talk'],
            answer: 'Use the **Messages** section to communicate with faculty, coordinators, and peers on the platform. You can start new conversations directly from the messaging hub.',
        },
        {
            keys: ['help', 'stuck', 'confused', 'don\'t understand'],
            answer: 'I\'m here to help! Could you be more specific about what you\'re struggling with?\n\nI can assist with:\n- **Assignments & submissions**\n- **Attendance & grades**\n- **Placement preparation**\n- **Study planning**\n- **Concept explanations**\n- **Time management**',
        },
    ];

    for (const entry of qaDatabase) {
        if (entry.keys.some((k) => msg.includes(k))) {
            return entry.answer;
        }
    }

    return `I can help you with academic topics! Here's what I can assist with:

- 📚 **Assignments** — deadlines, submissions, plagiarism checks
- 📊 **Attendance** — tracking and improvement tips
- 💼 **Placements** — job search, resume tips, interview prep
- 📖 **Study Skills** — concept explanations, study plans
- ⏰ **Time Management** — scheduling and productivity
- 💬 **Events & Messaging** — campus activities and communication

Try asking me something like: *"Help me prepare for interviews"* or *"Explain recursion with examples"*`;
};

/**
 * Generate a tutor response using the configured LLM provider.
 * Falls back gracefully to the local knowledge base if the AI is unavailable.
 */
async function generateTutorResponse(messages) {
    const provider = (process.env.LLM_PROVIDER || 'huggingface').toLowerCase();

    console.log(`[AI Tutor] Provider: ${provider}`);

    let aiResponse = null;

    try {
        if (provider === 'openai') {
            aiResponse = await callOpenAI(messages);
        } else if (provider === 'huggingface') {
            aiResponse = await callHuggingFace(messages);
        } else {
            aiResponse = await callOllama(messages);
        }
    } catch (error) {
        console.error('[AI Tutor] Provider error — using fallback KB:', error.message);
    }

    // If AI returned nothing, use fallback knowledge base
    if (!aiResponse || !aiResponse.trim()) {
        console.log('[AI Tutor] Using fallback knowledge base.');
        const userMessage = messages.findLast((m) => m.role === 'user')?.content || '';
        aiResponse = getFallbackTutorResponse(userMessage);
    }

    return aiResponse;
}

module.exports = { generateTutorResponse };
