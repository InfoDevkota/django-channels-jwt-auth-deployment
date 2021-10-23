# call/routing.py
from django.urls import re_path

from . import auth_consumers

websocket_urlpatterns = [
    re_path(r'ws/auth/', auth_consumers.AuthConsumer.as_asgi()),
]