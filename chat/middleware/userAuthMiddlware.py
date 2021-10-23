import jwt

class UserAuthMiddleware:
    def __init__(self, app):
        # Store the ASGI application we were passed
        self.app = app

    async def __call__(self, scope, receive, send):

        token= False
        query = scope["query_string"]
        if(query):
            query = query.decode()
        if(query):
            query = query.split('=')
            if(query[0] == 'token'):
                token = query[1]
        
        if(token):
            # jwt token let's decode it
            tokenData = jwt.decode(token, "secret", algorithms=["HS256"])
            # save it on user scop
            scope['user'] = tokenData

        return await self.app(scope, receive, send)