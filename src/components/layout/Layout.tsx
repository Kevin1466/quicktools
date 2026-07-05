import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Footer from './Footer'
import TopBar from './TopBar'

interface LayoutProps {
  children?: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 ml-[220px] flex flex-col">
          <TopBar />
          <div className="p-6 flex-1">
            {children || <Outlet />}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  )
}

export default Layout
