function MockDashboard() {
  const tasks = [
    { title: "トップページデザイン確認", assignee: "田", due: "06/10", status: "進行中", statusColor: "bg-blue-100 text-blue-700" },
    { title: "コピーライティング修正", assignee: "鈴", due: "06/05", status: "完了", statusColor: "bg-green-100 text-green-700" },
    { title: "レスポンシブ対応", assignee: "佐", due: "06/15", status: "未着手", statusColor: "bg-gray-100 text-gray-500" },
    { title: "APIエラーハンドリング", assignee: "中", due: "06/12", status: "進行中", statusColor: "bg-blue-100 text-blue-700" },
    { title: "ステージング環境確認", assignee: "田", due: "06/18", status: "未着手", statusColor: "bg-gray-100 text-gray-500" },
  ];

  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white">
      {/* Browser chrome */}
      <div className="bg-gray-100 px-4 py-2.5 flex items-center gap-2 border-b border-gray-200">
        <span className="w-3 h-3 rounded-full bg-red-400" />
        <span className="w-3 h-3 rounded-full bg-yellow-400" />
        <span className="w-3 h-3 rounded-full bg-green-400" />
        <div className="flex-1 mx-3 bg-white rounded px-3 py-1 text-xs text-gray-400 border border-gray-200">
          app.taskmate.io
        </div>
      </div>
      {/* App UI */}
      <div className="flex h-[300px] sm:h-[340px]">
        {/* Sidebar */}
        <div className="w-36 bg-gray-50 border-r border-gray-100 flex-shrink-0 p-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Projects</p>
          <div className="space-y-1">
            <div className="bg-indigo-50 text-indigo-700 text-xs rounded-lg px-2.5 py-1.5 font-medium">
              LPリニューアル
            </div>
            <div className="text-gray-500 text-xs rounded-lg px-2.5 py-1.5 hover:bg-gray-100">
              APIデモ開発
            </div>
            <div className="text-gray-500 text-xs rounded-lg px-2.5 py-1.5 hover:bg-gray-100">
              社内ツール整備
            </div>
          </div>
        </div>
        {/* Main */}
        <div className="flex-1 overflow-hidden p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-800">LPリニューアル</p>
            <button className="text-xs bg-indigo-600 text-white px-2.5 py-1 rounded-lg">+ タスク追加</button>
          </div>
          <div className="space-y-2">
            {tasks.map((task) => (
              <div key={task.title} className="flex items-center gap-2.5 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                  task.status === "完了" ? "bg-green-500 text-white" : "bg-indigo-100 text-indigo-600"
                }`}>
                  {task.status === "完了" ? "✓" : task.assignee}
                </div>
                <span className="flex-1 text-xs text-gray-700 truncate">{task.title}</span>
                <span className="text-[10px] text-gray-400 flex-shrink-0">{task.due}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 font-medium ${task.statusColor}`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="pt-28 pb-20 bg-gradient-to-b from-indigo-50 to-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6">
              チームのタスク管理を、
              <br />
              もっとシンプルに。
            </h1>
            <p className="text-lg text-gray-600 mb-10 leading-relaxed">
              Taskmateは、小規模チーム向けのタスク管理SaaSです。
              担当者、期限、進捗を一画面で整理し、日々のタスク共有をスムーズにします。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <a
                href="#"
                className="bg-indigo-600 text-white text-base font-medium px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-center"
              >
                無料で始める
              </a>
              <a
                href="#features"
                className="bg-white text-indigo-600 text-base font-medium px-8 py-3 rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors text-center"
              >
                機能を見る
              </a>
            </div>
            <p className="text-sm text-gray-400">
              3ユーザーまで無料。クレジットカード登録不要。
            </p>
          </div>
          {/* Mock UI */}
          <div className="w-full">
            <MockDashboard />
          </div>
        </div>
      </div>
    </section>
  );
}
