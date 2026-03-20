import { useMemo, useState } from "react";
import { CARD_COLORS, type QuizData } from "@/constants/photo-items";
import confetti from "canvas-confetti";

import blue from "@/assets/image/blue.webp";
import yellow from "@/assets/image/yellow.webp";
import pink from "@/assets/image/pink.webp";
import purple from "@/assets/image/purple.webp";
import green from "@/assets/image/green.webp";
import green2 from "@/assets/image/green2.webp";
import orange from "@/assets/image/oren.webp";
import red from "@/assets/image/raddy.webp";
import sky from "@/assets/image/sky.webp";
import black from "@/assets/image/black.webp";

import correctSfx from "@/assets/sounds/correct.mp3";
import wrongSfx from "@/assets/sounds/wrong.mp3";

/* ── 카테고리 테마 (뒷면) ── */

type CoopThemeKey = "publicPlace" | "school" | "house" | "korean4" | "default";

type CoopTheme = {
  key: CoopThemeKey;
  gradientBorder: string;
  overlayBorder: string;
  topGlow: string;
  optionBorder: string;
  optionHoverBg: string;
};

function normalizeCategory(raw: any) {
  return String(raw ?? "")
    .trim()
    .toLowerCase();
}

function getCoopTheme(rawCategory: any): CoopTheme {
  const c = normalizeCategory(rawCategory);

  if (c.includes("public") || c.includes("공공"))
    return {
      key: "publicPlace",
      gradientBorder:
        "bg-gradient-to-br from-[#0B5ED7] via-[#3B82F6] to-[#BFE9FF]",
      overlayBorder: "border-sky-400",
      topGlow:
        "bg-gradient-to-r from-sky-500/25 via-blue-500/20 to-cyan-500/25",
      optionBorder: "border-sky-200",
      optionHoverBg: "hover:bg-sky-100",
    };

  if (c.includes("school") || c.includes("학교"))
    return {
      key: "school",
      gradientBorder:
        "bg-gradient-to-br from-[#B45309] via-[#F59E0B] to-[#FFE066]",
      overlayBorder: "border-amber-400",
      topGlow:
        "bg-gradient-to-r from-amber-500/25 via-yellow-400/25 to-orange-400/20",
      optionBorder: "border-amber-200",
      optionHoverBg: "hover:bg-amber-100",
    };

  if (c.includes("house") || c.includes("가정"))
    return {
      key: "house",
      gradientBorder:
        "bg-gradient-to-br from-[#FF4F8B] via-[#EC4899] to-[#FFD6D6]",
      overlayBorder: "border-rose-400",
      topGlow:
        "bg-gradient-to-r from-rose-500/25 via-pink-500/20 to-fuchsia-500/20",
      optionBorder: "border-rose-200",
      optionHoverBg: "hover:bg-rose-100",
    };

  if (c.includes("국어") || c.includes("korean"))
    return {
      key: "korean4",
      gradientBorder:
        "bg-gradient-to-br from-[#6D28D9] via-[#A78BFA] to-[#EDE9FE]",
      overlayBorder: "border-purple-400",
      topGlow:
        "bg-gradient-to-r from-purple-500/25 via-violet-400/20 to-fuchsia-500/20",
      optionBorder: "border-purple-200",
      optionHoverBg: "hover:bg-purple-100",
    };

  return {
    key: "default",
    gradientBorder: "bg-gradient-to-br from-white/40 via-white/20 to-white/40",
    overlayBorder: "border-slate-300",
    topGlow: "bg-gradient-to-r from-white/20 via-white/10 to-white/20",
    optionBorder: "border-slate-200",
    optionHoverBg: "hover:bg-slate-100",
  };
}

/* ── 앞면 색상 ── */

