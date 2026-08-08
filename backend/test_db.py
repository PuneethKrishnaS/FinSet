import psycopg2
import sys

try:
    conn = psycopg2.connect(
        dbname='neondb',
        user='neondb_owner',
        password='npg_RAVn3vSiBFX8',
        host='ep-orange-voice-ao9a4yew-pooler.c-2.ap-southeast-1.aws.neon.tech',
        port='5432',
        sslmode='require',
        options='endpoint=ep-orange-voice-ao9a4yew-pooler'
    )
    print("Connection successful!")
    conn.close()
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
