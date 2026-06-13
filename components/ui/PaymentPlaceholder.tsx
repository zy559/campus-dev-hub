export default function PaymentPlaceholder() {
  return (
    <div className="max-w-md mx-auto text-center py-12">
      <div className="text-6xl mb-6">💎</div>
      <h2 className="text-2xl font-bold text-ink mb-3">高级功能即将上线</h2>
      <p className="text-muted mb-8 leading-relaxed">
        付费功能正在开发中，敬请期待。
        <br />
        未来你可以解锁更多专属功能，让分享和交流更加高效。
      </p>
      <button
        disabled
        className="bg-accent/50 text-white px-8 py-3 rounded-full text-sm font-medium cursor-not-allowed"
      >
        立即订阅
      </button>
      <p className="text-xs text-subtle mt-4">功能开发中，暂未开放</p>
    </div>
  );
}
