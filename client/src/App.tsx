import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import './App.css'
import JitsiApp from './components/JitsiApp'
import GigaContainer from './components/GigaContainer'

function App() {
    return (
        <>
            <BrowserRouter>
                <div className='navigation'>
                    <Link to="/">Home</Link>
                    |
                    <Link to="/room">Room</Link>
                </div>

                <Routes>
                    <Route path='/' element={<GigaContainer />} />
                    <Route path='/room' element={<JitsiApp />} />
                </Routes>
            </BrowserRouter>
        </>
    )
}

export default App
