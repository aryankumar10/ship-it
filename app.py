import os
import eel
import re
import time
import pyperclip
import pyautogui
import threading
from pystray import Icon, Menu, MenuItem
from PIL import Image, ImageDraw
import sqlparse
import requests
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
eel.init('web')

def identify_context(text):
    """
    Returns the type of copied text
    
    :param text: Copied text
    """

    text = text.strip()
    
    # 1. SQL Query Detection
    sql_pattern = r"^(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\s+(.*)"
    if re.match(sql_pattern, text, re.IGNORECASE | re.DOTALL):
        return "SQL Query"

    # 2. Jira ID (e.g., PROJ-123)
    jira_pattern = r"^[A-Z]{2,10}-\d+$"
    if re.match(jira_pattern, text):
        return "Jira Ticket"

    # 3. Python Code (Check for common syntax patterns)
    python_pattern = r"(def\s+\w+\(|if\s+__name__\s+==\s+['\"]__main__['\"]|import\s+\w+|print\(.*\))"
    if re.search(python_pattern, text):
        return "Python Code"

    # 4. JWT
    jwt_pattern = r"^eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$"
    if re.match(jwt_pattern, text):
        return "JWT Token"

    # # 5. IP Address (IPv4)
    # ip_pattern = r"^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$"
    # if re.match(ip_pattern, text):
    #     return "IP Address"

    # 6. GitHub Repo first then URL
    github_pattern = r"^https?://github\.com/[\w-]+/[\w.-]+/?$"
    if re.match(github_pattern, text):
        return "GitHub Repo"

    # 7. URL
    url_pattern = r"^https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+"
    if re.match(url_pattern, text):
        return "URL"

    return "Plain Text"


@eel.expose
def get_clipboard_and_position():
    return {
        "content": pyperclip.paste(),
        "context": identify_context(pyperclip.paste()),
        "pos": pyautogui.position()
    }

def run_eel():
    # Eel runs in this background thread
    # Use the full screen height for the Eel window while keeping a narrow width
    try:
        screen_w, screen_h = pyautogui.size()
    except Exception:
        # Fallback if pyautogui cannot detect size
        screen_w, screen_h = (300, 200)
    width = 300
    height = screen_h
    eel.start('main.html', size=(width, height), port=8080)


@eel.expose
def format_sql(text: str):
    """Format SQL using sqlparse and return formatted SQL."""
    try:
        # Reindent and make keywords uppercase for readability
        formatted = sqlparse.format(text, reindent=True, keyword_case='upper')
        return formatted
    except Exception as e:
        return f"ERROR: Could not format SQL: {e}"


@eel.expose
def log_clipboard_to_file(text: str = None):
    """Write clipboard text to a timestamped file and return the filename.

    If text is None, the current clipboard contents will be used.
    """
    try:
        if not text:
            text = pyperclip.paste()

        timestamp = time.strftime("%Y%m%d_%H%M%S")
        filename = f"clipboard_{timestamp}.txt"
        foldername = f".clipboard_logs"
        logs_dir = os.path.join(os.getcwd(), f"{foldername}")
        # Ensure the directory exists
        os.makedirs(logs_dir, exist_ok=True)
        filepath = os.path.join(logs_dir, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(text)

        return {"status": "ok", "filename": filename, "path": filepath, "foldername": foldername}
    except Exception as e:
        return {"status": "error", "error": str(e)}


@eel.expose
def summarize_text(text: str, max_sentences: int = 5):
    """Return a very simple extractive summary: first `max_sentences` sentences.

    This is a lightweight summary function that splits on sentence-ending punctuation.
    
    TODO: implement LLM summary
    """
    try:
        if not text:
            text = pyperclip.paste()
            
        # LLM Summary
        try:
            print("Using Groq LLM for text summary")
            chat_completion = client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": f"Summarize the following text concisely in about {max_sentences} sentences:\n\n{text}",
                    }
                ],
                model="llama-3.3-70b-versatile",
            )
            
            summary_content = chat_completion.choices[0].message.content
            if summary_content:
                return {"status": "ok", "summary": summary_content.strip()}
                
        except Exception as llm_err:
            print(f"Groq LLM failed, falling back: {llm_err}")

        # Fallback normal summary
        sentences = re.split(r'(?<=[.!?])\s+', text.strip())
        sentences = [s.strip() for s in sentences if s.strip()]
        summary = ' '.join(sentences[:max_sentences]).strip()
        
        if not summary:
            summary = text.strip()[:500]
            
        return {"status": "ok", "summary": summary}
        
    except Exception as e:
        return {"status": "error", "error": str(e)}
    

@eel.expose
def summarize_url(url: str, max_sentences: int = 5):
    """Fetch a URL, extract readable text using BeautifulSoup, and summarize it using summarize_text
    """
    try:
        if not url:
            return {"status": "error", "error": "No URL provided"}

        # LLM Summary
        try:
            print("Using Groq LLM for URL summary")
            chat_completion = client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": f"Summarize the following url concisely in about {max_sentences} sentences:\n\n{url}",
                    }
                ],
                model="llama-3.3-70b-versatile",
            )
            
            summary_content = chat_completion.choices[0].message.content
            if summary_content:
                return {"status": "ok", "summary": summary_content.strip()}
                
        except Exception as llm_err:
            print(f"Groq LLM failed, falling back: {llm_err}")

        # Fallback
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        html = resp.text

        try:
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(html, 'html.parser')
            # Prefer paragraph text
            paragraphs = soup.find_all('p')
            if paragraphs:
                text = '\n'.join(p.get_text(separator=' ', strip=True) for p in paragraphs)
            else:
                text = soup.get_text(separator=' ', strip=True)
        except Exception:
            # Fallback: strip HTML tags naively
            text = re.sub(r'<[^>]+>', ' ', html)

        return summarize_text(text, max_sentences)
    except Exception as e:
        return {"status": "error", "error": str(e)}

def create_tray_icon():
    # Create the icon image
    img = Image.new('RGB', (64, 64), color=(61, 90, 254))
    d = ImageDraw.Draw(img)
    d.text((20, 20), "SC", fill=(255, 255, 255))
    
    # Define the Tray Menu
    def on_quit(icon):
        icon.stop()
        os._exit(0) # Force quit the whole app including Eel

    # Initialize Icon
    icon = Icon("ShipIt", img, menu=Menu(
        MenuItem("Quit", on_quit)
    ))

    # Start Eel in a BACKGROUND thread
    eel_thread = threading.Thread(target=run_eel, daemon=True)
    eel_thread.start()

    # 5. Run the Tray Icon on the MAIN thread (blocking)
    icon.run()

if __name__ == "__main__":
    print('starting app')
    create_tray_icon()