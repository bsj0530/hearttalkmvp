import { Link, useParams } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { IndexCategories } from "@/constants/index-categories";
import PhotoGrid from "@/components/photo-grid";
import love from "@/assets/image/love.png";
import love2 from "@/assets/image/love-smile.png";
import { sound } from "@/lib/sound";
import muteIcon from "@/assets/image/mute.png";
import volumeIcon from "@/assets/image/volume.png";

type Level = "low" | "mid" | "high";
const CATEGORY_THEME: Record<
  string,
  { bg: string; title: string; sub: string }
> = {
  korean1: { bg: "#BFE9FF", title: "#0B5ED7", sub: "#3366FF" },
  math1: { bg: "#FFE066", title: "#FF8C00", sub: "#F59E0B" },
  korean2: { bg: "#FFD6D6", title: "#FF4F8B", sub: "#EC4899" },
  math2: { bg: "#e2cbf6", title: "#6D28D9", sub: "#A78BFA" },
};
export default function QuizTemplatePage() {
  const { levelId, categoryId } = useParams() as {
    levelId?: Level;
    categoryId?: string;
  };

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
    setIsMuted(!isMuted);
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
          categoryTitle={categoryInfo.title}
          selectedLevel={levelId}
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
