import { useMemo, useState } from "react";
import { CARD_COLORS, type QuizData } from "@/constants/photo-items";
import confetti from "canvas-confetti";

import kittyisland2 from "@/assets/image/kittyisland2.png";
import hindoongyi from "@/assets/image/hindoongyi.webp";
import doraamog from "@/assets/image/doraamog.webp";
import bulibuli from "@/assets/image/bulibuli.svg";
import ironman from "@/assets/image/ironman.webp";
import hurk from "@/assets/image/hurk.png";
import joker from "@/assets/image/joker.png";

import toad from "@/assets/image/toad.webp";
import tails from "@/assets/image/tails.webp";
import sonic from "@/assets/image/sonic.webp";
import shadow from "@/assets/image/shadow.webp";
import pickachu from "@/assets/image/pickachu.png";
import nucles from "@/assets/image/nucles.webp";
import frozen2 from "@/assets/image/frozen2.png";
import frozen1 from "@/assets/image/frozen1.png";
import fox2 from "@/assets/image/fox2.webp";
import fox from "@/assets/image/fox.webp";
import edy from "@/assets/image/edy.png";
import doctor from "@/assets/image/doctor.webp";
import deadpool from "@/assets/image/deadpool.webp";

import zzanggu from "@/assets/image/zzanggu.png";
import yinagongju from "@/assets/image/yinagongju.webp";
import simpsons from "@/assets/image/simpsons.webp";
import PowerpuffGirls from "@/assets/image/PowerpuffGirls.webp";
import pororo from "@/assets/image/pororo.webp";
import pobi from "@/assets/image/pobi.webp";
import pin from "@/assets/image/pin.svg";
import Panda from "@/assets/image/Panda.webp";
import MickeyMouse from "@/assets/image/MickeyMouse.svg";
import loopy from "@/assets/image/loopy.webp";
import jake from "@/assets/image/jake.svg";
import frozen12 from "@/assets/image/frozen12.png";
import bate from "@/assets/image/bate.webp";
import backsulgongju from "@/assets/image/backsulgongju.webp";

/* ── 새 캐릭터 ── */
import zooble from "@/assets/image/zooble.png";
import Pomni from "@/assets/image/Pomni.webp";
import Kaufmo from "@/assets/image/Kaufmo.webp";
import Jax from "@/assets/image/Jax.png";
import girl from "@/assets/image/girl.png";

import correctSfx from "@/assets/sounds/correct.mp3";
import wrongSfx from "@/assets/sounds/wrong.mp3";

/* ── 카테고리 테마 (뒷면) ── */

type CoopThemeKey =
  | "chapter1"
  | "chapter2"
  | "chapter3"
  | "chapter4"
  | "default";

type CoopTheme = {
  key: CoopThemeKey;
  gradientBorder: string;
  overlayBorder: string;
  topGlow: string;
  optionBorder: string;
  optionHoverBg: string;
  blankBg: string;
};

function normalizeCategory(raw: any) {
  return String(raw ?? "")
    .trim()
    .toLowerCase();
}

