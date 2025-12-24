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

function parseGitHubRepo(url) {
    try {
        // Accept URLs like https://github.com/owner/repo or git@github.com:owner/repo.git
        if (!url) return null;
        url = url.trim();
        let ownerRepo = null;
        const httpMatch = url.match(/github\.com\/([^\/\s]+)\/([^\/\s]+)(?:\/|$)/i);
        if (httpMatch) {
            ownerRepo = `${httpMatch[1]}/${httpMatch[2].replace(/\.git$/, '')}`;
        } else {
            const sshMatch = url.match(/git@github\.com:([^\/\s]+)\/([^\/\s]+)(?:\.git)?/i);
            if (sshMatch) ownerRepo = `${sshMatch[1]}/${sshMatch[2].replace(/\.git$/, '')}`;
        }
        return ownerRepo;
    } catch (e) {
        return null;
    }
}

async function forkRepo() {
    try {
        let data = await eel.get_clipboard_and_position()();
        let url = data.content;
        let ownerRepo = parseGitHubRepo(url);
        if (!ownerRepo) {
            Swal.fire('Error', 'Could not parse GitHub repo from URL', 'error');
            return;
        }
        const cmd = `gh repo fork ${ownerRepo}`;
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(cmd);
            Swal.fire({
                title: 'Command Copied',
                text: 'The fork command has been copied to your clipboard.',
                icon: 'success',
                confirmButtonColor: '#3d5afe'
            });
        } else {
            Swal.fire({title:'Fork command', html:`<pre>${cmd}</pre>`});
        }
    } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Failed to generate fork command: ' + err, 'error');
    }
}

async function forkAndCloneRepo() {
    try {
        let data = await eel.get_clipboard_and_position()();
        let url = data.content;
        let ownerRepo = parseGitHubRepo(url);
        if (!ownerRepo) {
            Swal.fire('Error', 'Could not parse GitHub repo from URL', 'error');
            return;
        }
        const cmd = `gh repo fork ${ownerRepo} --clone=true`;
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(cmd);
            Swal.fire({
                title: 'Command Copied',
                text: 'The fork+clone command has been copied to your clipboard.',
                icon: 'success',
                confirmButtonColor: '#3d5afe'
            });
        } else {
            Swal.fire({title:'Fork+Clone command', html:`<pre>${cmd}</pre>`});
        }
    } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Failed to generate fork+clone command: ' + err, 'error');
    }
}

async function createIssue() {
    try {
        let data = await eel.get_clipboard_and_position()();
        let url = data.content;
        let ownerRepo = parseGitHubRepo(url);
        if (!ownerRepo) {
            Swal.fire('Error', 'Could not parse GitHub repo from URL', 'error');
            return;
        }
        const cmd = `gh issue create --repo ${ownerRepo} --title "<TITLE>" --body "<BODY>"`;
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(cmd);
            Swal.fire({
                title: 'Command Copied',
                text: 'The create-issue command has been copied to your clipboard.',
                icon: 'success',
                confirmButtonColor: '#3d5afe'
            });
        } else {
            Swal.fire({title:'Create Issue command', html:`<pre>${cmd}</pre>`});
        }
    } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Failed to generate create-issue command: ' + err, 'error');
    }
}

async function openGitHubRepo() {
    try {
        let data = await eel.get_clipboard_and_position()();
        let url = data.content;
        if (!url) {
            Swal.fire('No URL', 'No URL found in clipboard.', 'warning');
            return;
        }
        const win = window.open(url, '_blank');
        if (!win) {
            Swal.fire('Popup blocked', 'Please allow popups for this application to open the repo.', 'warning');
            return;
        }
        Swal.fire({toast:true, position:'top-end', icon:'info', title:'Opened repository', showConfirmButton:false, timer:1200});
    } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Failed to open repo: ' + err, 'error');
    }
}

function openURL() {
    Swal.fire({title: 'Opening URL', showConfirmButton: false, timer: 1000});
}

async function openPlayground() {
    try {
        let data = await eel.get_clipboard_and_position()();
        let content = data.content || '';

        if (navigator.clipboard && content) {
            await navigator.clipboard.writeText(content);
        }

        const win = window.open('https://programiz.pro/ide/python', '_blank');
        if (!win) {
            Swal.fire('Popup blocked', 'Please allow popups for this application to open the playground.', 'warning');
            return;
        }

        // instruct user to paste into editor
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

async function restoreHistoryItem(text) {
    try {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(text);
            // The main loop will pick this up as a new copy and move it to top
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Copied to clipboard',
                showConfirmButton: false,
                timer: 1000
            });
        }
    } catch (err) {
        console.error(err);
    }
}

// Function to inject buttons based on type
async function refresh() {
    let data = await eel.get_clipboard_and_position()();
    
    // Render History
    const historyList = document.getElementById('history-list');
    if (data.history && historyList) {
        // Simple re-render strategy
        historyList.innerHTML = '';
        data.history.forEach(item => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerText = item;
            div.onclick = () => restoreHistoryItem(item);
            div.title = "Click to copy";
            historyList.appendChild(div);
        });
    }

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
            // multiple GitHub actions
            actionDiv.innerHTML = `
                <div style="display:flex;flex-direction:column;gap:6px">
                    <button onclick="cloneRepo()">Clone</button>
                    <button onclick="forkRepo()">Fork (gh)</button>
                    <button onclick="forkAndCloneRepo()">Fork+Clone</button>
                    <button onclick="createIssue()">Create Issue (cmd)</button>
                    <button onclick="openGitHubRepo()">Open</button>
                </div>`;
        } else if (data.context === "URL") {
            actionDiv.innerHTML = '<button onclick="openURL()">Open URL</button> <button onclick="summarizeURL()">Summarize URL</button>';
        } else {
            actionDiv.innerHTML = '<button onclick="logData()">Log Data</button>';
        }
            } else {
                document.getElementById('context-type').innerText = "Plain Text";
                document.getElementById('content-preview').innerText = data.content.substring(0, 50) + "...";
                document.getElementById('actions').innerHTML = '<button onclick="logData()">Log Data</button> <button onclick="summarizeData()">Generate Summary</button>';
            }
}
setInterval(refresh, 1000);