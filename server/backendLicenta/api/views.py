import json, time, os
import subprocess

from django.core.handlers.exception import response_for_exception
from django.shortcuts import render
from django.utils.choices import BaseChoiceIterator
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import socket, sys
from .models import Client


# Create your views here.


@api_view(['GET'])
def get_status(request):
    client = Client.objects.all()
    port = 65432
    data = "request_status"
    responseData = []
    for client in client:
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
                sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
                sock.connect((client.ip, port))
                sock.sendall(bytes(data, "utf-8"))

                received = str(sock.recv(1024), "utf-8")
        except:
            received = '["not available", "not available"]'
        # print("Received:", json.loads(received))
        responseData.append({"name" : client.name, "ip": client.ip, "user": client.user, "status" : json.loads(received)})

    return Response(json.dumps(responseData))

@api_view(['GET'])
def list_devices(request):
    responseData = []
    command = ["sudo", "arp-scan", "--plain", "--format=${ip}, ${vendor}", "-l"]
    activeHosts = subprocess.run(command, capture_output=True, text=True).stdout
    activeHosts = activeHosts.split("\n")
    del activeHosts[-1] #sterge ultimul element null, creat din cauza ultimului caracter newline '\n'
    activeHosts.sort()
    activeHosts = list(dict.fromkeys(activeHosts)) #sterge intrarile duplicate
    # print(activeHosts)
    for hosts in activeHosts:
        formatedData = hosts.split(",")
        # print(formatedData[1])
        if Client.objects.filter(ip=formatedData[0]):
            responseData.append({"ip": formatedData[0], "vendor": formatedData[1], "connected": 1})
        else:
            responseData.append({"ip": formatedData[0], "vendor": formatedData[1], "connected": 0})

    return Response(json.dumps(responseData))

@api_view(['POST'])
def add_device(request):
    ip = request.POST['ip']
    name = request.POST['name']
    user = request.POST['user']
    print(ip, name)


    newDevice = Client.objects.update_or_create(
        ip=ip,
        user=user,
        name=name
    )
    command1 = "ssh " + user + "@" + ip + " bash < ./backendLicenta/initialize.sh"

    os.system(command1)
    return Response("OK")

@api_view(['POST'])
def reconnect(request):
    ip = request.POST['ip']
    user = request.POST['user']

    command = "ssh " + user+"@"+ip + " \" nohup python3 ~/RemoteMonitor/TCP_receive.py\""
    subprocess.Popen(command, shell=True)

    return Response("OK")

@api_view(['POST'])
def get_status_by_ip(request):
    clientIP = request.POST['ip']
    client = Client.objects.get(pk=clientIP)
    port = 65432
    data = "request_status"
    responseData = []

    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            sock.connect((client.ip, port))
            sock.sendall(bytes(data, "utf-8"))

            received = str(sock.recv(1024), "utf-8")
            time.sleep(0.3)
    except:
        received = '["not available", "not available"]'
    # print("Received:", json.loads(received))
    responseData.append({"name": client.name, "ip": client.ip, "user": client.user, "status": json.loads(received)})
    return Response(json.dumps(responseData))

@api_view(['POST'])
def run_command(request):
    clientIP = request.POST['ip']
    commandInput = request.POST['command']
    client = Client.objects.get(pk=clientIP)

    responseData = []

    command = "ssh " + client.user + "@" + client.ip + " '" + commandInput + "'"
    # os.system(command)
    result = str(subprocess.check_output(command, shell=True), "utf-8")
    print(result)
    responseData.append({"result":result})

    return Response(json.dumps(responseData))


@api_view(['POST'])
def delete_client(request):
    clientIP = request.POST['ip']
    client = Client.objects.get(pk=clientIP)
    shutdown_client(request)
    command = "ssh " + client.user + "@" + client.ip + " 'rm -r ~/RemoteMonitor'"
    subprocess.check_output(command, shell=True)
    responseData = []
    if Client.objects.get(pk=clientIP).delete():
        responseData.append({"result":"OK"})
    else:
        responseData.append({"result": "delete_err"})


    return Response(json.dumps(responseData))

@api_view(['POST'])
def shutdown_client(request):
    clientIP = request.POST['ip']
    client = Client.objects.get(pk=clientIP)
    port = 65432
    data = "shutdown"
    responseData = []
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            sock.connect((client.ip, port))
            sock.sendall(bytes(data, "utf-8"))

            received = str(sock.recv(1024), "utf-8")
            print(received)
    except:
        pass
    responseData.append({"result": received})
    return Response(json.dumps(responseData))



@api_view(['POST'])
def upload_file(request):
    responseData = []
    print("called file upload")
    if request.method == "POST":
        script = request.FILES.get('script')
        clientIP = request.POST['ip']
        fileName = request.POST['fileName']
        time = request.POST['time']
        client = Client.objects.get(pk=clientIP)
        print(clientIP)
        responseData.append({"result": "received"})

        file_content = script.read().decode("utf_8")
        with open("/tmp/remoteScript", 'w') as tmp:
            tmp.write(file_content)
        print(file_content, time)

        if time != "run":
            command = "scp /tmp/remoteScript " + client.user + "@" + client.ip + ":~/RemoteMonitor/" + fileName
            subprocess.check_output(command, shell=True)
            command = "ssh " + client.user + "@" + client.ip + " \"chmod +x ~/RemoteMonitor/\"" + fileName
            subprocess.check_output(command, shell=True)

        if time == "transfer":
            command = "null"
            cronString = "null"
        elif time == "run":
            command = "ssh " + client.user + "@" + client.ip + " bash < ~/RemoteMonitor/" + fileName
            cronString = "null"
        elif time == "day":
            command = "null"
            cronString = "@daily ~/RemoteMonitor/" + fileName
        elif time == "hour":
            command = "null"
            cronString = "@hourly ~/RemoteMonitor/" + fileName
        elif time == "startup":
            command = "null"
            cronString = "@reboot ~/RemoteMonitor/" + fileName
        else:
            command = "null"
            cronString = "null"

        if cronString != "null":
            print(cronString)
            copy_current_crontab = "ssh " + client.user + "@" + client.ip + " \"crontab -l > /tmp/cronjob\""
            subprocess.check_output(copy_current_crontab, shell=True)
            edit_tmp_file = "ssh " + client.user + "@" + client.ip + " \"echo \'" + cronString + "\' >> /tmp/cronjob\""
            subprocess.check_output(edit_tmp_file, shell=True)
            apply_new_crontab = "ssh " + client.user + "@" + client.ip + " crontab /tmp/cronjob"
            subprocess.check_output(apply_new_crontab, shell=True)
            remove_temp_file = "ssh " + client.user + "@" + client.ip + " rm -rf /tmp/cronjob"
            subprocess.check_output(remove_temp_file, shell=True)
        if command != "null":
            subprocess.check_output(command, shell=True)
    return Response(json.dumps(responseData))