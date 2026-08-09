import base64
from cryptography.hazmat.primitives.asymmetric import ec

private_key = ec.generate_private_key(ec.SECP256R1())
private_bytes = private_key.private_numbers().private_value.to_bytes(32, 'big')

public_key = private_key.public_key()
public_bytes = b'\x04' + public_key.public_numbers().x.to_bytes(32, 'big') + public_key.public_numbers().y.to_bytes(32, 'big')

print('VAPID_PRIVATE_KEY=' + base64.urlsafe_b64encode(private_bytes).decode('ascii').rstrip('='))
print('VAPID_PUBLIC_KEY=' + base64.urlsafe_b64encode(public_bytes).decode('ascii').rstrip('='))
