Google Cloud Gmail API Setup Instructions
=========================================

1. Create a Google Cloud project

2. Enable Gmail API

3. Create OAuth 2.0 Client ID under Credentials

4. Download JSON & save in project root as `credentials.json`

5. Generate token using the following `script.py`:

```python
from google_auth_oauthlib.flow import InstalledAppFlow
import pickle

# Gmail API scope for sending emails
SCOPES = ["https://www.googleapis.com/auth/gmail.send"]

# Path to your downloaded credentials JSON
CREDENTIALS_FILE = "credentials.json"

# Create the OAuth flow
flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)

# This will open a browser to authorize your Gmail account
creds = flow.run_local_server(port=0)

# Save the credentials (includes refresh token) for later use
with open("token.pkl", "wb") as token_file:
    pickle.dump(creds, token_file)

print("OAuth token saved to token.pkl")
```

6. Delete `script.py` and add `token.pkl` to gitignore.

7. Use the token like this:
```python
import pickle
from googleapiclient.discovery import build

# Load the saved credentials
with open("token.pkl", "rb") as f:
    creds = pickle.load(f)

# Initialize Gmail API
service = build("gmail", "v1", credentials=creds)
```