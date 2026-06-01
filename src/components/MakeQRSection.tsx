import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { QRCodeSVG } from 'qrcode.react'

export default function MakeQRSection() {
  const [roomName, setRoomName] = useState("");
  const [created, setCreated] = useState(false);
  const [roomId, setRoomId] = useState<string>("");

  const navigate = useNavigate();

  const createRoom = async () => {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { data, error } = await supabase
        .from("rooms")
        .insert([
          {
            name: roomName,
            expires_at: expiresAt.toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error(error);
        alert("Failed to create room");
        return;
      }

      setRoomId(data.id);
      setCreated(true);
    } catch (err) {
      console.error(err);
    }
  };

  const roomLink = roomId
    ? `memosky.app/room/${roomId}`
    : "memosky.app/room/...";

  return (
    <section
      id="qr-section"
      className="rounded-t-2xl bg-[#d2c8f7] h-screen flex items-center justify-center px-6 py-24 relative"
    >
      <div className="relative z-10 w-full max-w-2xl">
        <div className="text-center flex flex-col justify-center items-center mb-12">
          <span className="inline-block text-xs font-bold tracking-[4px] uppercase text-purple-400 bg-white/30 backdrop-blur-sm border border-purple-200/40 px-4 py-1.5 rounded-full mb-5">
            Create Your Room
          </span>

          <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#2a1f4f] leading-tight">
            One link.
            <br />
            <span className="bg-gradient-to-r from-[#9b72cf] to-[#f472b6] bg-clip-text text-transparent">
              Infinite memories.
            </span>
          </h2>

          <p className="text-[#6b5b8a] mt-4 text-center max-w-sm mx-auto">
            Name your sky room and get a shareable link & QR code instantly.
          </p>
        </div>

        <div className="bg-white/40 backdrop-blur-xl border border-white/70 rounded-3xl p-8 md:p-10 shadow-2xl shadow-purple-200/30">
          {!created ? (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#4a3a6a] tracking-wide">
                  Room Name
                </label>

                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Summer Trip 2025"
                  className="w-full bg-white/60 border border-purple-200/60 rounded-2xl px-5 py-4 text-[#2a1f4f] placeholder-purple-300 text-base outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all"
                />
              </div>
              <button
                onClick={async () => await createRoom()}
                disabled={!roomName.trim()}
                className="w-full bg-gradient-to-r from-[#9b72cf] to-[#c084fc] text-white font-bold text-base py-4 rounded-2xl shadow-lg shadow-purple-300/40 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ✨ Create My Sky Room
              </button>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-shrink-0">
                <div className="w-44 h-44 bg-white rounded-2xl border-2 border-purple-100 shadow-inner flex items-center justify-center relative overflow-hidden">
                  {/* <div className="grid grid-cols-7 gap-0.5 p-3 opacity-80">
                    {Array.from({ length: 49 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-4 h-4 rounded-sm ${
                          Math.random() > 0.4
                            ? "bg-[#2a1f4f]"
                            : "bg-transparent"
                        }`}
                      />
                    ))}
                  </div> */}

                  <QRCodeSVG
  value={`${window.location.origin}/room/${roomId}`}
  size={160}
  bgColor="#ffffff"
  fgColor="#2a1f4f"
  imageSettings={{
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E☁️%3C/text%3E%3C/svg%3E",
    x: undefined,
    y: undefined,
    height: 30,
    width: 30,
    excavate: true,
  }}
/>

            
                </div>

                <p className="text-center text-xs text-purple-400 mt-2 font-medium">
                  Scan to open
                </p>
              </div>

              <div className="flex-1 flex flex-col gap-4 w-full">
                <div>
                  <p className="text-xs font-bold text-purple-400 tracking-widest uppercase mb-2">
                    Room Name
                  </p>

                  <div className="bg-white/70 border border-purple-200/60 rounded-xl px-4 py-3 text-[#2a1f4f]">
                    {roomName}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-purple-400 tracking-widest uppercase mb-2">
                    Your Link
                  </p>

                  <div className="flex items-center gap-2 bg-white/70 border border-purple-200/60 rounded-xl px-4 py-3">
                    <span className="text-[#2a1f4f] text-sm font-medium flex-1 truncate">
                      {roomLink.slice(0, 40)}...
                    </span>

                    <button
                      onClick={() => navigator.clipboard.writeText(roomLink)}
                      className="text-xs font-bold text-purple-500 hover:text-purple-700 transition-colors whitespace-nowrap"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <button
                  onClick={() =>
                    navigate(`/room/${roomId}`, {
                      state: {
                        roomName,
                      },
                    })
                  }
                  className="w-full bg-gradient-to-r from-[#9b72cf] to-[#c084fc] text-white font-bold text-sm py-3.5 rounded-xl shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  Open My Room →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
