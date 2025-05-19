import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import './App.css'
import JitsiApp from './components/JitsiApp'
import Main from './components/Main'

function App() {
    return (
        <>
            <BrowserRouter>
                <div className='navigation'>
                    <Link to="/">Главная</Link>
                    <div />
                    <Link to="/room">Конференция</Link>
                </div>

                <Routes>
                    <Route path='/' element={<Main />} />
                    <Route path='/room' element={<JitsiApp />} />
                </Routes>
            </BrowserRouter>
        </>
    )
}

export default App
