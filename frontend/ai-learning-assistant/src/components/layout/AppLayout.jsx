import React, {useState} from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

const AppLayout = ({children}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  }

  return (
    <div className="flex h-screen bg-neutral-50 text-neutral-900">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}></Sidebar>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar}></Header>
        <main className='flex-1 overflow-x-hidden overflow-y-auto p-6'>
          {children}
        </main>
      </div>
    </div>
  )
}

export default AppLayout