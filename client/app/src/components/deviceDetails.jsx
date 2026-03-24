import React from 'react'
import { useEffect, useState } from 'react'
import axios from 'axios'

const DeviceDetails = () => {

    const [data, setData] = useState([]);
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState("Loading...");
    const [command, setCommand] = useState();
    const [output, setOutput] = useState();

     useEffect(() => {
        updateStatus(localStorage.getItem('currentIP'));
    }, []);

    useEffect(() => {
    const interval = setInterval(() => {
        if(localStorage.getItem('currentPage') == "deviceDetails")
            updateStatus(localStorage.getItem('currentIP'));
    }, 5000);



    return () => clearInterval(interval);
    }, []);


    const updateStatus = async(ip) => {
        const body = {"ip": ip};
        const response = await axios.post("http://127.0.0.1:8000/api/ipStatus/", body,
            {headers:{'Content-Type':'multipart/form-data',}})

        var parsedData = JSON.parse(response.data)
        setData(parsedData[0])
        try{
        setStatus(parsedData[0].status)
        } catch(err){
            console.log(err)
        }
        setLoading("")
    }

const sendCommand = async() => {
        const body = {"ip":localStorage.getItem('currentIP'), "command": command};
        const response = await axios.post("http://127.0.0.1:8000/api/runCommand/", body,
            {headers:{'Content-Type':'multipart/form-data',}})

        var parsedData = JSON.parse(response.data)
        console.log(parsedData[0]);
        setOutput(parsedData[0].result)
    }

    if(loading === "Loading..."){
        return(
            <>
            <div className="leftContainer">
                <h1>DeviceDetails</h1>
                <h2>{loading}</h2>
            </div>
            </>
        )
    }else{
        return (
        <div className="mainCanvas">
            <div className="leftContainer">
                <h1>DeviceDetails</h1>
                <h2>{loading}</h2>
                <div className="detailsCanvas">
                    <div className="details">Name: {data.name}</div>
                    <div className="details">IP: {data.ip}</div>
                    <div className="details">User: {data.user}</div>
                    <div className="details">MEM%: {status[0]}%</div>
                    <div className="details">CPU%: {status[1]}%</div>
                    <div className="details">Last reboot: {status[2]}</div>
                    <div className="details">Platform: {status[3]}</div>
                    <div className="details">Cpu Brand: {status[4]}</div>
                    <div className="details">Total Memory: {status[5]} Gb</div>
                    <div className="details">Total Disk Size: {status[6]} Gb</div>
                    <div className="details">Available Disk Size: {status[7]} Gb</div>
                </div>
            </div>
            <div className="divider"/>
            <div className="rightContainer">
                    <input type="text" placeholder="run command..." onChange={(e) => setCommand(e.target.value)}/>
                    <button onClick={() => sendCommand()}>run!</button>
                    <div className="commandOutput">
                        Command: {command}
                        <br/>
                        Output: {output}
                    </div>
                    <br/>
                    <input type="file"/>
                    <button>upload</button>

            </div>

        </div>
    );
    }



}
export default DeviceDetails