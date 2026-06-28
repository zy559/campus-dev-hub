"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ACTIVITY_SECTIONS } from "@/lib/activitySections";

const POST_TEMPLATES: Record<string, { title: string; placeholder: string; sample: string }> = {
  比赛组队: {
    title: "组队模板",
    placeholder: "建议写清楚：比赛名称、目标、缺什么角色、时间安排、联系方式。",
    sample: "比赛/项目：\n目标：\n目前进度：\n缺少角色：\n时间安排：\n联系方式：",
  },
  实习内推: {
    title: "机会模板",
    placeholder: "建议写清楚：岗位、要求、截止时间、投递方式、是否内推。",
    sample: "岗位/公司：\n适合年级：\n主要要求：\n截止时间：\n投递方式：",
  },
  活动讲座: {
    title: "活动模板",
    placeholder: "建议写清楚：时间、地点、报名方式、适合谁参加。",
    sample: "活动名称：\n时间地点：\n适合人群：\n报名方式：\n补充说明：",
  },
  项目招募: {
    title: "项目模板",
    placeholder: "建议写清楚：项目想法、目前成员、缺少角色、预期产出。",
    sample: "项目想法：\n目前成员：\n缺少角色：\n预期产出：\n合作方式：",
  },
  课程资料: {
    title: "资料模板",
    placeholder: "建议写清楚：课程名、资料类型、适合阶段、获取方式。",
    sample: "课程/科目：\n资料类型：\n适合阶段：\n获取方式：\n注意事项：",
  },
  问答求助: {
    title: "求助模板",
    placeholder: "建议写清楚：遇到的问题、已经尝试的方法、希望得到什么帮助。",
    sample: "问题背景：\n已经尝试：\n卡住位置：\n希望得到的帮助：",
  },
  找对象: {
    title: "认真介绍模板",
    placeholder: "建议写清楚：自己的状态、想认识什么样的人、希望怎么开始。",
    sample: "关于我：\n想认识：\n兴趣/生活节奏：\n希望怎么开始：",
  },
  找搭子: {
    title: "搭子模板",
    placeholder: "建议写清楚：做什么、时间频率、地点、希望对方什么状态。",
    sample: "想找什么搭子：\n时间频率：\n地点：\n希望对方：\n联系方式：",
  },
  运动约局: {
    title: "约局模板",
    placeholder: "建议写清楚：运动项目、时间地点、人数、水平要求。",
    sample: "运动项目：\n时间地点：\n还缺人数：\n水平要求：\n联系方式：",
  },
  二手闲置: {
    title: "交易模板",
    placeholder: "建议写清楚：物品、成色、价格、交易地点、图片。",
    sample: "物品：\n成色：\n价格：\n交易地点：\n补充说明：",
  },
  作品展示: {
    title: "展示模板",
    placeholder: "建议写清楚：作品链接、你负责什么、想获得什么反馈。",
    sample: "作品名称：\n作品链接：\n我负责：\n想获得的反馈：",
  },
};

function getTemplate(tag: string) {
  return POST_TEMPLATES[tag] || {
    title: "发布提示",
    placeholder: "建议写清楚：背景、需求、时间地点、联系方式或下一步。",
    sample: "背景：\n需求：\n时间地点：\n下一步：",
  };
}

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
  const template = getTemplate(childTag);

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

  function applyTemplate() {
    setContent((prev) => (prev.trim() ? prev : template.sample));
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
                childTag === item ? "bg-teal-600 text-white" : "bg-slate-50 text-slate-600 hover:bg-teal-50 hover:text-teal-700"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white/80 p-5 shadow-sm ring-1 ring-white/70 backdrop-blur">
        <div className="mb-4 rounded-2xl bg-teal-50 p-4 text-teal-800 ring-1 ring-teal-100">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black">{template.title}</p>
              <p className="mt-1 text-sm leading-6">{template.placeholder}</p>
            </div>
            <button type="button" onClick={applyTemplate} className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-teal-700 ring-1 ring-teal-100">
              套用
            </button>
          </div>
        </div>

        <label className="block">
          <span className="text-sm font-bold text-slate-700">标题</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="一句话说明你想发布什么"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-base text-slate-900 outline-none placeholder:text-slate-500 focus:border-teal-300 focus:ring-2 focus:ring-teal-100"
          />
        </label>
        <label className="mt-4 block">
          <span className="text-sm font-bold text-slate-700">正文</span>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={7}
            placeholder={template.placeholder}
            className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-500 focus:border-teal-300 focus:ring-2 focus:ring-teal-100"
          />
        </label>
      </section>

      <section className="rounded-2xl bg-white/80 p-5 shadow-sm ring-1 ring-white/70 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-950">图片</h2>
            <p className="mt-1 text-sm text-slate-600">可选，最多 6 张。</p>
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
