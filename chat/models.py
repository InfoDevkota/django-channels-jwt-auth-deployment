from django.db import models

from django.contrib.auth.hashers import make_password, check_password

# Create your models here.
class User(models.Model):
    user_name = models.CharField(max_length=30, unique=True)
    name = models.CharField(max_length=30)
    password = models.CharField(max_length=30)

    def __str__(self): 
        return '{\n\tuser_name: %s\
        \n\tname: %s\
        \n\tpassword: %s\n}' % (self.user_name, self.name, self.password)


# for testing
def create_user():
    print("create user called")
    a_pass = make_password("sita")
    user = User(name="Ram", user_name="ram2", password=a_pass)
    user.save()
    print(user)

# create_user()

def validate_password():
    user = User.objects.get(user_name="ram2")
    print(str(user))
    pass_matched = check_password("sita", user.password)
    pass_matched2 = check_password("sita123", user.password)
    print(pass_matched)
    print(pass_matched2)

    
# validate_password()