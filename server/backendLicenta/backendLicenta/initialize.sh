#!/bin/bash

mkdir ~/RemoteMonitor
curl --output ~/RemoteMonitor/TCP_receive.py "https://raw.githubusercontent.com/TarniceriuLuca/proiectLicenta/refs/heads/main/TCP_receive.py"
curl --output ~/RemoteMonitor/getInfo.py "https://raw.githubusercontent.com/TarniceriuLuca/proiectLicenta/refs/heads/main/getInfo.py"
curl --output ~/RemoteMonitor/pipRequirements.txt "https://raw.githubusercontent.com/TarniceriuLuca/proiectLicenta/refs/heads/main/pipRequirements.txt"

python3 -m venv ~/RemoteMonitor/.venv
source ~/RemoteMonitor/.venv/bin/activate
pip install -r ~/RemoteMonitor/pipRequirements.txt