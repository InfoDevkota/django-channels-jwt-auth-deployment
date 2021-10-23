# Django Channels WebSocket Authentication and Deployment

[Guide Article -> https://www.bloggernepal.com/2021/10/django-channels-websocket-authentication-deployment.html](https://www.bloggernepal.com/2021/10/django-channels-websocket-authentication-deployment.html)


1. make sure you have python installed.
2. make sure you have django installed. `$ python -m django --version` if not install it.
    ```
    python -m pip install Django
    ```

## Creating Project
`django-admin startproject pubchat`

## Create App.
`python3 manage.py startapp chat`

Add `'chat'` in the `INSTALLED_APPS` in settings.py of `pubchat/`

create `templates` in `chat` add `index.html` there, define view for index in `views.py`

in `chat/urls.py`
```
from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
]
```

in `pubchat/urls.py` import `include` from `django.conf.urls` and add urlpattern for `chat` app.
```
urlpatterns = [
    path('/', include('chat.urls')),
    ...
]
```

for static content add 
```
STATICFILES_DIRS = [
    BASE_DIR / "static",
]
```
We will use different config for deployment

now `$ python manage.py runserver`, you should see the contents on the template on root.

## setup channels

Verify you have Django Channels installed `$ python -c 'import channels; print(channels.__version__)'` 
if not, install it 
```
    python -m pip install -U channels
```

Now add `'channels'` in the INSTALLED_APPS;

install pyjwt as well
```
    pip install pyjwt
```

## channels authentication
we have already used AuthMiddlewareStack in `asgi.py`, which supports standard Django authentication, where the user details are stored in the session. 

for our jwt token, let's now use our own middleware