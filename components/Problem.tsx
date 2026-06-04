const problems = [
  "誰が何を担当しているか分かりづらい",
  "チャットで依頼したタスクが流れてしまう",
  "期限が近いタスクを見落としてしまう",
  "進捗確認のためのミーティングが増えている",
  "スプレッドシート管理が複雑になってきた",
];

export default function Problem() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-12">
          こんなタスク管理の悩みはありませんか？
        </h2>
        <ul className="space-y-4 max-w-2xl mx-auto mb-12">
          {problems.map((problem) => (
            <li
              key={problem}
              className="flex items-start gap-3 bg-white rounded-xl p-5 shadow-sm border border-gray-100"
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
              <span className="text-gray-700">{problem}</span>
            </li>
          ))}
        </ul>
        <p className="text-center text-gray-600 text-base">
          <span className="font-semibold text-indigo-600">Taskmate</span>
          なら、チームのタスク状況を一画面で整理できます。
        </p>
      </div>
    </section>
  );
}
