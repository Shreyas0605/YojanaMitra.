/**
 * YojanaMitra AI Engine Toggle v4
 * Shows immediately on all pages. Hot-swaps between Gemini and NVIDIA Mistral.
 */
(function () {
    // ── STYLES ────────────────────────────────────────────────────────────────
    var css = `
        #ym-ai-toggle {
            position: fixed;
            bottom: 90px;
            right: 20px;
            z-index: 2147483647;
            font-family: 'Inter', 'Outfit', system-ui, sans-serif;
        }
        #ym-ai-pill {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 10px 8px 14px;
            border-radius: 100px;
            background: rgba(11, 26, 22, 0.96);
            border: 1px solid rgba(255,255,255,0.18);
            box-shadow: 0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05);
            cursor: pointer;
            user-select: none;
            transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
        }
        #ym-ai-pill:hover {
            transform: translateY(-2px) scale(1.03);
            box-shadow: 0 14px 36px rgba(249,115,22,0.25);
            border-color: rgba(249,115,22,0.5);
        }
        #ym-ai-pill:active { transform: scale(0.97); }
        .ym-ai-label {
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: rgba(255,255,255,0.55);
        }
        .ym-ai-name {
            font-size: 13px;
            font-weight: 700;
            color: #fff;
        }
        .ym-ai-track {
            width: 44px;
            height: 24px;
            border-radius: 100px;
            background: #1e3a2e;
            position: relative;
            transition: background 0.3s;
            flex-shrink: 0;
        }
        .ym-ai-thumb {
            position: absolute;
            top: 3px;
            left: 3px;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #fff;
            transition: left 0.3s cubic-bezier(0.4,0,0.2,1);
            box-shadow: 0 2px 5px rgba(0,0,0,0.25);
        }
        /* NVIDIA / Mistral active state */
        #ym-ai-pill.is-nvidia .ym-ai-track { background: #76b900; }
        #ym-ai-pill.is-nvidia .ym-ai-thumb { left: 23px; }
        #ym-ai-pill.is-nvidia .ym-ai-name  { color: #76b900; }
        #ym-ai-pill.is-nvidia              { border-color: rgba(118,185,0,0.45); }
        /* Loading spinner */
        .ym-ai-spin {
            width: 14px; height: 14px;
            border: 2px solid rgba(255,255,255,0.2);
            border-top-color: #f97316;
            border-radius: 50%;
            animation: ym-spin 0.7s linear infinite;
            flex-shrink: 0;
        }
        @keyframes ym-spin { to { transform: rotate(360deg); } }
        /* Toast */
        #ym-ai-toast {
            position: fixed;
            bottom: 160px;
            right: 20px;
            z-index: 2147483647;
            background: #0b1a16;
            color: #fff;
            font-family: 'Inter', system-ui, sans-serif;
            font-size: 13px;
            font-weight: 600;
            padding: 10px 18px;
            border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.1);
            box-shadow: 0 8px 24px rgba(0,0,0,0.4);
            opacity: 0;
            transform: translateY(10px);
            transition: opacity 0.3s, transform 0.3s;
            pointer-events: none;
        }
        #ym-ai-toast.show { opacity: 1; transform: translateY(0); }
    `;

    // ── DOM CREATION ──────────────────────────────────────────────────────────
    var styleEl = document.createElement('style');
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    var root = document.createElement('div');
    root.id = 'ym-ai-toggle';
    root.innerHTML =
        '<div id="ym-ai-pill" title="Toggle AI Engine">' +
            '<span class="ym-ai-label">Engine</span>' +
            '<span class="ym-ai-name" id="ym-ai-name">Gemini</span>' +
            '<div class="ym-ai-track"><div class="ym-ai-thumb"></div></div>' +
        '</div>';
    document.body.appendChild(root);

    var toast = document.createElement('div');
    toast.id = 'ym-ai-toast';
    document.body.appendChild(toast);

    var pill = document.getElementById('ym-ai-pill');
    var nameEl = document.getElementById('ym-ai-name');
    var currentProvider = 'gemini';
    var busy = false;

    // ── UI UPDATE ─────────────────────────────────────────────────────────────
    function setProvider(provider) {
        currentProvider = provider;
        if (provider === 'nvidia') {
            pill.classList.add('is-nvidia');
            nameEl.textContent = 'Mistral';
        } else {
            pill.classList.remove('is-nvidia');
            nameEl.textContent = 'Gemini';
        }
    }

    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(function () { toast.classList.remove('show'); }, 2500);
    }

    function showSpinner() {
        nameEl.innerHTML = '<span class="ym-ai-spin"></span>';
    }
    function clearSpinner() {
        nameEl.textContent = currentProvider === 'nvidia' ? 'Mistral' : 'Gemini';
    }

    // ── FETCH CURRENT STATE ───────────────────────────────────────────────────
    fetch('/api/current-ai', { credentials: 'include' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (data) {
            if (data && data.provider) setProvider(data.provider);
        })
        .catch(function () { /* stay on gemini default */ });

    // ── TOGGLE CLICK ──────────────────────────────────────────────────────────
    pill.addEventListener('click', function () {
        if (busy) return;
        busy = true;
        var next = currentProvider === 'gemini' ? 'nvidia' : 'gemini';
        showSpinner();

        fetch('/api/toggle-ai', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ provider: next })
        })
        .then(function (r) { return r.json(); })
        .then(function (data) {
            if (data && data.status === 'success') {
                setProvider(next);
                clearSpinner();
                showToast('Switched to ' + (next === 'nvidia' ? '⚡ NVIDIA Mistral' : '✦ Google Gemini'));
            } else {
                clearSpinner();
                showToast('Switch failed, please retry');
            }
        })
        .catch(function () {
            clearSpinner();
            showToast('Network error — try again');
        })
        .finally(function () { busy = false; });
    });
})();
