import re
from typing import Optional

PASSWORD_REGEX = re.compile(r'^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$')

def validate_password_policy(pwd: str) -> bool:
    return bool(PASSWORD_REGEX.match(pwd or ""))

def normalize_email(email: Optional[str]) -> str:
    return (email or "").strip().lower()
