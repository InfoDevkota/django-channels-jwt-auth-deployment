# chat/consumers.py
import json

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from django.contrib.auth.hashers import make_password, check_password

import jwt

from chat.models import User

class AuthConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()

    def disconnect(self, close_code):
        # clean here
        print("disconnected")
        
    # Receive message from client WebSocket
    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        # print(text_data_json)

        eventType = text_data_json['type']

        if eventType == 'register':
            name = text_data_json['data']['name']
            user_name = text_data_json['data']['userName']
            password = text_data_json['data']['password']

            print("Register", name, user_name)

            a_pass = make_password(password)
            user = User(name=name, user_name=user_name, password=a_pass)
            
            try:
                user.save()
            except:
                # // may be because of username
                self.send(text_data=json.dumps({
                    'type': 'message',
                    'data': {
                        'message': "User Registration Failed. Try New Username"
                    }
                }))
                return


            self.send(text_data=json.dumps({
                'type': 'message',
                'data': {
                    'message': "User Registered."
                }
            }))


        if eventType == 'login':
            user_name = text_data_json['data']['userName']
            password = text_data_json['data']['password']

            print("Login", user_name)

            user = False

            try: 
                user = User.objects.get(user_name=user_name)
            except:
                # nothig
                print("user not found")

            if(not user):
                self.send(text_data=json.dumps({
                    'type': 'message',
                    'data': {
                        'message': "Login Failed. No user associated with the username."
                    }
                }))
                return
            
            pass_matched = check_password(password, user.password)

            if(not pass_matched):
                self.send(text_data=json.dumps({
                    'type': 'message',
                    'data': {
                        'message': "Login Failed. password did not match."
                    }
                }))
                return
            
            # print(user)
            token = jwt.encode({
                'id': user.id,
                "userName": user.user_name,
                "name": user.name,
            }, "secret", algorithm="HS256")

            self.send(text_data=json.dumps({
                'type': 'loginInfo',
                'data': {
                    'message': "Login Success.",
                    'token': token,
                    'user': {
                        'id': user.id,
                        'user_name': user.user_name,
                        "name": user.name
                    }
                }
            }))


            # for test
            tokenData = jwt.decode(token, "secret", algorithms=["HS256"])
            print(tokenData)
            user_id = tokenData['id']
            print(user_id)


                          

