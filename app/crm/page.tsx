"use client";

import { useState, useEffect, useRef } from "react";

type ImgEntry = {
  crmId: string;
  src: string;
  page: string;
  alt: string;
  label: string;
  context: string;
  role: string;
};

const PAGE_LABELS: Record<string, string> = {
  "index.html": "🏠 Home",
  "about.html": "👥 About",
  "portfolio.html": "🖼 Portfolio",
  "services.html": "🔧 Services",
  "clients.html": "🤝 Clients",
  "contact.html": "📞 Contact",
};

export default function CRMDashboard() {
  const [images, setImages] = useState<ImgEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPage, setFilterPage] = useState("all");
  const [selected, setSelected] = useState<ImgEntry | null>(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchImages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/all-images");
      const data = await res.json();
      setImages(data);
    } catch {
      showToast("Failed to load images.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const uploadAndSave = async (file: File, crmId: string) => {
    setUploading(true);
    const targetName = file.name.replace(/\s+/g, "-");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("filename", targetName);

    try {
      const upRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!upRes.ok) throw new Error("Upload failed");
      const upData = await upRes.json();

      const saveRes = await fetch("/api/update-image-src", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crmId, newSrc: upData.name }),
      });
      if (!saveRes.ok) throw new Error("Save failed");

      showToast("Image updated successfully!", "success");
      setSelected(null);
      await fetchImages();
    } catch (err: any) {
      showToast(err.message || "Something went wrong", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (crmId: string) => {
    if (!confirm("Are you sure you want to clear this image?")) return;
    setUploading(true);
    try {
      const res = await fetch("/api/update-image-src", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crmId, action: "delete" }),
      });
      if (!res.ok) throw new Error("Delete failed");
      showToast("Image cleared!", "success");
      setSelected(null);
      await fetchImages();
    } catch (err: any) {
      showToast(err.message || "Something went wrong", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !selected) return;
    uploadAndSave(e.target.files[0], selected.crmId);
    e.target.value = "";
  };

  // Drag into modal
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!selected || !e.dataTransfer.files?.[0]) return;
    uploadAndSave(e.dataTransfer.files[0], selected.crmId);
  };

  const pages = ["all", ...Array.from(new Set(images.map((i) => i.page)))];
  const filtered = filterPage === "all" ? images : images.filter((i) => i.page === filterPage);

  const resolvedSrc = (src: string) => {
    if (!src || src.startsWith("data:")) return null;
    if (src.startsWith("http")) return src;
    return "/" + src;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      {/* TOAST */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[9999] px-5 py-3 rounded-lg font-semibold shadow-2xl text-sm transition-all ${toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
          {toast.msg}
        </div>
      )}

      {/* MODAL */}
      {selected && (
        <div className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => !uploading && setSelected(null)}>
          <div
            className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 w-full max-w-md shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
            ref={dragRef}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <h2 className="text-xl font-bold mb-1">Edit Image</h2>
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="text-xs bg-zinc-800 border border-zinc-700 px-2 py-1 rounded-md text-zinc-300">
                📄 {PAGE_LABELS[selected.page] || selected.page}
              </span>
              <span className="text-xs bg-zinc-800 border border-zinc-700 px-2 py-1 rounded-md text-zinc-300">
                🏷 {selected.role || "Image"}
              </span>
              <span className="text-xs bg-[#ffcc00]/10 border border-[#ffcc00]/30 px-2 py-1 rounded-md text-[#ffcc00] font-semibold">
                {selected.context || selected.label || selected.alt || "Unnamed slot"}
              </span>
            </div>

            {/* Current preview */}
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700 mb-6 relative">
              {resolvedSrc(selected.src) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`${resolvedSrc(selected.src)}?t=${Date.now()}`}
                  alt={selected.alt}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-600 text-sm">No image set</div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-semibold text-sm rounded-xl">
                  Uploading...
                </div>
              )}
            </div>

            {/* Drop zone hint */}
            <p className="text-center text-zinc-500 text-xs mb-5">— or drag & drop a new image anywhere in this window —</p>

            <div className="flex flex-col gap-3">
              <button
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-[#ffcc00] hover:bg-yellow-300 text-black font-bold py-3 rounded-xl transition disabled:opacity-50"
              >
                📁 Choose & Upload New Image
              </button>
              <button
                disabled={uploading}
                onClick={() => handleDelete(selected.crmId)}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
              >
                🗑 Delete / Clear Image
              </button>
              <button
                disabled={uploading}
                onClick={() => setSelected(null)}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-3 rounded-xl transition border border-zinc-700 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-center justify-between px-8 py-5 bg-zinc-900 border-b border-zinc-800 sticky top-0 z-50 shadow">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold tracking-tight">BMG Interiors</h1>
          <span className="text-[10px] font-bold bg-[#ffcc00] text-black px-2 py-1 rounded tracking-widest uppercase">Master CMS</span>
        </div>
        <div className="flex items-center gap-4">
          <select
            className="bg-zinc-800 text-white border border-zinc-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#ffcc00]"
            value={filterPage}
            onChange={(e) => setFilterPage(e.target.value)}
          >
            {pages.map((p) => (
              <option key={p} value={p}>{p === "all" ? "All Pages" : PAGE_LABELS[p] || p}</option>
            ))}
          </select>
          <button onClick={fetchImages} className="text-sm bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-4 py-2 rounded-lg transition">
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-8">
        {loading ? (
          <div className="text-center text-zinc-500 mt-20 text-lg">Loading images...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-zinc-600 mt-20 text-lg">No images found for this page.</div>
        ) : (
          <>
            <p className="text-zinc-400 text-sm mb-6">{filtered.length} image slot{filtered.length !== 1 ? "s" : ""} found · Click any card to update or delete</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {filtered.map((img) => (
                <div
                  key={img.crmId}
                  onClick={() => setSelected(img)}
                  className="group bg-zinc-900 border border-zinc-800 hover:border-[#ffcc00] rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-xl hover:shadow-[#ffcc00]/10"
                >
                  <div className="aspect-square bg-zinc-800 relative overflow-hidden">
                    {resolvedSrc(img.src) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`${resolvedSrc(img.src)}?t=${Date.now()}`}
                        alt={img.alt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-zinc-600">
                        <span className="text-3xl mb-2">📷</span>
                        <span className="text-xs">No Image Set</span>
                      </div>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white font-bold text-sm bg-[#ffcc00] text-black px-3 py-1 rounded-full">✏️ Edit</span>
                    </div>
                  </div>

              <div className="p-3">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span className="text-[9px] font-bold uppercase tracking-widest bg-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded">
                    {img.role || "Image"}
                  </span>
                  <span className="text-[9px] text-zinc-500">{PAGE_LABELS[img.page] || img.page}</span>
                </div>
                <p className="text-xs text-white font-semibold truncate leading-snug" title={img.label}>{img.context || img.label || img.alt || "Unnamed"}</p>
              </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
