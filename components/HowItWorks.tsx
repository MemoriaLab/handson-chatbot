function StepMock1() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-red-300" />
        <span className="w-2 h-2 rounded-full bg-yellow-300" />
        <span className="w-2 h-2 rounded-full bg-green-300" />
      </div>
      <div className="p-4">
        <p className="text-xs font-semibold text-gray-700 mb-3">新しいプロジェクト</p>
        <div className="space-y-2.5">
          <div>
            <p className="text-[10px] text-gray-400 mb-1">プロジェクト名</p>
            <div className="bg-gray-50 border border-indigo-300 rounded px-2.5 py-1.5 text-xs text-gray-700">
              LPリニューアル
            </div>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 mb-1">メンバーを追加</p>
            <div className="flex gap-1.5">
              {["田", "鈴", "佐"].map((name) => (
                <span key={name} className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-bold flex items-center justify-center">
                  {name}
                </span>
              ))}
              <span className="w-6 h-6 rounded-full border border-dashed border-gray-300 text-gray-400 text-xs flex items-center justify-center">+</span>
            </div>
          </div>
          <button className="w-full bg-indigo-600 text-white text-xs py-1.5 rounded-lg mt-1">
            作成する
          </button>
        </div>
      </div>
    </div>
  );
}

function StepMock2() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-red-300" />
        <span className="w-2 h-2 rounded-full bg-yellow-300" />
        <span className="w-2 h-2 rounded-full bg-green-300" />
      </div>
      <div className="p-4">
        <p className="text-xs font-semibold text-gray-700 mb-3">タスクを追加</p>
        <div className="space-y-2">
          <div>
            <p className="text-[10px] text-gray-400 mb-1">タスク名</p>
            <div className="bg-gray-50 border border-indigo-300 rounded px-2.5 py-1.5 text-xs text-gray-700">
              トップページデザイン確認
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[10px] text-gray-400 mb-1">担当者</p>
              <div className="bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-xs text-gray-700 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 text-[9px] font-bold flex items-center justify-center">田</span>
                田中
              </div>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 mb-1">期限</p>
              <div className="bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-xs text-gray-700">
                2026/06/10
              </div>
            </div>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 mb-1">ステータス</p>
            <div className="bg-blue-50 border border-blue-200 rounded px-2 py-1.5 text-xs text-blue-700">
              進行中
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepMock3() {
  const tasks = [
    { title: "トップページデザイン確認", assignee: "田", status: "進行中", color: "bg-blue-100 text-blue-700" },
    { title: "コピーライティング修正", assignee: "鈴", status: "完了", color: "bg-green-100 text-green-700" },
    { title: "レスポンシブ対応", assignee: "佐", status: "未着手", color: "bg-gray-100 text-gray-500" },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-red-300" />
        <span className="w-2 h-2 rounded-full bg-yellow-300" />
        <span className="w-2 h-2 rounded-full bg-green-300" />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-700">LPリニューアル</p>
          <div className="flex gap-2 text-[10px] text-gray-400">
            <span>3件中 1件完了</span>
          </div>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1 mb-3">
          <div className="bg-indigo-500 h-1 rounded-full w-1/3" />
        </div>
        <div className="space-y-1.5">
          {tasks.map((task) => (
            <div key={task.title} className="flex items-center gap-2 bg-gray-50 rounded-lg px-2.5 py-1.5 border border-gray-100">
              <span className={`w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center flex-shrink-0 ${
                task.status === "完了" ? "bg-green-500 text-white" : "bg-indigo-100 text-indigo-600"
              }`}>
                {task.status === "完了" ? "✓" : task.assignee}
              </span>
              <span className="flex-1 text-[10px] text-gray-700 truncate">{task.title}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${task.color}`}>
                {task.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const steps = [
  {
    number: "1",
    title: "プロジェクトを作成",
    description: "チームや案件ごとにプロジェクトを作成します。",
    mock: <StepMock1 />,
  },
  {
    number: "2",
    title: "タスクを登録",
    description: "担当者、期限、ステータスを設定してタスクを登録します。",
    mock: <StepMock2 />,
  },
  {
    number: "3",
    title: "進捗を確認",
    description: "一覧画面でチーム全体の進捗を確認できます。",
    mock: <StepMock3 />,
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-14">
          使い方はシンプルです。
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white text-base font-bold flex items-center justify-center shadow-sm flex-shrink-0">
                  {step.number}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{step.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                </div>
              </div>
              {step.mock}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
