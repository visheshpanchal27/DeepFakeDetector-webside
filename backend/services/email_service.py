import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders

class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.email = os.getenv('SMTP_EMAIL')
        self.password = os.getenv('SMTP_PASSWORD')
    
    def send_email(self, to_email, subject, body, html_body=None):
        try:
            if not self.email or not self.password:
                print("[ERROR] Email credentials not configured")
                return False
            
            msg = MIMEMultipart('alternative')
            msg['From'] = self.email
            msg['To'] = to_email
            msg['Subject'] = subject
            
            # Add plain text
            msg.attach(MIMEText(body, 'plain'))
            
            # Add HTML if provided
            if html_body:
                msg.attach(MIMEText(html_body, 'html'))
            
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.email, self.password)
            server.send_message(msg)
            server.quit()
            
            print(f"[SUCCESS] Email sent to {to_email}")
            return True
            
        except Exception as e:
            print(f"[ERROR] Email send failed: {e}")
            return False
    
    def send_verification_email(self, to_email, otp):
        subject = "DeepFake Detector - Email Verification"
        body = f"Your verification OTP is: {otp}\n\nThis OTP will expire in 10 minutes."
        html_body = f"""
        <html>
        <body>
            <h2>DeepFake Detector - Email Verification</h2>
            <p>Your verification OTP is: <strong>{otp}</strong></p>
            <p>This OTP will expire in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
        </body>
        </html>
        """
        return self.send_email(to_email, subject, body, html_body)
    
    def send_password_reset_email(self, to_email, otp):
        subject = "DeepFake Detector - Password Reset"
        body = f"Your password reset OTP is: {otp}\n\nThis OTP will expire in 10 minutes."
        html_body = f"""
        <html>
        <body>
            <h2>DeepFake Detector - Password Reset</h2>
            <p>Your password reset OTP is: <strong>{otp}</strong></p>
            <p>This OTP will expire in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
        </body>
        </html>
        """
        return self.send_email(to_email, subject, body, html_body)