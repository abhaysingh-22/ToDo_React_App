import './index.css'
import { useEffect, useContext } from 'react'
import { TodoContext } from './TodoContext.jsx';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import Left from './components/Left.jsx';
import Today from './components/Today';
import Calendar from './components/Calendar';
import WebViewer from './components/WebViewer.jsx';
import Ethos from './components/Ethos.jsx';

export default function App() {
  const { Hide } = useContext(TodoContext)

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode && JSON.parse(savedMode)) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <>
      <Router basename={import.meta.env.BASE_URL}>
        <div className="body flex gap-1 h-[100lvh] overflow-x-hidden overflow-y-hidden bg-white  dark:bg-gray-900 transition-colors duration-200">
          <div className='h-[99lvh]'>
            <Left />
          </div>

          <div className={`right w-[79dvw] h-[100lvh] overflow-x-hidden  max-md:w-[88dvw] max-lg:w-[94dvw] dark:text-gray-200 transition-all duration-200 ease-in-out ${Hide ? "w-full" : "w-[79vw]"} `}>
            <Routes>
              <Route path="/" element={<Today />} />
              <Route path="/today" element={<Today />} />
              <Route path="/Calendar" element={<Calendar />} />
              <Route path="/web/:site" element={<WebViewer />} />
            </Routes>
          </div>

          {/* ✅ Ethos floating chatbot */}
          <Ethos />
        </div>
      </Router>
    </>
  )
}
