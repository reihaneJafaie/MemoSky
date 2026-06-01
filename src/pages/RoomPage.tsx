import { useParams } from 'react-router-dom'
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import JSZip from 'jszip' 

export default function RoomPage() {
  const { roomName } = useParams()
  const [images, setImages] = useState<{ url: string; name: string; file: File }[]>([])
  const [dragging, setDragging] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    const newImgs = Array.from(files)
      .filter(f => f.type.startsWith('image/'))
      .map(f => ({ url: URL.createObjectURL(f), name: f.name, file: f }))
    setImages(prev => [...prev, ...newImgs])
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [])

  const downloadAll = async () => {
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()
    for (const img of images) {
      const blob = await fetch(img.url).then(r => r.blob())
      zip.file(img.name, blob)
    }
    const content = await zip.generateAsync({ type: 'blob' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(content)
    a.download = `${roomName}-photos.zip`
    a.click()
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #96d5ff 0%, #96cff3 30%, #e0c4f3 65%, #ffbadf 100%)', backgroundAttachment: 'fixed' }}>
      
      {/* Header */}
      <div className="pt-12 pb-6 text-center">
        <span className="text-4xl">☁️</span>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#2a1f4f] mt-2">
          {roomName}
        </h1>
        <p className="text-[#6b5b8a] mt-1 text-sm">{images.length} photo{images.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Upload Section */}
      <div className="max-w-2xl mx-auto px-6 mb-16">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => document.getElementById('fileInput')?.click()}
          className={`
            relative cursor-pointer rounded-3xl border-2 border-dashed p-12 text-center transition-all duration-300
            ${dragging
              ? 'border-purple-400 bg-white/50 scale-[1.02]'
              : 'border-purple-300/60 bg-white/20 hover:bg-white/30 hover:border-purple-400'
            }
          `}
        >
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className="text-5xl mb-4">{dragging ? '🌤️' : '📸'}</div>
          <p className="text-[#2a1f4f] font-bold text-lg">Drop photos here</p>
          <p className="text-[#6b5b8a] text-sm mt-1">or click to select</p>
        </div>
      </div>

      {/* Gallery Section */}
      {images.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 pb-24">

          {/* Download button */}
          <div className="flex justify-end mb-6">
            <button
              onClick={downloadAll}
              className="flex items-center gap-2 bg-white/40 backdrop-blur-md border border-white/60 text-[#2a1f4f] font-bold px-6 py-3 rounded-full shadow-lg hover:bg-white/60 hover:-translate-y-0.5 transition-all duration-200"
            >
              ⬇️ Download All
            </button>
          </div>

          {/* Pinterest Masonry Grid */}
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
                <img
                  src={img.url}
                  alt={img.name}
                  className="w-full object-cover"
                />
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

      {/* Lightbox */}
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