import { useParams } from 'react-router-dom'
import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from "../lib/supabase"
import JSZip from 'jszip'

export default function RoomPage() {
  const { roomId } = useParams()
  const [images, setImages] = useState<{ url: string; name: string }[]>([])
  const [dragging, setDragging] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [room, setRoom] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  // لود اطلاعات روم و عکس‌ها
  useEffect(() => {
    const fetchRoom = async () => {
      if (!roomId) return

      // چک کن روم وجود داره
      const { data: roomData, error: roomError } = await supabase
        .from("rooms")
        .select("*")
        .eq("id", roomId)
        .single()

      if (roomError || !roomData) {
        setRoom(null)
        setLoading(false)
        return
      }

      // چک کن منقضی نشده
      if (new Date(roomData.expires_at) < new Date()) {
        setRoom(null)
        setLoading(false)
        return
      }

      setRoom(roomData)

      // لود عکس‌های روم
      const { data: photos } = await supabase
        .from("photos")
        .select("*")
        .eq("room_id", roomId)
        .order("uploaded_at", { ascending: false })

      if (photos) {
        setImages(photos.map(p => ({ url: p.url, name: p.name })))
      }

      setLoading(false)
    }

    fetchRoom()
  }, [roomId])

  // آپلود عکس به Supabase
  const uploadFiles = async (files: FileList | null) => {
    if (!files || !roomId) return
    setUploading(true)

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue

      const fileName = `${roomId}/${Date.now()}-${file.name}`

      // آپلود به Storage
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(fileName, file)

      if (uploadError) {
        console.error(uploadError)
        continue
      }

      // گرفتن public URL
      const { data: urlData } = supabase.storage
        .from('photos')
        .getPublicUrl(fileName)

      const publicUrl = urlData.publicUrl

      // ذخیره توی جدول photos
      const { error: dbError } = await supabase
        .from('photos')
        .insert([{
          room_id: roomId,
          url: publicUrl,
          name: file.name,
        }])

      if (!dbError) {
        setImages(prev => [{ url: publicUrl, name: file.name }, ...prev])
      }
    }

    setUploading(false)
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    uploadFiles(e.dataTransfer.files)
  }, [roomId])

  const downloadAll = async () => {
    const zip = new JSZip()
    for (const img of images) {
      const blob = await fetch(img.url).then(r => r.blob())
      zip.file(img.name, blob)
    }
    const content = await zip.generateAsync({ type: 'blob' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(content)
    a.download = `${room?.name || roomId}-photos.zip`
    a.click()
  }

  if (!roomId) return null
  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#2a1f4f] text-xl">☁️ Loading...</div>
  if (!room) return <div className="min-h-screen flex items-center justify-center text-[#2a1f4f] text-xl">❌ This room doesn't exist or has expired.</div>

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #96d5ff 0%, #96cff3 30%, #e0c4f3 65%, #ffbadf 100%)', backgroundAttachment: 'fixed' }}>

      <div className="pt-12 pb-6 text-center">
        <span className="text-4xl">☁️</span>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#2a1f4f] mt-2">
          {room?.name || "My Sky Room"}
        </h1>
        <p className="text-[#6b5b8a] mt-1 text-sm">{images.length} photo{images.length !== 1 ? 's' : ''}</p>
        <p className="text-[#9b8ab4] text-xs mt-1">
          Expires {new Date(room.expires_at).toLocaleDateString()}
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-6 mb-16">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => document.getElementById('fileInput')?.click()}
          className={`
            relative cursor-pointer rounded-3xl border-2 border-dashed p-12 text-center transition-all duration-300
            ${dragging ? 'border-purple-400 bg-white/50 scale-[1.02]' : 'border-purple-300/60 bg-white/20 hover:bg-white/30 hover:border-purple-400'}
          `}
        >
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => uploadFiles(e.target.files)}
          />
          <div className="text-5xl mb-4">{uploading ? '⏳' : dragging ? '🌤️' : '📸'}</div>
          <p className="text-[#2a1f4f] font-bold text-lg">
            {uploading ? 'Uploading...' : 'Drop photos here'}
          </p>
          <p className="text-[#6b5b8a] text-sm mt-1">or click to select</p>
        </div>
      </div>

      {images.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 pb-24">
          <div className="flex justify-end mb-6">
            <button
              onClick={downloadAll}
              className="flex items-center gap-2 bg-white/40 backdrop-blur-md border border-white/60 text-[#2a1f4f] font-bold px-6 py-3 rounded-full shadow-lg hover:bg-white/60 hover:-translate-y-0.5 transition-all duration-200"
            >
              ⬇️ Download All
            </button>
          </div>

          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {images.map((img, i) => (
              <motion.div
                key={img.url}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="break-inside-avoid cursor-pointer group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                onClick={() => setSelected(img.url)}
              >
                <img src={img.url} alt={img.name} className="w-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-end p-3 opacity-0 group-hover:opacity-100">
                  <span className="text-white text-xs font-medium truncate bg-black/40 px-2 py-1 rounded-full">
                    {img.name}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 cursor-zoom-out"
          >
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={selected}
              className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setSelected(null)}
              className="absolute top-6 right-6 text-white text-2xl bg-white/20 w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/40 transition-all"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}