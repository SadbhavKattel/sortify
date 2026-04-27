import AsyncStorage from '@react-native-async-storage/async-storage';

// The Gemini API key will be stored as an environment variable called GEMINI_API_KEY.
// In a React Native environment, this might be handled by a babel plugin or similar.
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || ''; 
const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent';

export interface AIScoreResult {
  score: number;
  event: {
    title: string;
    date: string;
    time: string;
    duration_minutes: number;
  } | null;
}

const CACHE_KEY = 'ai_email_scores_v2';

export async function getCachedScores(): Promise<Record<string, AIScoreResult>> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch (e) {
    return {};
  }
}

export async function saveCachedScores(scores: Record<string, AIScoreResult>) {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(scores));
  } catch (e) {
    console.error('Failed to save cached scores', e);
  }
}

export async function scoreEmailWithGemini(
  senderEmail: string,
  subject: string,
  bodySnippet: string,
  retries = 4
): Promise<AIScoreResult | null> {
  if (!GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is not set');
    return null;
  }

  const prompt = `You are an email importance classifier. Score this email from 0 to 5.
5 = critical and time-sensitive: fraud alerts, account breaches, exam deadlines, important meetings, payment failures, legal notices, medical appointments.
0 = not important: newsletters, promotions, social media notifications, receipts for small purchases.
Also consider sender authenticity — a score of 5 should only come from legitimate-looking email domains that match the content (e.g. bank fraud from noreply@chase.com, not from randomgmail123@gmail.com).
If the email contains a meeting, exam, deadline, or appointment with a detectable date and time, extract it.
Return ONLY a JSON object in this exact format, no explanation:
{"score": 4, "event": null}
or if there is an event (regardless of the score):
{"score": 3, "event": {"title": "Math Exam", "date": "2025-05-10", "time": "09:00", "duration_minutes": 60}}
If time is unknown, use "09:00". If duration is unknown, use 60.

Sender email: ${senderEmail}
Subject: ${subject}
Body snippet: ${bodySnippet.substring(0, 300)}`;

  let attempt = 0;
  while (attempt <= retries) {
    try {
      const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            response_mime_type: "application/json",
          }
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          attempt++;
          if (attempt > retries) {
            console.log('Gemini API rate limit reached and max retries exceeded for:', senderEmail);
            return null;
          }
          console.log(`Rate limit 429. Retrying attempt ${attempt} for: ${senderEmail}`);
          await new Promise(resolve => setTimeout(resolve, attempt * 5000));
          continue;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const cleanJson = text.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanJson);
      }
    } catch (error: any) {
      console.warn('Gemini API error for email:', senderEmail, error);
      return null;
    }
  }

  return null;
}

/**
 * Process a batch of emails for AI scoring.
 * Only scores the first 15 (as requested) if they haven't been scored yet.
 * Uses Promise.all for parallel calls.
 */
export async function processEmailsForAI(
  emails: any[],
  onProgress?: (emails: any[]) => void
): Promise<any[]> {
  const cachedScores = await getCachedScores();
  const updatedScores = { ...cachedScores };
  let needsSync = false;

  // Rule: Score the first 15 emails fetched, AND any email that is marked as a Deadline
  const emailsToScore = emails.filter((email, index) => 
    !updatedScores[email.id] && (index < 15 || email.urgencyReasons === 'Deadline')
  );

  if (emailsToScore.length > 0) {
    for (const email of emailsToScore) {
      const result = await scoreEmailWithGemini(
        email.senderEmail || email.senderName, // Fallback to senderName if email not available
        email.subject,
        email.snippet
      );
      if (result !== null) {
        updatedScores[email.id] = result;
        needsSync = true;
        // Trigger UI update progressively
        if (onProgress) {
          onProgress(emails.map(e => ({
            ...e,
            aiScore: updatedScores[e.id]?.score || 0,
            aiEvent: updatedScores[e.id]?.event || null
          })));
        }
      }
      // Delay to avoid hitting strict rate limit
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  if (needsSync) {
    await saveCachedScores(updatedScores);
  }

  // Map scores back to the full email list
  return emails.map(email => ({
    ...email,
    aiScore: updatedScores[email.id]?.score || 0,
    aiEvent: updatedScores[email.id]?.event || null
  }));
}
