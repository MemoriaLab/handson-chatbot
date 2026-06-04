export default function CTA() {
  return (
    <section className="py-20 bg-indigo-600">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
          まずは無料で、チームのタスク管理を始めましょう。
        </h2>
        <p className="text-indigo-200 mb-8 text-base leading-relaxed">
          Taskmateは3ユーザーまで無料で利用できます。
          <br className="hidden sm:block" />
          小さなチームのタスク共有を、今日からシンプルにできます。
        </p>
        <a
          href="#"
          className="inline-block bg-white text-indigo-700 font-semibold text-base px-10 py-3.5 rounded-xl hover:bg-indigo-50 transition-colors shadow-sm"
        >
          無料で始める
        </a>
        <p className="mt-4 text-indigo-300 text-sm">
          クレジットカード登録不要
        </p>
      </div>
    </section>
  );
}
