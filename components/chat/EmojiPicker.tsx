"use client";

const EMOJIS = [
  "😀","😂","🤣","😍","🥰","😎","🤩","😊",
  "👍","👎","👏","🙌","💪","🤝","✌️","👋",
  "❤️","💔","🔥","⭐","🎉","✨","💯","✅",
  "❌","⚠️","💡","📌","🔗","💬","📢","🎵",
  "🍕","🍔","🍜","☕","🍺","🎂","🍎","🥤",
  "🐱","🐶","🐼","🦊","🐸","🦄","🐙","🐝",
  "🎮","📱","💻","🖥️","⌨️","🎧","📷","🎬",
  "🚀","🛸","🌈","🌊","🏔️","🌲","🏠","🏫",
  "🕐","⏰","📅","💤","🤔","🙃","😅","😢",
  "👀","💀","🤡","👻","🎃","🎄","🎁","🎯",
];

export default function EmojiPicker({ onSelect, onClose }: { onSelect: (emoji: string) => void; onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-50" onClick={onClose} />
      <div className="absolute bottom-full left-0 mb-2 z-50 bg-white dark:bg-slate-800 rounded-xl shadow-xl ring-1 ring-slate-200 dark:ring-white/10 p-3 w-72 animate-scale-in">
        <div className="grid grid-cols-8 gap-1">
          {EMOJIS.map((emoji) => (
            <button key={emoji} type="button" onClick={() => onSelect(emoji)}
              className="w-8 h-8 flex items-center justify-center text-lg hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors">
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
