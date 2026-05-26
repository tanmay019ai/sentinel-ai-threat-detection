import requests
from bs4 import BeautifulSoup


def analyze_website(url: str) -> dict:
    try:
        response = requests.get(url, timeout=10)
        html = response.text
        soup = BeautifulSoup(html, "html.parser")

        forms = soup.find_all("form")
        iframes = soup.find_all("iframe")
        scripts = soup.find_all("script")
        password_inputs = soup.find_all("input", {"type": "password"})
        external_scripts = [script for script in scripts if script.get("src")]
        hidden_elements = soup.find_all(
            style=lambda value: value and "display:none" in value
        )

        return {
            "form_count": len(forms),
            "iframe_count": len(iframes),
            "script_count": len(scripts),
            "external_script_count": len(external_scripts),
            "password_input_count": len(password_inputs),
            "hidden_element_count": len(hidden_elements),
            "has_login_form": len(password_inputs) > 0,
            "has_iframe": len(iframes) > 0,
            "has_external_scripts": len(external_scripts) > 0,
            "suspicious_forms": len(password_inputs) > 0 and len(forms) > 0,
        }
    except Exception as error:
        return {"error": str(error)}
