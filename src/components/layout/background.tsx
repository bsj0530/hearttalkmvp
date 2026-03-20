export default function Background() {
  return (
    // fixed inset-0: 화면 전체에 고정
    // -z-10: 모든 컨텐츠 뒤로 보냄
    <div className="fixed inset-0 -z-10 h-full w-full overflow-hidden bg-[#fcf8f8]">
      {/* --- 배경 그라디언트 Blobs --- */}

      {/* 1. 좌측 상단 (Pink - #fe4081) */}
      <div className="absolute -top-[10%] -left-[10%] h-[500px] w-[500px] rounded-full bg-[#e840fe] opacity-5" />

      {/* 2. 상단 중앙/우측 (Yellow - #ffbd59) */}
      <div className="absolute -top-[10%] right-[30%] h-[300px] w-[300px] rounded-full bg-[#ffbd59] opacity-5" />

      {/* 3. 우측 중간 대형 (Light Pink - #fe4081) */}
      <div className="absolute top-[10%] -right-[5%] h-[500px] w-[500px] rounded-full bg-[#fe4081] opacity-5" />

      {/* 4. 우측 하단 (Blue - #38b6ff) */}
      <div className="absolute right-[20%] bottom-[5%] h-[300px] w-[300px] rounded-full bg-[#38b6ff] opacity-5" />

      {/* 5. 좌측 하단 (Green - #00bf63) */}
      <div className="absolute -bottom-[15%] left-[5%] h-[400px] w-[400px] rounded-full bg-[#00bf63] opacity-5" />
    </div>
  );
}
