import pickle
import base64
from email.mime.text import MIMEText
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import asyncio

# Load saved credentials
with open("token.pkl", "rb") as f:
    creds = pickle.load(f)

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
