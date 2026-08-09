from django.conf import settings
from pywebpush import webpush, WebPushException
import json
from .models import Notification, PushSubscription

def create_notification(user, title, message):
    # 1. Save to DB for the in-app Notifications page
    Notification.objects.create(
        user=user,
        title=title,
        message=message
    )
    
    # 2. Try to send web push for the OS notification bar
    send_web_push(user, title, message)

def send_web_push(user, title, message):
    subscriptions = PushSubscription.objects.filter(user=user)
    if not subscriptions.exists():
        return
        
    payload = json.dumps({
        'title': title,
        'body': message,
        'icon': '/FinSet_Logo.png'
    })
    
    for sub in subscriptions:
        try:
            webpush(
                subscription_info={
                    "endpoint": sub.endpoint,
                    "keys": {
                        "p256dh": sub.p256dh,
                        "auth": sub.auth
                    }
                },
                data=payload,
                vapid_private_key=settings.VAPID_PRIVATE_KEY,
                vapid_claims={
                    "sub": "mailto:admin@example.com"
                }
            )
        except WebPushException as ex:
            print("Web push failed:", repr(ex))
            if ex.response and ex.response.status_code in [404, 410]:
                sub.delete()
