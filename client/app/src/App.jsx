import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import NewDevice from './components/newDevice';
import Monitoring from './components/monitoring';
import DeviceDetails from './components/deviceDetails';

function App() {

    if (!localStorage.getItem('currentPage'))
        localStorage.setItem('currentPage', 'monitoring')
    const [page, setPage] = useState(localStorage.getItem('currentPage'))

    if (!localStorage.getItem('currentIP'))
        localStorage.setItem('currentIP', 'NULL')
    const [currentIP, setCurrentIP] = useState(localStorage.getItem('currentIP'))

    if (!localStorage.getItem('currentUser'))
        localStorage.setItem('currentUser', 'NULL')
    const [currentUser, setCurrentUser] = useState(localStorage.getItem('currentUser'))

    return (
        <>

            <div className="navbar">
                <button onClick={() => {localStorage.setItem('currentPage', 'monitoring'); setPage(localStorage.getItem('currentPage'))}}>Monitor</button>
                <button onClick={() => {localStorage.setItem('currentPage', 'newDevice'); setPage(localStorage.getItem('currentPage'))}}>Add Device</button>
            </div>
            {localStorage.getItem('currentPage') === "newDevice" && <NewDevice/>}
            {localStorage.getItem('currentPage') === "monitoring" && <Monitoring/>}
            {localStorage.getItem('currentPage') === "deviceDetails" && <DeviceDetails/>}
        </>
    );
}

export default App
