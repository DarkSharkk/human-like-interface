import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import './App.css'
import { JitsiContainer } from './components/JitsiContainer'
import CloneJitsiContainer from './components/CloneJitsiContainer'
import JitsiApp from './components/JitsiApp'

function App() {

    return (
        <>
            <BrowserRouter>
                <div className='navigation'>
                    <Link to="/">Home</Link>
                    |
                    <Link to="/room">Room</Link>
                    |
                    <Link to="/clone-room">CloneRoom</Link>
                    |
                    <Link to="/test">Test</Link>
                </div>

                <Routes>
                    <Route path='/' element={<div />} />
                    <Route path='/room' element={<JitsiContainer />} />
                    <Route path='/clone-room' element={<CloneJitsiContainer />} />
                    <Route path='/test' element={<JitsiApp />} />
                </Routes>
            </BrowserRouter>
        </>
    )
}

export default App