function getGradientBorderFromColorClass(colorClass: string) {
  const c = (colorClass || "").toLowerCase();
  if (c.includes("blue") || c.includes("sky") || c.includes("cyan"))
    return "bg-gradient-to-br from-[#003366] via-[#3366FF] to-[#99CCFF]";
  if (c.includes("yellow") || c.includes("amber"))
    return "bg-gradient-to-br from-[#B45309] via-[#F59E0B] to-[#FDE047]";
  if (c.includes("green") || c.includes("emerald"))
    return "bg-gradient-to-br from-[#065F46] via-[#10B981] to-[#A7F3D0]";
  if (c.includes("orange"))
    return "bg-gradient-to-br from-[#9A3412] via-[#F97316] to-[#FDBA74]";
  if (c.includes("indigo"))
    return "bg-gradient-to-br from-[#0B1026] via-[#1E2A78] to-[#93C5FD]";
  if (c.includes("violet") || c.includes("purple"))
    return "bg-gradient-to-br from-[#3B0764] via-[#7C3AED] to-[#E9D5FF]";
  if (c.includes("red") || c.includes("rose") || c.includes("pink"))
    return "bg-gradient-to-br from-[#9D174D] via-[#EC4899] to-[#FBCFE8]";
  return "bg-gradient-to-br from-white/40 via-white/20 to-white/40";
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getFrontImageFromColorClass(colorClass: string) {
  const c = (colorClass || "").toLowerCase();
  if (c.includes("blue")) return blue;
  if (c.includes("sky")) return sky;
  if (c.includes("yellow") || c.includes("amber")) return yellow;
  if (c.includes("orange")) return orange;
  if (c.includes("green")) return pickRandom([green, green2]);
  if (c.includes("red")) return red;
  if (c.includes("violet") || c.includes("purple")) return purple;
  if (c.includes("indigo")) return black;
  return pink;
}

/* ── 컴포넌트 ── */

type FlipCard3DProps = {
  quiz: QuizData;
  index: number;
  onCardShown?: (index: number) => void;
  /** 옵션 클릭 즉시 발동 (애니메이션 전) */
  onAnswer?: (
    index: number,
    selectedOption: string,
    isCorrect: boolean,
  ) => void;
  /** 정답 애니메이션 완료 후 발동 (800ms 후) */
  onCorrect?: (index: number, selectedOption: string) => void;
  /** 오답 애니메이션 완료 후 발동 (450ms 후) */
  onWrong?: (index: number, selectedOption: string) => void;
};

export const FlipCard3D = ({
  quiz,
  index,
  onCardShown,
  onAnswer,
  onCorrect,
  onWrong,
}: FlipCard3DProps) => {
  const colorClass = useMemo(
    () => CARD_COLORS[index % CARD_COLORS.length],
    [index],
  );
  const frontGradientBorder = useMemo(
    () => getGradientBorderFromColorClass(colorClass),
    [colorClass],
  );
  const frontImage = useMemo(
    () => getFrontImageFromColorClass(colorClass),
    [colorClass],
  );

  const coopTheme = useMemo(() => {
    const raw = (quiz as any).category ?? (quiz as any).category_id ?? "";
    return getCoopTheme(raw);
  }, [quiz]);

  const displayImage = quiz.image_url || (quiz as any).image_url || null;
  const backFallbackImage = useMemo(
    () => getFrontImageFromColorClass(colorClass),
    [colorClass],
  );

  const safeOptions: string[] = (() => {
    if (Array.isArray(quiz.options)) return quiz.options.map(String);
    if (typeof quiz.options === "string") {
      try {
        const parsed = JSON.parse(quiz.options);
        return Array.isArray(parsed) ? parsed.map(String) : [];
      } catch {
        return [];
      }
    }
    return [];
  })();

  const getOptionTextStyle = (option: string) => {
    const len = option.replace(/\s/g, "").length;
    if (len >= 28) return { fontSize: "1.15rem", lineHeight: "1.25" };
    if (len >= 20) return { fontSize: "1.35rem", lineHeight: "1.25" };
    if (len >= 14) return { fontSize: "1.55rem", lineHeight: "1.3" };
    return { fontSize: "1.75rem", lineHeight: "1.35" };
  };

  const [isFlipped, setIsFlipped] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [wrongFlash, setWrongFlash] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [showExplosionVisual, setShowExplosionVisual] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const correctAudio = useMemo(() => {
    const a = new Audio(correctSfx as unknown as string);
    a.preload = "auto";
    a.volume = 0.9;
    return a;
  }, []);
  const wrongAudio = useMemo(() => {
    const a = new Audio(wrongSfx as unknown as string);
    a.preload = "auto";
    a.volume = 0.9;
    return a;
  }, []);

  const playSound = (a: HTMLAudioElement) => {
    try {
      a.pause();
      a.currentTime = 0;
      void a.play();
    } catch (e) {
      // ignore
    }
  };

  const handleClick = () => {
    correctAudio.load();
    wrongAudio.load();
    setImgFailed(false);
    setIsFlipped(true);
    setTimeout(() => setShowOverlay(true), 10);
    onCardShown?.(index);
  };

  const resetCardState = () => {
    setIsFlipped(false);
    setSelectedAnswer(null);
    setFeedback(null);
    setWrongFlash(false);
    setIsShaking(false);
    setShowExplosionVisual(false);
    setImgFailed(false);
  };

  const handleClose = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setShowOverlay(false);
    setTimeout(() => resetCardState(), 700);
  };

  const triggerConfetti = () => {
    confetti({
      origin: { x: 0.5, y: 0.5 },
      zIndex: 10000,
      particleCount: 85,
      spread: 360,
      startVelocity: 52,
      colors: ["#FF69B4", "#FFD700", "#00FFFF", "#FFA07A", "#ADFF2F"],
      shapes: ["circle", "square"],
      scalar: 2.0,
      ticks: 115,
      gravity: 0.7,
      decay: 0.9,
    });
  };

  const triggerBomb = () => {
    setShowExplosionVisual(true);
    setTimeout(() => setShowExplosionVisual(false), 500);
    confetti({
      origin: { x: 0.5, y: 0.5 },
      zIndex: 10000,
      disableForReducedMotion: true,
      particleCount: 65,
      spread: 360,
      startVelocity: 52,
      colors: ["#FF0000", "#FF4500", "#FFD700"],
      shapes: ["star", "square", "circle"],
      scalar: 5.0,
      ticks: 60,
      decay: 0.9,
      gravity: 0,
    });
  };

  const handleOptionClick = (option: string) => {
    setSelectedAnswer(option);
    const isCorrect = option === quiz.answer;

    // ① 즉시 발동 — 로깅용 (answer + feedback_start)
    onAnswer?.(index, option, isCorrect);

    // ② 애니메이션 + 딜레이 후 발동
    if (isCorrect) {
      playSound(correctAudio);
      setFeedback("🍬 정답입니다!");
      triggerConfetti();
      setTimeout(() => {
        setShowOverlay(false);
        resetCardState();
        onCorrect?.(index, option);
      }, 800);
    } else {
      playSound(wrongAudio);
      setFeedback("😢 펑! 오답입니다.");
      setWrongFlash(true);
      setIsShaking(true);
      triggerBomb();
      setTimeout(() => {
        setWrongFlash(false);
        setIsShaking(false);
        setShowOverlay(false);
        resetCardState();
        onWrong?.(index, option);
      }, 450);
    }
  };

  const isCorrectFeedback = feedback === "🍬 정답입니다!";

  return (
    <>
      <style>{`
        @keyframes shake-bomb { 0%, 100% { transform: translateX(0) rotateY(180deg); } 10%,30%,50%,70%,90% { transform: translateX(-10px) rotateY(180deg); } 20%,40%,60%,80% { transform: translateX(10px) rotateY(180deg); } }
        .animate-shake-bomb { animation: shake-bomb 0.4s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes boom-scale { 0% { transform: scale(0.5); opacity: 0; } 50% { transform: scale(1.5); opacity: 1; } 100% { transform: scale(2.0); opacity: 0; } }
        .animate-boom { animation: boom-scale 0.4s ease-out forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div
        className="perspective-1000 relative h-full w-full cursor-pointer"
        onClick={handleClick}
      >
        <div
          className={[
            "relative h-full w-full rounded-2xl p-[5px]",
            "shadow-md transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-xl",
            frontGradientBorder,
          ].join(" ")}
        >
          <div
            className={[
              "relative h-full w-full overflow-hidden rounded-[14px]",
              "ring-1 ring-white/45",
              colorClass,
            ].join(" ")}
          >
            {frontImage && (
              <img
                src={frontImage}
                alt={`카드: ${quiz.question}`}
                className="absolute top-1/2 left-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 object-contain opacity-90"
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            <div className="pointer-events-none absolute inset-0 opacity-12">
              <div className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-white" />
              <div className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-black" />
            </div>
          </div>
        </div>
      </div>

      {isFlipped && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-500 ${showOverlay ? "opacity-100" : "pointer-events-none opacity-0"}`}
        >
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={handleClose}
          />

          {showExplosionVisual && (
            <div className="pointer-events-none absolute inset-0 z-[10001] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 animate-pulse bg-white/40 mix-blend-overlay" />
              <div className="animate-boom text-[14rem] leading-none drop-shadow-2xl select-none">
                💥
              </div>
            </div>
          )}

          <div
            className={`transform-style-preserve-3d relative h-[95%] w-[95vw] max-w-6xl transition-transform duration-700 ${showOverlay ? "rotate-y-180" : "rotate-y-0"}`}
          >
            <div
              className={[
                "no-scrollbar absolute h-full w-full rotate-y-180 overflow-auto rounded-2xl border-8 bg-white text-slate-900 shadow-2xl transition-all duration-200 backface-hidden",
                coopTheme.overlayBorder,
                wrongFlash ? "!bg-red-600 !text-white" : "",
                isShaking ? "animate-shake-bomb" : "",
              ].join(" ")}
            >
              <div className={`h-4 w-full ${coopTheme.topGlow}`} />

              <div className="relative flex min-h-full flex-col items-center justify-start p-6 md:p-10">
                <button
                  onClick={handleClose}
                  className="absolute top-6 right-6 z-50 rounded-full bg-black/10 px-3 py-2 text-lg font-black hover:bg-black/20"
                >
                  ✕
                </button>

                <div className="mt-4 w-full max-w-5xl text-center">
                  {(displayImage && !imgFailed) || backFallbackImage ? (
                    <img
                      src={
                        displayImage && !imgFailed
                          ? displayImage
                          : backFallbackImage
                      }
                      alt={`퀴즈: ${quiz.question}`}
                      className="mx-auto mb-4 max-h-[40vh] w-auto rounded-2xl object-contain shadow-2xl md:mb-7 md:max-h-96"
                      loading="eager"
                      onError={() => {
                        setImgFailed(true);
                      }}
                    />
                  ) : null}

                  <h2 className="mb-6 px-2 text-3xl leading-snug font-extrabold break-keep md:mb-8 md:text-4xl">
                    {quiz.question}
                  </h2>

                  {safeOptions.length > 0 ? (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      {safeOptions.map((option, i) => {
                        const isSel = selectedAnswer === option;
                        const isAns = option === quiz.answer;
                        const st = isSel
                          ? isAns
                            ? "border-emerald-300 bg-emerald-500 text-white shadow-inner"
                            : "scale-95 border-slate-900 bg-slate-900 text-slate-300 shadow-inner"
                          : `bg-white ${coopTheme.optionBorder} ${coopTheme.optionHoverBg} hover:shadow-lg`;
                        return (
                          <button
                            key={`${index}-${i}-${option}`}
                            onClick={() => handleOptionClick(option)}
                            className={`rounded-2xl border-2 px-6 py-5 font-extrabold transition-all ${st}`}
                            style={getOptionTextStyle(option)}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-lg text-slate-700">
                      보기 데이터가 없어요.
                    </div>
                  )}

                  {feedback && (
                    <div
                      className={`mt-8 text-3xl font-black ${isCorrectFeedback ? "animate-bounce text-yellow-400" : "text-white drop-shadow-md"}`}
                    >
                      {feedback}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