function getCoopTheme(rawCategory: any): CoopTheme {
  const c = normalizeCategory(rawCategory);

  if (c.includes("chapter1"))
    return {
      key: "chapter1",
      gradientBorder:
        "bg-gradient-to-br from-[#0B5ED7] via-[#3B82F6] to-[#BFE9FF]",
      overlayBorder: "border-sky-400",
      topGlow:
        "bg-gradient-to-r from-sky-500/25 via-blue-500/20 to-cyan-500/25",
      optionBorder: "border-sky-200",
      optionHoverBg: "hover:bg-sky-100",
      blankBg: "bg-sky-100",
    };

  if (c.includes("chapter2"))
    return {
      key: "chapter2",
      gradientBorder:
        "bg-gradient-to-br from-[#B45309] via-[#F59E0B] to-[#FFE066]",
      overlayBorder: "border-amber-400",
      topGlow:
        "bg-gradient-to-r from-amber-500/25 via-yellow-400/25 to-orange-400/20",
      optionBorder: "border-amber-200",
      optionHoverBg: "hover:bg-amber-100",
      blankBg: "bg-amber-100",
    };

  if (c.includes("chapter3"))
    return {
      key: "chapter3",
      gradientBorder:
        "bg-gradient-to-br from-[#FF4F8B] via-[#EC4899] to-[#FFD6D6]",
      overlayBorder: "border-rose-400",
      topGlow:
        "bg-gradient-to-r from-rose-500/25 via-pink-500/20 to-fuchsia-500/20",
      optionBorder: "border-rose-200",
      optionHoverBg: "hover:bg-rose-100",
      blankBg: "bg-rose-100",
    };

  if (c.includes("chapter4"))
    return {
      key: "chapter4",
      gradientBorder:
        "bg-gradient-to-br from-[#6D28D9] via-[#A78BFA] to-[#EDE9FE]",
      overlayBorder: "border-purple-400",
      topGlow:
        "bg-gradient-to-r from-purple-500/25 via-violet-400/20 to-fuchsia-500/20",
      optionBorder: "border-purple-200",
      optionHoverBg: "hover:bg-purple-100",
      blankBg: "bg-purple-100",
    };

  return {
    key: "default",
    gradientBorder: "bg-gradient-to-br from-white/40 via-white/20 to-white/40",
    overlayBorder: "border-slate-300",
    topGlow: "bg-gradient-to-r from-white/20 via-white/10 to-white/20",
    optionBorder: "border-slate-200",
    optionHoverBg: "hover:bg-slate-100",
    blankBg: "bg-slate-100",
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
  if (c.includes("blue"))
    return pickRandom([
      sonic,
      frozen1,
      frozen12,
      pororo,
      MickeyMouse,
      Pomni,
      bulibuli,
    ]);
  if (c.includes("sky"))
    return pickRandom([frozen2, backsulgongju, girl, kittyisland2]);
  if (c.includes("yellow") || c.includes("amber"))
    return pickRandom([pickachu, tails, jake, simpsons, pobi, Jax, hindoongyi]);
  if (c.includes("orange"))
    return pickRandom([fox, fox2, toad, zzanggu, Kaufmo, doraamog]);
  if (c.includes("green"))
    return pickRandom([nucles, Panda, bulibuli, hurk, joker]);
  if (c.includes("red"))
    return pickRandom([
      deadpool,
      shadow,
      PowerpuffGirls,
      loopy,
      zooble,
      doraamog,
      ironman,
    ]);
  if (c.includes("violet") || c.includes("purple"))
    return pickRandom([edy, yinagongju, pin, Pomni, kittyisland2]);
  if (c.includes("indigo")) return pickRandom([doctor, bate, Jax, hindoongyi]);
  return pickRandom([frozen1, frozen2, girl]);
}
/* ── 컴포넌트 ── */

type FlipCard3DProps = {
  quiz: QuizData;
  index: number;
  onCardShown?: (index: number) => void;
  onAnswer?: (
    index: number,
    selectedOption: string,
    isCorrect: boolean,
  ) => void;
  onCorrect?: (index: number, selectedOption: string) => void;
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
    () => CARD_COLORS[Math.floor(Math.random() * CARD_COLORS.length)],
    [quiz?.id],
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
  const [typedAnswer, setTypedAnswer] = useState("");

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
    setTypedAnswer("");
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

    onAnswer?.(index, option, isCorrect);

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

  const handleTypingSubmit = () => {
    const trimmed = typedAnswer.trim();
    if (!trimmed) return;
    const isCorrect = trimmed === quiz.answer;

    onAnswer?.(index, trimmed, isCorrect);

    if (isCorrect) {
      playSound(correctAudio);
      setFeedback("🍬 정답입니다!");
      triggerConfetti();
      setTimeout(() => {
        setShowOverlay(false);
        resetCardState();
        onCorrect?.(index, trimmed);
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
        onWrong?.(index, trimmed);
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
              <div
                className={`relative flex min-h-full flex-col items-center p-6 md:p-10 ${
                  displayImage && !imgFailed
                    ? "justify-start"
                    : "justify-center"
                }`}
              >
                <button
                  onClick={handleClose}
                  className="absolute top-6 right-6 z-50 rounded-full bg-black/10 px-3 py-2 text-lg font-black hover:bg-black/20"
                >
                  ✕
                </button>

                <div className="w-full max-w-5xl text-center">
                  {displayImage && !imgFailed ? (
                    <img
                      src={displayImage}
                      alt={`퀴즈: ${quiz.question}`}
                      className="mx-auto mb-4 max-h-[40vh] w-auto rounded-2xl object-contain shadow-2xl md:mb-7 md:max-h-96"
                      loading="eager"
                      onError={() => {
                        setImgFailed(true);
                      }}
                    />
                  ) : null}

                  <h2
                    className={`px-2 font-extrabold break-keep ${
                      displayImage && !imgFailed
                        ? "mb-6 text-3xl leading-snug md:mb-8 md:text-4xl"
                        : "mb-10 text-4xl leading-relaxed md:mb-12 md:text-5xl"
                    }`}
                  >
                    {quiz.question.split("___").map((part, i, arr) => (
                      <span key={i}>
                        {part}
                        {i < arr.length - 1 && (
                          <span
                            className={`mx-2 inline-block rounded-lg border-2 align-middle ${
                              coopTheme.optionBorder
                            } ${coopTheme.blankBg} ${
                              displayImage && !imgFailed
                                ? "h-12 w-28"
                                : "h-14 w-32"
                            }`}
                          />
                        )}
                      </span>
                    ))}
                  </h2>

                  {safeOptions.length > 0 ? (
                    <div className="mt-70 grid grid-cols-1 gap-5 md:grid-cols-2">
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
                    <div className="flex flex-col items-center gap-6">
                      <div
                        className={`flex min-h-[72px] w-full max-w-lg items-center justify-center rounded-2xl border-4 px-8 py-5 text-4xl font-extrabold ${coopTheme.optionBorder} ${coopTheme.blankBg}`}
                      >
                        {typedAnswer || (
                          <span className="text-slate-300">
                            정답을 입력하세요
                          </span>
                        )}
                      </div>

                      <div className="grid w-full max-w-lg grid-cols-4 gap-3">
                        {[
                          "1",
                          "2",
                          "3",
                          "<",
                          "4",
                          "5",
                          "6",
                          ">",
                          "7",
                          "8",
                          "9",
                          "=",
                        ].map((key) => (
                          <button
                            key={key}
                            onClick={() => setTypedAnswer((prev) => prev + key)}
                            className={`rounded-xl border-2 py-4 text-3xl font-black transition-all active:scale-95 ${coopTheme.optionBorder} ${coopTheme.optionHoverBg} bg-white`}
                          >
                            {key}
                          </button>
                        ))}
                        <button
                          onClick={() => setTypedAnswer((prev) => prev + "0")}
                          className={`col-span-2 rounded-xl border-2 py-4 text-3xl font-black transition-all active:scale-95 ${coopTheme.optionBorder} ${coopTheme.optionHoverBg} bg-white`}
                        >
                          0
                        </button>
                        <button
                          onClick={() =>
                            setTypedAnswer((prev) => prev.slice(0, -1))
                          }
                          className="rounded-xl border-2 border-slate-300 bg-slate-100 py-4 text-2xl font-black transition-all hover:bg-slate-200 active:scale-95"
                        >
                          ⌫
                        </button>
                        <button
                          onClick={handleTypingSubmit}
                          disabled={!typedAnswer.trim()}
                          className={`rounded-xl py-4 text-2xl font-black text-white transition-all active:scale-95 disabled:opacity-40 ${coopTheme.gradientBorder}`}
                        >
                          확인
                        </button>
                      </div>
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
