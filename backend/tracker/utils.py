import json
from pywebpush import webpush, WebPushException
from django.conf import settings
from .models import PushSubscription

def send_web_push(user, title, message):
    subscriptions = PushSubscription.objects.filter(user=user)
    if not subscriptions.exists():
        return
        
    vapid_private_key = getattr(settings, 'VAPID_PRIVATE_KEY', None)
    vapid_admin_email = getattr(settings, 'VAPID_ADMIN_EMAIL', 'mailto:admin@example.com')
    
    if not vapid_private_key:
        print("VAPID_PRIVATE_KEY not configured")
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
                vapid_private_key=vapid_private_key,
                vapid_claims={"sub": vapid_admin_email}
            )
        except WebPushException as ex:
            print(f"Web Push Failed: {repr(ex)}")
            # If subscription is invalid/expired, remove it
            if ex.response and ex.response.status_code in [404, 410]:
                sub.delete()
