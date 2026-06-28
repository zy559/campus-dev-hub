"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ACTIVITY_SECTIONS } from "@/lib/activitySections";

export default function PostForm() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [section, setSection] = useState<string>(ACTIVITY_SECTIONS[0].title);
  const [childTag, setChildTag] = useState<string>(ACTIVITY_SECTIONS[0].children[0]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const activeSection = ACTIVITY_SECTIONS.find((item) => item.title === section) || ACTIVITY_SECTIONS[0];

  async function upload(file: File) {
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "上传失败");
      setImages((prev) => [...prev, data.url].slice(0, 6));
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!title.trim() || !content.trim()) {
      setError("请填写标题和正文");
      return;
    }

    const fullContent = [content.trim(), ...images.map((url, index) => `![图片${index + 1}](${url})`)].join("\n\n");
    setLoading(true);
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        content: fullContent,
        tagIds: [],
        tagNames: [section, childTag],
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "发布失败");
      return;
    }
    router.push(`/activity?tag=${encodeURIComponent(childTag)}`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl space-y-5 pb-24 lg:pb-0">
      {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      <section className="rounded-2xl bg-white/80 p-5 shadow-sm ring-1 ring-white/70 backdrop-blur">
        <h2 className="text-lg font-black text-slate-950">选择栏目</h2>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {ACTIVITY_SECTIONS.map((item) => (
            <button
              key={item.title}
              type="button"
              onClick={() => {
                setSection(item.title);
                setChildTag(item.children[0]);
              }}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
                section === item.title ? "bg-teal-600 text-white" : "bg-slate-50 text-slate-600 hover:bg-teal-50 hover:text-teal-700"
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {activeSection.children.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setChildTag(item)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                childTag === item ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-600 hover:bg-teal-50 hover:text-teal-700"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white/80 p-5 shadow-sm ring-1 ring-white/70 backdrop-blur">
        <label className="block">
          <span className="text-sm font-bold text-slate-700">标题</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="一句话说明你想发布什么"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-base outline-none focus:border-teal-300 focus:ring-2 focus:ring-teal-100"
          />
        </label>
        <label className="mt-4 block">
          <span className="text-sm font-bold text-slate-700">正文</span>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={6}
            placeholder="写清楚时间、地点、需求、联系方式或补充说明。"
            className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm leading-6 outline-none focus:border-teal-300 focus:ring-2 focus:ring-teal-100"
          />
        </label>
      </section>

      <section className="rounded-2xl bg-white/80 p-5 shadow-sm ring-1 ring-white/70 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-950">图片</h2>
            <p className="mt-1 text-sm text-slate-500">可选，最多 6 张。</p>
          </div>
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="rounded-full bg-teal-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
            {uploading ? "上传中..." : "添加图片"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) upload(file);
            }}
          />
        </div>
        {images.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
            {images.map((src) => (
              <div key={src} className="relative">
                <img src={src} alt="" className="aspect-square w-full rounded-2xl object-cover" />
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((url) => url !== src))}
                  className="absolute right-1 top-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-bold text-slate-600"
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <button disabled={loading} className="w-full rounded-2xl bg-teal-600 py-3 text-base font-black text-white transition hover:bg-teal-500 disabled:opacity-60">
        {loading ? "发布中..." : "发布动态"}
      </button>
    </form>
  );
}
