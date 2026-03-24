from django.urls import path
from .views import *

urlpatterns = [
    path('status/', get_status, name='get_status'),
    path('listDevices/', list_devices, name='list_devices'),
    path('addDevice/', add_device, name='add_device'),
    path('reconnect/', reconnect, name='reconnect'),
    path('ipStatus/', get_status_by_ip, name='get_status_by_ip'),
    path('runCommand/', run_command, name='run_command'),
    path('deleteClient/', delete_client, name='delete_client'),
    path('shutdownClient/', shutdown_server, name='shutdown_server')
]