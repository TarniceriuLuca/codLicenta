import React from 'react'
import { useEffect, useState } from 'react'
import axios from 'axios'

const DeviceDetails = () => {

    const [data, setData] = useState([]);
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState("Loading...");
    const [command, setCommand] = useState();
    const [output, setOutput] = useState();
    const [selectedFile, setSelectedFile] = useState(null);
    const [runButtonText, setRunButtonText] = useState("run!");
    const [uploadButtonText, setUploadButtonText] = useState("upload")
    const [selectedTime, setSelectedTime] = useState("transfer");

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

        setData(response.data[0])
        try{
        setStatus(response.data[0].status)
        } catch(err){
            console.log(err)
        }
        setLoading("")
    }

    const sendCommand = async() => {
        setRunButtonText("running...");
        const body = {"ip":localStorage.getItem('currentIP'), "command": command};
        const response = await axios.post("http://127.0.0.1:8000/api/runCommand/", body,
            {headers:{'Content-Type':'multipart/form-data',}})


        console.log(response.data[0]);
        setOutput(response.data[0].result)
        setRunButtonText("run!");
    }


    const uploadFile = async() => {
        setUploadButtonText("uploading...");
        const formData = new FormData();
        formData.append("script", selectedFile);
        formData.append("ip", localStorage.getItem('currentIP'));
        formData.append("fileName", selectedFile.name);
        formData.append("time", selectedTime);

        try{
            const response = await axios.post(
                "http://127.0.0.1:8000/api/uploadFile/",
                formData,{
                    headers: {"Content-Type": "multipart/form-data"},
                    maxBodyLength: 10000000,
                    maxContentLength: 10000000
            },);
            console.log(response.data[0]);
        } catch (error){
            console.error(error.response.data);
        }
        setUploadButtonText("upload");
    }

    const handleTimeChange = (event) =>{
        setSelectedTime(event.target.value);
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
                    <button onClick={() => sendCommand()}>{runButtonText}</button>
                    <div className="commandOutput">
                        Output: {output}
                    </div>


                        <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])}/>
                        <br/><br/>
                        Run frequency:<br/>
                        <label>
                            <input type="radio" name="selectedTime" value="transfer" checked={selectedTime === 'transfer'} onChange={handleTimeChange}/>
                            transfer
                        </label>
                        <label>
                            <input type="radio" name="selectedTime" value="run" checked={selectedTime === 'run'} onChange={handleTimeChange}/>
                            run now
                        </label>
                        <label>
                            <input type="radio" name="selectedTime" value="day" checked={selectedTime === 'day'} onChange={handleTimeChange}/>
                            every day
                        </label>

                        <label>
                            <input type="radio" name="selectedTime" value="hour" checked={selectedTime === 'hour'} onChange={handleTimeChange}/>
                            every hour
                        </label>

                        <label>
                            <input type="radio" name="selectedTime" value="startup" checked={selectedTime === 'startup'} onChange={handleTimeChange}/>
                            at startup
                        </label>
                        <br/><br/>
                        <button onClick={() => uploadFile()}>upload</button>


            </div>

        </div>
    );
    }



}
export default DeviceDetails