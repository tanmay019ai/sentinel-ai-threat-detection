import time
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup

USER_AGENT = "SentinelAI-Scanner/1.0"


def _safe_hostname(url: str) -> str:
    return urlparse(url).hostname or ""


def _normalize_script_src(src: str) -> str:
    if not src:
        return ""
    if src.startswith("//"):
        return f"http:{src}"
    return src


def _analyze_html(html: str, base_domain: str) -> dict:
    soup = BeautifulSoup(html or "", "html.parser")

    form_count = len(soup.find_all("form"))
    iframe_count = len(soup.find_all("iframe"))
    script_tags = soup.find_all("script")
    script_count = len(script_tags)

    external_script_count = 0
    for tag in script_tags:
        src = _normalize_script_src(tag.get("src", ""))
        if not src:
            continue
        host = urlparse(src).hostname
        if host and base_domain and host != base_domain:
            external_script_count += 1

    password_input_count = len(soup.find_all("input", {"type": "password"}))
    hidden_input_count = len(soup.find_all("input", {"type": "hidden"}))

    hidden_style_count = 0
    for tag in soup.find_all(style=True):
        style = tag.get("style", "").lower()
        if "display:none" in style or "visibility:hidden" in style:
            hidden_style_count += 1

    hidden_element_count = hidden_input_count + hidden_style_count

    return {
        "form_count": form_count,
        "iframe_count": iframe_count,
        "script_count": script_count,
        "external_script_count": external_script_count,
        "password_input_count": password_input_count,
        "hidden_element_count": hidden_element_count,
    }


def fetch_and_analyze(url: str, timeout: int = 8) -> dict:
    start = time.perf_counter()
    domain = _safe_hostname(url)

    result = {
        "domain": domain,
        "fetch_status": None,
        "error": None,
        "scan_duration": 0.0,
        "html_analysis": {
            "form_count": 0,
            "iframe_count": 0,
            "script_count": 0,
            "external_script_count": 0,
            "password_input_count": 0,
            "hidden_element_count": 0,
        },
    }

    try:
        response = requests.get(
            url,
            timeout=timeout,
            allow_redirects=True,
            headers={"User-Agent": USER_AGENT},
        )
        result["fetch_status"] = response.status_code
        result["html_analysis"] = _analyze_html(response.text, domain)
    except requests.RequestException as exc:
        result["error"] = str(exc)
    finally:
        result["scan_duration"] = round((time.perf_counter() - start) * 1000, 2)

    return result
