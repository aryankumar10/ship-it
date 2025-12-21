async function formatSQL() {
    try {
        let data = await eel.get_clipboard_and_position()();
        let sql = data.content;
        let formatted = await eel.format_sql(sql)();
        // Copy formatted SQL back to clipboard for easy use
        if (navigator.clipboard && formatted) {
            await navigator.clipboard.writeText(formatted);
            alert('Formatted SQL copied to clipboard.');
        } else {
            // Fallback: show in alert (may truncate)
            alert(formatted.substring(0, 1000));
        }
    } catch (err) {
        console.error(err);
        alert('Failed to format SQL: ' + err);
    }
}

function decodeJWT() {
    alert("JWT Decoding not implemented yet!");
}

async function cloneRepo() {
    let data = await eel.get_clipboard_and_position()();
    let repoUrl = data.content;
    let command = `git clone ${repoUrl}`;
    alert(`Command generated: ${command}`);
}

function openURL() {
    alert("Opening URL...");
}

async function openPlayground() {
    try {
        // Fetch clipboard content so we can copy it into the user's clipboard
        let data = await eel.get_clipboard_and_position()();
        let content = data.content || '';

        // Copy code to clipboard so user can paste into the playground
        if (navigator.clipboard && content) {
            await navigator.clipboard.writeText(content);
        }

        // Open Programiz Python IDE in a new tab
        const win = window.open('https://programiz.pro/ide/python', '_blank');
        if (!win) {
            alert('Popup blocked. Please allow popups for this application to open the playground.');
            return;
        }

        // Cannot programmatically write into a cross-origin page, so copy to clipboard
        // and instruct the user to paste into the editor.
        alert('Opened Programiz IDE. Your code is copied to the clipboard — paste it into the editor (Cmd/Ctrl+V).');
    } catch (err) {
        console.error(err);
        alert('Failed to open playground: ' + err);
    }
}

function logData() {
    (async () => {
        try {
            let data = await eel.get_clipboard_and_position()();
            let content = data.content;

            let res = await eel.log_clipboard_to_file(content)();
            if (res && res.status === 'ok') {
                alert('Clipboard logged\nFile: ' + res.filename + '\nFolder: ' + res.foldername);
            } else {
                console.error(res);
                alert('Failed to log clipboard: ' + (res && res.error ? res.error : 'unknown'));
            }
        } catch (err) {
            console.error(err);
            alert('Error logging clipboard: ' + err);
        }
    })();
}

async function summarizeData() {
    try {
        let data = await eel.get_clipboard_and_position()();
        let content = data.content || '';
        let res = await eel.summarize_text(content, 3)();
        if (res && res.status === 'ok') {
            alert('Summary:\n' + res.summary);
        } else {
            console.error(res);
            alert('Failed to summarize: ' + (res && res.error ? res.error : 'unknown'));
        }
    } catch (err) {
        console.error(err);
        alert('Error summarizing clipboard: ' + err);
    }
}

async function summarizeURL() {
    try {
        let data = await eel.get_clipboard_and_position()();
        let url = data.content || '';
        if (!url) {
            alert('No URL found in clipboard.');
            return;
        }
        let res = await eel.summarize_url(url, 3)();
        if (res && res.status === 'ok') {
            alert('URL Summary:\n' + res.summary);
        } else {
            console.error(res);
            alert('Failed to summarize URL: ' + (res && res.error ? res.error : 'unknown'));
        }
    } catch (err) {
        console.error(err);
        alert('Error summarizing URL: ' + err);
    }
}

// JS Function to inject buttons based on type
async function refresh() {
    let data = await eel.get_clipboard_and_position()();
    

    if (data.context !== "Plain Text") {
        document.getElementById('context-type').innerText = data.context;
        document.getElementById('content-preview').innerText = data.content.substring(0, 50) + "...";
        
        const actionDiv = document.getElementById('actions');
        if (data.context === "SQL Query") {
            actionDiv.innerHTML = '<button onclick="formatSQL()">Format SQL</button>';
        } else if (data.context === "Python Code") {
            actionDiv.innerHTML = '<button onclick="openPlayground()">Open Playground</button>';
        } else if (data.context === "JWT Token") {
            actionDiv.innerHTML = '<button onclick="decodeJWT()">Decode Payload</button>';
        } else if (data.context === "GitHub Repo") {
            actionDiv.innerHTML = '<button onclick="cloneRepo()">Clone Repo</button>';
        } else if (data.context === "URL") {
            actionDiv.innerHTML = '<button onclick="openURL()">Open URL</button> <button onclick="summarizeURL()">Summarize URL</button>';
        } else {
            actionDiv.innerHTML = '<button onclick="logData()">Log Data</button>';
        }
            } else {
                document.getElementById('context-type').innerText = "Plain Text";
                document.getElementById('content-preview').innerText = data.content.substring(0, 50) + "...";
                // still show Log Data and Generate Summary buttons so users can manually log or generate a summary
                document.getElementById('actions').innerHTML = '<button onclick="logData()">Log Data</button> <button onclick="summarizeData()">Generate Summary</button>';
            }
}
setInterval(refresh, 1000);