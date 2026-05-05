import React from 'react'
import { useEffect, useState } from 'react'
import axios from 'axios'

const NewDevice = () => {

     const[devices, setDevices] = useState();
     const[viewState, setViewState] = useState("Please authenticate in server console");

     const [deviceName, setDeviceName] = useState("");
     const [selectedUser, setSelectedUser] = useState("");
     const [selectedIP, setSelectedIP] = useState("");
     const [loading, setLoading] = useState("");

     const data = {};

     useEffect(() => {
         getHosts();
     }, []);

    const handleSelection = (ip) => {
        setSelectedIP(ip);
        setViewState("setName")
    }


    const postData = async(ip, name, user) => {
        const body = {"ip": ip, "name": name, "user":user};
        console.log(body)
        const response = await axios.post("http://127.0.0.1:8000/api/addDevice/", body,
            {headers:{'Content-Type':'multipart/form-data',}})

        console.log(response)
        setViewState(response.data)
        return response.data
    }

    const addDevice = async(ip, name, user) => {
        setLoading("Loading...")
        const newData = await postData(ip, name, user)

    }


    const getHosts = async () => {

        try{
            const response = await fetch("http://127.0.0.1:8000/api/listDevices/");
            const data = await response.json();

            console.log(data);
            setDevices(data);
            setViewState("deivces");
        } catch(err){
            console.log(err)
        }
    };

    if(viewState == "Loading..." || viewState == "Please authenticate in server console"){
        return(
        <>
        <h1> Add new device </h1>
        <div>
            {viewState}
        </div>
        </>
        )
    }
    if(viewState == "setName"){
        return(
            <>
            <h1> Set device name </h1>
            <form>
                <input type="text" placeholder="Device name" onChange={(e) => setDeviceName(e.target.value)}/>
                <input type="text" placeholder="Device user" onChange={(e) => setSelectedUser(e.target.value)}/>
            </form>
            {loading}
            <button className="addButton" onClick={() => addDevice(selectedIP, deviceName, selectedUser)}>Add Device</button>
            </>
        )
    }
    if(viewState == "success"){
        return(
            <>
            <h1> Data sent! </h1>
            </>
        )
    }
    return(
        <>
        <h1> Add new device </h1>
        <div className="parentContainer">
            <div className="childIP">
                {devices.map((host) => (
                    <div key={host.ip}><a onClick={() => handleSelection(host.ip)}>{host.ip}</a>:</div>
                ))}
            </div>
            <div className="childVendor">
                {devices.map((host) => (
                    <div key={host.ip}>{host.connected ? <div style={{color:'#fcba03' }}> {host.vendor + " <connected> "}</div>: host.vendor}</div>
                ))}
            </div>
        </div>
        </>
    );
}

export default NewDevice