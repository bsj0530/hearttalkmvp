export default function BackgroundLogin() {
  return (
    <div className="fixed inset-0 -z-10 h-full w-full overflow-hidden bg-white">
      {/* ================= TOP AREA ================= */}

      <div className="absolute top-[6%] left-[15%] h-10 w-10 animate-bounce rounded-full bg-[#aee6ff] opacity-40 [animation-duration:5s]" />
      <div className="absolute top-[8%] left-[45%] h-6 w-6 animate-pulse rounded-full bg-[#ffb3c7] opacity-30 [animation-duration:3s]" />
      <div className="absolute top-[10%] right-[18%] h-12 w-12 animate-bounce rounded-full bg-[#aee6ff] opacity-35 [animation-duration:6s]" />
      <div className="absolute top-[18%] right-[35%] h-5 w-5 animate-pulse rounded-full bg-[#ffb3c7] opacity-25 [animation-duration:2.5s]" />
      <div className="absolute top-[14%] left-[28%] h-14 w-14 animate-bounce rounded-full bg-[#ffb3c7] opacity-35 [animation-duration:5.5s]" />
      <div className="absolute top-[20%] left-[60%] h-6 w-6 rounded-full bg-[#aee6ff] opacity-25" />

      {/* ================= MIDDLE LEFT ================= */}

      <div className="absolute top-[40%] left-[6%] h-12 w-12 animate-bounce rounded-full bg-[#aee6ff] opacity-35 [animation-duration:4.8s]" />
      <div className="absolute top-[55%] left-[14%] h-6 w-6 animate-pulse rounded-full bg-[#ffb3c7] opacity-25 [animation-duration:3s]" />
      <div className="absolute top-[48%] left-[18%] h-8 w-8 animate-bounce rounded-full bg-[#ffb3c7] opacity-30 [animation-duration:5s]" />

      {/* ================= MIDDLE RIGHT ================= */}

      <div className="absolute top-[42%] right-[6%] h-12 w-12 animate-bounce rounded-full bg-[#ffb3c7] opacity-35 [animation-duration:5s]" />
      <div className="absolute top-[58%] right-[14%] h-6 w-6 animate-pulse rounded-full bg-[#aee6ff] opacity-25 [animation-duration:3s]" />
      <div className="absolute top-[50%] right-[18%] h-8 w-8 animate-bounce rounded-full bg-[#aee6ff] opacity-30 [animation-duration:5.5s]" />

      {/* ================= BOTTOM AREA ================= */}

      <div className="absolute bottom-[20%] left-[20%] h-14 w-14 animate-bounce rounded-full bg-[#aee6ff] opacity-35 [animation-duration:6s]" />
      <div className="absolute bottom-[12%] left-[45%] h-6 w-6 animate-pulse rounded-full bg-[#ffb3c7] opacity-25 [animation-duration:3s]" />
      <div className="absolute right-[30%] bottom-[8%] h-10 w-10 animate-bounce rounded-full bg-[#aee6ff] opacity-30 [animation-duration:5s]" />
      <div className="absolute right-[12%] bottom-[25%] h-12 w-12 animate-bounce rounded-full bg-[#ffb3c7] opacity-40 [animation-duration:5.5s]" />
      <div className="absolute right-[45%] bottom-[15%] h-5 w-5 animate-pulse rounded-full bg-[#aee6ff] opacity-25 [animation-duration:2.5s]" />
      <div className="absolute bottom-[6%] left-[10%] h-8 w-8 rounded-full bg-[#ffb3c7] opacity-30" />

      {/* ================= CENTER SIDE AREA ================= */}

      <div className="absolute top-[38%] left-[26%] h-14 w-14 animate-bounce rounded-full bg-[#aee6ff] opacity-35 [animation-duration:5s]" />
      <div className="absolute top-[58%] left-[28%] h-10 w-10 animate-bounce rounded-full bg-[#ffb3c7] opacity-30 [animation-duration:6s]" />
      <div className="absolute top-[40%] right-[26%] h-14 w-14 animate-bounce rounded-full bg-[#ffb3c7] opacity-35 [animation-duration:5.5s]" />
      <div className="absolute top-[50%] right-[32%] h-6 w-6 animate-pulse rounded-full bg-[#aee6ff] opacity-25 [animation-duration:3s]" />
      <div className="absolute top-[60%] right-[30%] h-10 w-10 animate-bounce rounded-full bg-[#aee6ff] opacity-30 [animation-duration:6s]" />
      <div className="absolute top-[44%] right-[18%] h-5 w-5 rounded-full bg-[#ffb3c7] opacity-25" />
    </div>
  );
}
