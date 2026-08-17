import os
import aiosmtplib
from email.message import EmailMessage

async def send_email(to_email: str, subject: str, body: str, is_html: bool = False):
    smtp_server = os.getenv("SMTP_SERVER")
    smtp_port = os.getenv("SMTP_PORT")
    smtp_user = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")

    if not all([smtp_server, smtp_port, smtp_user, smtp_password]):
        print(f"SMTP configuration missing. Simulating email to {to_email}")
        print(f"Subject: {subject}\nBody: {body}")
        return True

    message = EmailMessage()
    message["From"] = smtp_user
    message["To"] = to_email
    message["Subject"] = subject
    
    if is_html:
        message.add_alternative(body, subtype='html')
    else:
        message.set_content(body)

    try:
        await aiosmtplib.send(
            message,
            hostname=smtp_server,
            port=int(smtp_port),
            username=smtp_user,
            password=smtp_password,
            start_tls=True
        )
        print(f"Email successfully sent to {to_email}")
        return True
    except Exception as e:
        print(f"Failed to send email to {to_email}. Error: {str(e)}")
        # We can either raise an exception or return False. Returning False for simplicity.
        return False
