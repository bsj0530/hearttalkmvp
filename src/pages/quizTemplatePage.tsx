import { Link, useParams } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { IndexCategories } from "@/constants/index-categories";
import PhotoGrid from "@/components/photo-grid";
import love from "@/assets/image/love.png";
import love2 from "@/assets/image/love-smile.png";
import { sound } from "@/lib/sound";
import muteIcon from "@/assets/image/mute.png";
import volumeIcon from "@/assets/image/volume.png";
import type { Level, LowMode } from "@/lib/photo-grid.types";

const CATEGORY_THEME: Record<
  string,
  { bg: string; title: string; sub: string }
> = {
  chapter1: {
    bg: "#FFF9D2",
    title: "#7C6A00",
    sub: "#A89400",
  },
  chapter2: {
    bg: "#FFEBCC",
    title: "#A85C00",
    sub: "#D97706",
  },
  chapter3: {
    bg: "#BFDDF0",
    title: "#256D9C",
    sub: "#3F8DCA",
  },
  chapter4: {
    bg: "#8CC0EB",
    title: "#155C93",
    sub: "#256D9C",
  },
};

const LEVEL_VALUES: Level[] = [
  "level1",
  "level2",
  "level3",
  "level4",
  "level5",
  "level6",
];

function isLevel(value: string | undefined): value is Level {
  return !!value && LEVEL_VALUES.includes(value as Level);
}

function normalizeLevel(value: string | undefined): Level | undefined {
  if (!value) return undefined;

  // 새 6단계 URL
  if (isLevel(value)) return value;

  // 기존 low/mid/high URL 임시 호환
  if (value === "low") return "level1";
  if (value === "mid") return "level3";
  if (value === "high") return "level5";

  return undefined;
}

function normalizeLowMode(value: string | undefined): LowMode | undefined {
  if (value === "text") return "text";
  if (value === "voice") return "voice";
  return undefined;
}

export default function QuizTemplatePage() {
  const params = useParams<{
    levelId?: string;
    lowMode?: string;
    categoryId?: string;
  }>();

  const categoryId = params.categoryId;
  const levelId = normalizeLevel(params.levelId);
  const routeLowMode = normalizeLowMode(params.lowMode);

  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    sound.startBgm();

    return () => {
      sound.stopBgm();
    };
  }, []);

  const toggleBgm = () => {
    if (isMuted) {
      sound.startBgm();
    } else {
      sound.stopBgm();
    }

    setIsMuted((prev) => !prev);
  };

  const theme = useMemo(() => {
    if (categoryId && CATEGORY_THEME[categoryId]) {
      return CATEGORY_THEME[categoryId];
    }

    return { bg: "#FFFFFF", title: "#111827", sub: "#6B7280" };
  }, [categoryId]);

  const categoryInfo = categoryId
    ? IndexCategories.find((c) => c.id === categoryId)
    : null;

  const resolvedLowMode: LowMode | undefined =
    levelId === "level1" ? (routeLowMode ?? "voice") : undefined;

  let renderBody: React.ReactNode;

  if (!categoryId || !levelId) {
    renderBody = (
      <div className="flex h-screen items-center justify-center text-xl font-bold text-gray-500">
        잘못된 경로입니다. 😢
      </div>
    );
  } else if (!categoryInfo) {
    renderBody = (
      <div className="flex h-screen items-center justify-center text-xl font-bold text-gray-500">
        존재하지 않는 카테고리입니다. 😢 (categoryId: {categoryId})
      </div>
    );
  } else {
    renderBody = (
      <div className="flex h-[calc(100vh-60px)] flex-col items-center overflow-hidden py-4">
        <div className="mb-3 text-center">
          <h1
            className="text-5xl font-bold tracking-wide"
            style={{ color: theme.title }}
          >
            {categoryInfo.title}
          </h1>

          <p className="mt-2 text-xl" style={{ color: theme.sub }}>
            카드를 골라보세요
          </p>
        </div>

        <PhotoGrid
          categoryTitle={categoryInfo.id}
          selectedLevel={levelId}
          lowMode={resolvedLowMode}
          titleColor={theme.title}
        />
      </div>
    );
  }

  return (
    <div
      className="h-screen w-full overflow-hidden"
      style={{ backgroundColor: theme.bg }}
    >
      <header className="sticky top-0 z-50 h-[60px] w-full">
        <div className="mx-auto flex h-full w-full items-center justify-between px-[3%] md:px-[4%]">
          <Link to="/" className="group flex items-center gap-1">
            <div className="relative h-7 w-10">
              <img
                src={love}
                className="absolute h-full w-full object-contain transition-opacity duration-300 group-hover:opacity-0"
                alt="logo"
              />

              <img
                src={love2}
                className="absolute h-full w-full object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                alt="logo hover"
              />
            </div>

            <div className="text-xl font-bold">Heart Talk</div>
          </Link>

          <button
            onClick={toggleBgm}
            className="grid h-9 w-9 place-items-center rounded-xl transition hover:bg-black/10 active:scale-95"
            aria-label={isMuted ? "소리 켜기" : "소리 끄기"}
            type="button"
          >
            <img
              src={isMuted ? muteIcon : volumeIcon}
              alt={isMuted ? "음소거" : "소리 켜짐"}
              className="h-6 w-6 object-contain"
            />
          </button>
        </div>
      </header>

      {renderBody}
    </div>
  );
}
