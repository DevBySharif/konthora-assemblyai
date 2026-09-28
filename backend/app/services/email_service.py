"""
Email service — mock for hackathon, real SMTP ready.

Hackathon mode: logs to email_log table (or prints).
Production: set SMTP_HOST, SMTP_PORT, SMTP_EMAIL, SMTP_PASSWORD.
"""
import os
import json
import time
from loguru import logger


def send_email(to: str, subject: str, body: str, channel: str = "email") -> dict:
    """
    Send email. Mock mode logs it, production sends via SMTP.

    Returns:
        {"success": bool, "message": str, "receipt_id": str}
    """
    receipt_id = f"DR-{int(time.time()) % 100000:05d}"

    smtp_host = os.getenv("SMTP_HOST", "")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_email = os.getenv("SMTP_EMAIL", "")
    smtp_password = os.getenv("SMTP_PASSWORD", "")

    if smtp_host and smtp_email and smtp_password:
        # Real SMTP sending
        try:
            import smtplib
            from email.mime.text import MIMEText

            msg = MIMEText(body)
            msg["Subject"] = subject
            msg["From"] = smtp_email
            msg["To"] = to

            with smtplib.SMTP(smtp_host, smtp_port) as server:
                server.starttls()
                server.login(smtp_email, smtp_password)
                server.sendmail(smtp_email, [to], msg.as_string())

            logger.info(f"Email sent to {to}: {subject} (receipt: {receipt_id})")
            return {"success": True, "message": f"Email sent to {to}", "receipt_id": receipt_id}
        except Exception as e:
            logger.error(f"SMTP error: {e}")
            return {"success": False, "message": f"SMTP error: {str(e)}", "receipt_id": receipt_id}
    else:
        # Mock mode — log the email
        logger.info(f"[MOCK EMAIL] To: {to} | Subject: {subject} | Body: {body[:100]}... | Receipt: {receipt_id}")
        return {
            "success": True,
            "message": f"[Mock] Email logged for {to}: '{body[:80]}' — Receipt {receipt_id} logged.",
            "receipt_id": receipt_id,
        }


def send_slack(channel: str, message: str) -> dict:
    """
    Send Slack webhook. Mock for now.
    """
    webhook_url = os.getenv("SLACK_WEBHOOK_URL", "")

    if webhook_url:
        try:
            import httpx
            resp = httpx.post(webhook_url, json={"text": message}, timeout=5.0)
            if resp.status_code == 200:
                return {"success": True, "message": f"Slack message posted to {channel}"}
        except Exception as e:
            logger.error(f"Slack webhook error: {e}")

    logger.info(f"[MOCK SLACK] #{channel}: {message[:100]}...")
    return {"success": True, "message": f"[Mock] Slack message posted to {channel}"}
