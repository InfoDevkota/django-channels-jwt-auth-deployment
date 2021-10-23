# call/routing.py
from django.urls import re_path

from . import auth_consumers
from . import chat_consumers

websocket_urlpatterns = [
    re_path(r'ws/auth/', auth_consumers.AuthConsumer.as_asgi()),
    re_path(r'ws/chat/', chat_consumers.ChatConsumer.as_asgi()),
]