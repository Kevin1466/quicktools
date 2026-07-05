const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-6 mt-auto z-10 relative">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <span className="text-sm text-gray-700 font-medium">百宝箱 - 在线实用工具聚合平台</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition">关于我们</a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition">使用条款</a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition">隐私政策</a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition">联系我们</a>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">© 2026 百工具箱平台. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
