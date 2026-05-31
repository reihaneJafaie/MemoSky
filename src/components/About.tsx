import CloudBackground from './CloudBackground'
export default function HeroText() {
  return (
    <div style={{ position: "relative" }}>
      <CloudBackground />

      {/* محتوا روی ابرها */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div className="fixed inset-0 z-10 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-[#2a1f4f] leading-tight mb-5 drop-shadow-lg">
            Your memories,
            <br />
            <span className="bg-gradient-to-r from-[#9b72cf] to-[#f472b6] bg-clip-text text-transparent">
              floating in the sky.
            </span>
          </h1>
          <p className="text-lg text-[#5a4a7a] max-w-md mb-10 drop-shadow">
            Upload files, share a link or QR code — anyone can access your cloud
            room.
          </p>
          <button
            className=" pointer-events-auto bg-gradient-to-r from-[#9b72cf] to-[#c084fc] text-white font-bold text-base px-10 py-2 mt-3 rounded-full shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all duration-200 cursor-pointer"
            onClick={() =>
              document
                .getElementById("qr-section")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Get Started Free
          </button>
        </div>
      </div>
    </div>
  );
}
