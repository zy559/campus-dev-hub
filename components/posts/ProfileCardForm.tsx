"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PROFILE_CARD_MARKER } from "@/lib/activitySections";

const NEEDS = ["找对象", "找朋友", "找饭搭子", "找比赛队友", "找自习搭子", "找运动搭子"];
const INTERESTS = ["摄影", "美食", "电影", "前端", "羽毛球", "考研", "旅行", "音乐"];

export default function ProfileCardForm() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [nickname, setNickname] = useState("");
  const [school, setSchool] = useState("");
  const [intro, setIntro] = useState("");
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

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
    if (!nickname.trim() || !intro.trim() || selectedNeeds.length === 0) {
      setError("请填写昵称、需求和自我介绍");
      return;
    }

    setLoading(true);
    const content = [
      PROFILE_CARD_MARKER,
      `昵称：${nickname}`,
      school ? `学校：${school}` : "",
      `想找：${selectedNeeds.join("、")}`,
      selectedInterests.length ? `兴趣：${selectedInterests.join("、")}` : "",
      "",
      intro,
      "",
      ...images.map((url, index) => `![资料卡图片${index + 1}](${url})`),
    ]
      .filter(Boolean)
      .join("\n");

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `资料卡｜${nickname}`,
        content,
        tagIds: [],
        tagNames: ["资料卡", ...selectedNeeds, ...selectedInterests.slice(0, 2)],
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "发布失败");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl space-y-5 pb-24 lg:pb-0">
      {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-950">上传照片</h2>
            <p className="mt-1 text-sm text-slate-500">建议 1-6 张，第一张会作为推荐页主图。</p>
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="rounded-full bg-teal-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
          >
            {uploading ? "上传中..." : "添加图片"}
          </button>
        </div>
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
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {images.map((src) => (
            <img key={src} src={src} alt="" className="aspect-[3/4] rounded-2xl object-cover" />
          ))}
          {images.length === 0 && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="col-span-3 aspect-[3/2] rounded-2xl border border-dashed border-teal-200 bg-teal-50 text-sm font-bold text-teal-700 sm:col-span-2"
            >
              上传一张清晰照片
            </button>
          )}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="昵称" value={nickname} onChange={setNickname} placeholder="例如：林同学" />
          <Field label="学校/年级" value={school} onChange={setSchool} placeholder="例如：河农大 · 大三" />
        </div>
      </section>

      <ChoiceGroup title="我想找" items={NEEDS} selected={selectedNeeds} setSelected={setSelectedNeeds} />
      <ChoiceGroup title="兴趣标签" items={INTERESTS} selected={selectedInterests} setSelected={setSelectedInterests} />

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <label className="text-sm font-bold text-slate-700">自我介绍 / 需求</label>
        <textarea
          value={intro}
          onChange={(event) => setIntro(event.target.value)}
          rows={5}
          maxLength={180}
          placeholder="简单说明你是谁、想认识什么样的人、希望一起做什么。"
          className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-300 focus:ring-2 focus:ring-teal-100"
        />
        <p className="mt-1 text-right text-xs text-slate-400">{intro.length}/180</p>
      </section>

      <button disabled={loading} className="w-full rounded-2xl bg-teal-600 py-3 text-base font-black text-white transition hover:bg-teal-500 disabled:opacity-60">
        {loading ? "发布中..." : "发布资料卡"}
      </button>
    </form>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-300 focus:ring-2 focus:ring-teal-100"
      />
    </label>
  );
}

function ChoiceGroup({
  title,
  items,
  selected,
  setSelected,
}: {
  title: string;
  items: string[];
  selected: string[];
  setSelected: (items: string[]) => void;
}) {
  function toggle(item: string) {
    setSelected(selected.includes(item) ? selected.filter((value) => value !== item) : [...selected, item]);
  }

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <h2 className="text-lg font-black text-slate-950">{title}</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => toggle(item)}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              selected.includes(item)
                ? "bg-teal-600 text-white"
                : "bg-slate-50 text-slate-600 hover:bg-teal-50 hover:text-teal-700"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </section>
  );
}
