# chat/consumers.py
import json

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

from datetime import datetime

class ChatConsumer(WebsocketConsumer):
    def connect(self):

        user = self.scope.get('user', False)

        if(not user): 
            print("Un authorized user")
            self.accept()
            self.send(text_data=json.dumps({
                'type': 'message',
                'data': {
                    'message': "Not Authenticated.."
                }
            }))
            self.send(text_data=json.dumps({
                'type': 'noAuth',
            }))
            self.close()
            return


        # print(user)
        self.user = user
        async_to_sync(self.channel_layer.group_add)(
            "pubchat",
            self.channel_name
        )
        self.accept()

    def disconnect(self, close_code):
        # clean here
        print("disconnected")
    
    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        # print(text_data_json)

        eventType = text_data_json['type']

        if eventType == 'message':
            message = text_data_json['data']['message']
            my_date = datetime.utcnow()

            async_to_sync(self.channel_layer.group_send)(
                "pubchat",
                {
                    'type': 'new_message',
                    'data': {
                        'sender': self.user,
                        'message': message,
                        'date': my_date.astimezone().isoformat()
                    }
                }
            )
    
    def new_message(self, event):

        # print(event)
        self.send(text_data=json.dumps({
            'type': 'newMessage',
            'data': event['data']
        }))