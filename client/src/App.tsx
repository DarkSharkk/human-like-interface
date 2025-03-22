import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import './App.css'
import { JitsiContainer } from './components/JitsiContainer'
import CloneJitsiContainer from './components/CloneJitsiContainer'

function App() {

    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path='/' element={<div />} />
                    <Route path='/room' element={<JitsiContainer />} />
                    <Route path='/clone-room' element={<CloneJitsiContainer />} />
                </Routes>

                <div className='navigation'>
                    <Link to="/">Home</Link>
                    |
                    <Link to="/room">Room</Link>
                    |
                    <Link to="/clone-room">CloneRoom</Link>
                </div>
            </BrowserRouter>
        </>
    )
}

export default App
