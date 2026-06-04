export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
          <div>
            <p className="text-white font-bold text-lg mb-2">Taskmate</p>
            <p className="text-sm text-gray-500">小規模チーム向けのタスク管理SaaS</p>
          </div>
          <nav className="flex gap-8">
            <a href="#features" className="text-sm hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-sm hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="text-sm hover:text-white transition-colors">FAQ</a>
          </nav>
        </div>
        <div className="border-t border-gray-800 pt-6">
          <p className="text-xs text-gray-600">© 2026 Taskmate. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
