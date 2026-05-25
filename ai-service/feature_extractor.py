import ipaddress
import re
from urllib.parse import urlparse

import pandas as pd

KEYWORDS = [
    "login",
    "free",
    "verify",
    "account",
    "bank",
    "secure",
    "update",
    "password",
]


def _has_ip_address(hostname: str) -> int:
    if not hostname:
        return 0
    try:
        ipaddress.ip_address(hostname)
        return 1
    except ValueError:
        return 0


def extract_url_features(url: str) -> dict:
    if not url:
        url = ""

    parsed = urlparse(url)
    hostname = parsed.hostname or ""

    url_lower = url.lower()

    features = {
        "url_length": len(url),
        "dot_count": url.count("."),
        "has_https": 1 if parsed.scheme == "https" else 0,
        "contains_login": 1 if "login" in url_lower else 0,
        "contains_free": 1 if "free" in url_lower else 0,
        "contains_at": 1 if "@" in url else 0,
        "has_ip_address": _has_ip_address(hostname),
        "suspicious_keyword_count": sum(1 for k in KEYWORDS if k in url_lower),
        "digit_count": len(re.findall(r"\d", url)),
        "hyphen_count": url.count("-"),
        "path_length": len(parsed.path or ""),
    }

    return features


def build_feature_frame(urls: pd.Series) -> pd.DataFrame:
    feature_rows = [extract_url_features(url) for url in urls]
    return pd.DataFrame(feature_rows)
