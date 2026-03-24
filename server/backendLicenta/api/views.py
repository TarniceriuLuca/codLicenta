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
                sock.connect((client.ip, port))
                sock.sendall(bytes(data, "utf-8"))
                sock.sendall(b"\n")

                received = str(sock.recv(1024), "utf-8")
                time.sleep(0.3)
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
    print(subprocess.run("pwd", capture_output=True, text=True).stdout)


    newDevice = Client.objects.update_or_create(
        ip=ip,
        user=user,
        name=name
    )
    command1 = "ssh " + user + "@" + ip + " bash < ./backendLicenta/initialize.sh"
    os.system(command1)
    # install TCP_receive.py on targeted host
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
            sock.connect((client.ip, port))
            sock.sendall(bytes(data, "utf-8"))
            sock.sendall(b"\n")

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

    command = "ssh " + client.user + "@" + client.ip + " 'rm -r ~/RemoteMonitor'"
    subprocess.check_output(command, shell=True)
    responseData = []
    if Client.objects.get(pk=clientIP).delete():
        responseData.append({"result":"OK"})
    else:
        responseData.append({"result": "delete_err"})


    return Response(json.dumps(responseData))

@api_view(['POST'])
def shutdown_server(request):
    clientIP = request.POST['ip']
    client = Client.objects.get(pk=clientIP)
    port = 65432
    data = "shutdown"
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.connect((client.ip, port))
            sock.sendall(bytes(data, "utf-8"))
            sock.sendall(b"\n")

            received = str(sock.recv(1024), "utf-8")
            print(received)
            time.sleep(0.3)
    except:
        pass



