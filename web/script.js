async function formatSQL() {
    try {
        let data = await eel.get_clipboard_and_position()();
        let sql = data.content;
        let formatted = await eel.format_sql(sql)();
        // Copy formatted SQL back to clipboard for easy use
        if (navigator.clipboard && formatted) {
            await navigator.clipboard.writeText(formatted);
            Swal.fire({
                title: 'Formatted',
                text: 'Formatted SQL copied to clipboard.',
                icon: 'success',
                confirmButtonColor: '#3d5afe'
            });
        } else {
            // Fallback: show in Swal (may truncate)
            Swal.fire({
                title: 'Formatted SQL',
                text: formatted.substring(0, 1000),
                icon: 'info',
                confirmButtonColor: '#3d5afe'
            });
        }
    } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Failed to format SQL: ' + err, 'error');
    }
}

function decodeJWT() {
    Swal.fire('Info', 'JWT Decoding not implemented yet!', 'info');
}

async function cloneRepo() {
    try {
        let data = await eel.get_clipboard_and_position()();
        let repoUrl = data.content;
        let command = `git clone ${repoUrl}`;
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(command);
            Swal.fire({
                title: 'Command Copied',
                // html: `<pre style="text-align:left">${command}</pre>`,
                text: 'The clone command has been copied to your clipboard.',
                icon: 'success',
                confirmButtonColor: '#3d5afe'
            });
        } else {
            Swal.fire({
                title: 'Command Generated',
                html: `<pre style="text-align:left">${command}</pre>`,
                icon: 'info',
                confirmButtonColor: '#3d5afe'
            });
        }
    } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Failed to generate clone command: ' + err, 'error');
    }
}

function openURL() {
    Swal.fire({title: 'Opening URL', showConfirmButton: false, timer: 1000});
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
            Swal.fire('Popup blocked', 'Please allow popups for this application to open the playground.', 'warning');
            return;
        }

        // Cannot programmatically write into a cross-origin page, so copy to clipboard
        // and instruct the user to paste into the editor.
        Swal.fire({
            title: 'Playground Opened',
            text: 'Your code is copied to the clipboard — paste it into the editor (Cmd/Ctrl+V).',
            icon: 'success',
            confirmButtonColor: '#3d5afe'
        });
    } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Failed to open playground: ' + err, 'error');
    }
}

function logData() {
    (async () => {
        try {
            let data = await eel.get_clipboard_and_position()();
            let content = data.content;

            let res = await eel.log_clipboard_to_file(content)();
            if (res && res.status === 'ok') {
                Swal.fire({
                    title: 'Logged',
                    html: `File: <strong>${res.filename}</strong><br>Path: <code>${res.path}</code>`,
                    icon: 'success',
                    confirmButtonColor: '#3d5afe'
                });
            } else {
                console.error(res);
                Swal.fire('Error', 'Failed to log clipboard: ' + (res && res.error ? res.error : 'unknown'), 'error');
            }
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'Error logging clipboard: ' + err, 'error');
        }
    })();
}

async function summarizeData() {
    try {
        let data = await eel.get_clipboard_and_position()();
        let content = data.content || '';
        let res = await eel.summarize_text(content, 3)();
        if (res && res.status === 'ok') {
            Swal.fire({
                title: 'Text Summary',
                text: res.summary,
                icon: 'info',
                confirmButtonColor: '#3d5afe'
            });
        } else {
            Swal.fire('Error', res.error || 'unknown', 'error');
        }
    } catch (err) {
        Swal.fire('Error', 'Error summarizing clipboard: ' + err, 'error');
    }
}

async function summarizeURL() {
    try {
        let data = await eel.get_clipboard_and_position()();
        let url = data.content || '';
        if (!url) {
            Swal.fire('No URL', 'No URL found in clipboard.', 'warning');
            return;
        }
        let res = await eel.summarize_url(url, 3)();
        if (res && res.status === 'ok') {
            // Replaces: alert('URL Summary:\n' + res.summary);
            Swal.fire({
                title: 'URL Summary',
                text: res.summary,
                icon: 'success',
                confirmButtonColor: '#3d5afe'
            });
        } else {
            Swal.fire('Error', res.error || 'unknown', 'error');
        }
    } catch (err) {
        Swal.fire('Error', 'Error summarizing URL: ' + err, 'error');
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