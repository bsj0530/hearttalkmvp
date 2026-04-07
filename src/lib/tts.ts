const TTS_API_URL = "https://api.openai.com/v1/audio/speech";

// .env에 VITE_OPENAI_API_KEY 추가 필요
function getApiKey(): string {
  const key = import.meta.env.VITE_OPENAI_API_KEY ?? "";
  if (!key) console.warn("[TTS] VITE_OPENAI_API_KEY가 설정되지 않았습니다.");
  return key;
}

let currentAudio: HTMLAudioElement | null = null;
let currentBlobUrl: string | null = null;
let speakToken = 0;

const JAMO_MAP: Record<string, string> = {
  // 자음
  ㄱ: "기역",
  ㄴ: "니은",
  ㄷ: "디귿",
  ㄹ: "리을",
  ㅁ: "미음",
  ㅂ: "비읍",
  ㅅ: "시옷",
  ㅇ: "이응",
  ㅈ: "지읒",
  ㅊ: "치읓",
  ㅋ: "키읔",
  ㅌ: "티읕",
  ㅍ: "피읖",
  ㅎ: "히읗",

  // 모음
  ㅏ: "아",
  ㅓ: "어",
  ㅗ: "오",
  ㅜ: "우",
  ㅡ: "으",
  ㅣ: "이",
  ㅐ: "애",
  ㅔ: "에",
  ㅑ: "야",
  ㅕ: "여",
  ㅛ: "요",
  ㅠ: "유",
};

function replaceStandaloneJamo(text: string): string {
  return text
    .split(/(\s+|[,.!?()[\]{}"'`~:;/\\|-])/)
    .map((token) => JAMO_MAP[token] ?? token)
    .join("");
}

function normalizeForTTS(text: string): string {
  const cleaned = text
    .replace(/___/g, "빈칸")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/([0-9]+)번/g, "$1 번")
    .replace(/([0-9]+)초/g, "$1 초")
    .replace(/([0-9]+)%/g, "$1 퍼센트")
    .trim();

  return replaceStandaloneJamo(cleaned);
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|(?<=다\.)\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

async function fetchTTSBlob(text: string, apiKey: string): Promise<Blob> {
  const res = await fetch(TTS_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "tts-1",
      voice: "nova",
      input: text,
      speed: 0.9,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`[TTS ${res.status}] ${errText}`);
  }

  return await res.blob();
}

async function playBlob(blob: Blob, token: number): Promise<void> {
  if (token !== speakToken) return;

  const url = URL.createObjectURL(blob);
  currentBlobUrl = url;

  const audio = new Audio(url);
  currentAudio = audio;

  await new Promise<void>((resolve, reject) => {
    audio.onended = () => {
      if (currentAudio === audio) currentAudio = null;
      if (currentBlobUrl === url) {
        URL.revokeObjectURL(url);
        currentBlobUrl = null;
      }
      resolve();
    };

    audio.onerror = () => {
      if (currentAudio === audio) currentAudio = null;
      if (currentBlobUrl === url) {
        URL.revokeObjectURL(url);
        currentBlobUrl = null;
      }
      reject(new Error("오디오 재생 실패"));
    };

    audio.play().catch(reject);
  });
}

export async function speakKorean(text: string): Promise<void> {
  stopSpeaking();
  const token = ++speakToken;

  const normalized = normalizeForTTS(text);
  if (!normalized) return;

  const apiKey = getApiKey();
  if (!apiKey) {
    fallbackSpeak(normalized);
    return;
  }

  try {
    const chunks = splitSentences(normalized);

    for (const chunk of chunks) {
      if (token !== speakToken) return;

      const blob = await fetchTTSBlob(chunk, apiKey);
      await playBlob(blob, token);
    }
  } catch (err) {
    console.warn("[TTS] API/재생 에러, 폴백 사용:", err);
    fallbackSpeak(normalized);
  }
}

export function stopSpeaking(): void {
  speakToken++;

  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  if (currentBlobUrl) {
    URL.revokeObjectURL(currentBlobUrl);
    currentBlobUrl = null;
  }

  window.speechSynthesis?.cancel();
}

// 브라우저 내장 TTS 폴백
function fallbackSpeak(text: string): void {
  if (!window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "ko-KR";
  utter.rate = 0.85;
  utter.pitch = 1.0;

  window.speechSynthesis.speak(utter);
}
