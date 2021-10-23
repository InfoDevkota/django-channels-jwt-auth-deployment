"""
ASGI config for pubchat project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "pubchat.settings")

django_asgi_app = get_asgi_application()


from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter

import chat.routing

from chat.middleware.userAuthMiddlware import UserAuthMiddleware

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "pubchat.settings")

# application = get_asgi_application()
application = ProtocolTypeRouter({
  "http": django_asgi_app,
  "websocket": UserAuthMiddleware(
        URLRouter(
            chat.routing.websocket_urlpatterns
        )
    ),
})
