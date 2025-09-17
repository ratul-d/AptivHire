import pickle
import base64
from email.mime.text import MIMEText
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google.oauth2.credentials import Credentials
import asyncio
import os

def load_gmail_creds():
    # Try local first
    local_path = "token.pkl"
    render_path = "/etc/secrets/token_b64.txt"

    if os.path.exists(local_path):
        with open(local_path, "rb") as f:
            creds: Credentials = pickle.load(f)
    elif os.path.exists(render_path):
        with open(render_path, "r") as f:
            b64_data = f.read().strip()
        data = base64.b64decode(b64_data)
        creds: Credentials = pickle.loads(data)
    else:
        raise FileNotFoundError("No token credentials found!")

    return creds

# Load saved credentials
creds = load_gmail_creds()

# Initialize Gmail API
service = build("gmail", "v1", credentials=creds)


async def send_email(subject: str, body: str, recipient_email: str, reply_to: str = None) -> bool:

    try:
        # Build the MIME message
        msg = MIMEText(body)
        msg["To"] = recipient_email
        msg["Subject"] = subject
        if reply_to:
            msg["Reply-To"] = reply_to

        raw_message = base64.urlsafe_b64encode(msg.as_bytes()).decode()
        message = {"raw": raw_message}

        # Gmail API call should run in executor to avoid blocking event loop
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, lambda: service.users().messages().send(userId="me", body=message).execute())

        return True
    except HttpError as e:
        print(f"Gmail API error: {e}")
        return False
    except Exception as e:
        print(f"Unexpected error: {e}")
        return False
