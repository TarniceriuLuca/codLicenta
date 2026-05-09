import React from 'react'
import { useEffect, useState } from 'react'
import axios from 'axios'

export default function Monitoring() {

    const [status, setStatus] = useState([]);
    const [loading, setLoading] = useState("Loading...");

     useEffect(() => {
        updateStatus();
    }, []);

    useEffect(() => {
    const interval = setInterval(() => {
        if(localStorage.getItem('currentPage') == "monitoring")
            updateStatus();
    }, 5000);



    return () => clearInterval(interval);
    }, []);

    const updateStatus = async () => {
        try{
            const response = await fetch("http://127.0.0.1:8000/api/status/");
            const data = await response.json();
            setStatus(data);
            setLoading("");
        } catch(err){
            console.log(err)
        }

    };

    const postData = async(ip, user) => {
        const body = {"ip": ip, "user":user};
        console.log(body)
        const response = await axios.post("http://127.0.0.1:8000/api/reconnect/", body,
            {headers:{'Content-Type':'multipart/form-data',}})
        console.log(response)
        return response.data
    }

    const reconnect = async(ip, user) => {
        const newData = await postData(ip, user)
    }

    const openDetails = async(ip, user) => {
        localStorage.setItem('currentIP', ip)
        localStorage.setItem('currentUser', user)
        localStorage.setItem('currentPage', 'deviceDetails')
        console.log(localStorage.getItem('currentUser') + " " + localStorage.getItem('currentIP'))
        window.location.reload()
    }

    const deleteClient = async(ip) => {
            const body = {"ip": ip};
            console.log(body)
            const response = await axios.post("http://127.0.0.1:8000/api/deleteClient/", body,
                {headers:{'Content-Type':'multipart/form-data',}})
            console.log(response)
    }

    const removeClient = async(ip) => {
            const body = {"ip": ip};
            const response = await axios.post("http://127.0.0.1:8000/api/removeClient/", body,
                {headers:{'Content-Type':'multipart/form-data',}})
            console.log(response)
    }

    const shutdownClient = async(ip) => {
            const body = {"ip": ip};
            console.log(body)
            const response = await axios.post("http://127.0.0.1:8000/api/shutdownClient/", body,
                {headers:{'Content-Type':'multipart/form-data',}})
            console.log(response)
    }

     return (
        <>
            <h1>Monitoring</h1>
            <h2>{loading}</h2>
            <div className="mainCanvas">
                {status.map((client) => (
                    <div key={client.ip} className="monitorCard" >
                        <a className="clientName" onClick={() => openDetails(client.ip, client.user)}> {client.name}</a>
                        <div className="progressBarExt" style={{borderColor: "white"}}>
                            <div className="progressBarInt" style={{ width: `${2*client.status[0]}px`, backgroundColor: "white"}}>
                            </div>
                        </div>

                        <div className="progressBarExt" style={{borderColor: "#fcba03"}}>
                            <div className="progressBarInt" style={{ width: `${2*client.status[1]}px`, backgroundColor: "#fcba03"}}>
                            </div>
                        </div>

                        <span> mem: {client.status[0]} </span>
                        <span> cpu: {client.status[1]} </span>

                        {client.status[0] == "n/a" &&
                            <a className="reconnectBtn" onClick={() => reconnect(client.ip, client.user)}>reconnect</a> ||
                            <a className="shutdownBtn" onClick={() => shutdownClient(client.ip)}>Shutdown</a>
                            }

                        {client.status[0] == "n/a" &&
                            <a className="forceDelBtn" onClick={() => removeClient(client.ip)}>Remove</a> ||
                            <a className="deleteBtn" onClick={() => deleteClient(client.ip)}>Delete</a>
                        }

                    </div>
                ))}
            </div>

        </>
    );
}
