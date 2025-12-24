# ShipIt

A small desktop helper built that reads your clipboard and provides context-sensitive actions.

Features
- Detects clipboard content type like SQL, Python code, GitHub repo, URLs or plain text.
- Format SQL and copy the formatted result to the clipboard.
- Manually log clipboard content to local files.
- Summarize plain text or web pages.
- Copy useful Git commands / GitHub URLs (clone, fork, open, create issue) to clipboard.
- Clickable clipboard history.

Install
1. Clone the repo or copy the project files to a directory.

2. Create a virtual environment and install all dependencies:

```bash
python -m venv .venv
source .venv/bin/activate OR venv\Scripts\activate.bat (CMD)
pip install -r requirements.txt
```

Run

From the project root, run:

```bash
python app.py
```

This will start frontend and open the UI in a different window. Use the UI to interact with clipboard content and buttons.

Security & Privacy
- The app reads clipboard contents to determine context using RegEx and will write them to disk only when you press "Log Data".
- If summarization is pressed, the clipboard contents will be sent to the online LLM services.
