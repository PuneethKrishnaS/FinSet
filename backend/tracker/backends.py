from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

class EmailBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        UserModel = get_user_model()
        try:
            user = UserModel.objects.filter(email=username).first()
            if not user:
                user = UserModel.objects.filter(username=username).first()
            if not user:
                return None
        except Exception:
            return None
        if user.check_password(password):
            return user
        return None
