/**
 * YojanaMitra AI Engine Toggle
 * Hot-swaps between Google Gemini and NVIDIA Mistral
 */

(function() {
    // ── STYLES ────────────────────────────────────────────────────────────────
    const styles = `
        #ai-engine-toggle-root {
            position: fixed;
            bottom: 100px;
            right: 30px;
            z-index: 9999;
            font-family: 'Outfit', sans-serif;
            pointer-events: none;
        }

        .ai-toggle-pill {
            background: rgba(11, 26, 22, 0.95);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            padding: 6px 6px 6px 14px;
            border-radius: 100px;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
            pointer-events: auto;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            user-select: none;
            cursor: pointer;
        }

        .ai-toggle-pill:hover {
            transform: translateY(-2px) scale(1.02);
            border-color: rgba(249, 115, 22, 0.4);
            box-shadow: 0 15px 40px rgba(249, 115, 22, 0.2);
        }

        .ai-toggle-label {
            color: rgba(255, 255, 255, 0.7);
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
        }

        .ai-toggle-current {
            color: #fff;
            font-size: 13px;
            font-weight: 700;
            margin-right: 4px;
        }

        .ai-toggle-switch {
            width: 48px;
            height: 26px;
            background: #2d3a35;
            border-radius: 100px;
            position: relative;
            transition: background 0.3s;
        }

        .ai-toggle-switch::after {
            content: '';
            position: absolute;
            top: 3px;
            left: 3px;
            width: 20px;
            height: 20px;
            background: #fff;
            border-radius: 50%;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        }

        /* NVIDIA Mode Styles */
        .ai-toggle-pill.nvidia {
            background: linear-gradient(135deg, #111 0%, #000 100%);
            border-color: #76b900; /* NVIDIA Green */
        }

        .ai-toggle-pill.nvidia .ai-toggle-switch {
            background: #76b900;
        }

        .ai-toggle-pill.nvidia .ai-toggle-switch::after {
            left: 25px;
        }

        .ai-toggle-pill.nvidia .ai-toggle-current {
            color: #76b900;
        }

        /* Tooltip */
        .ai-toggle-tooltip {
            position: absolute;
            bottom: 100%;
            right: 0;
            background: #000;
            color: #fff;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 12px;
            margin-bottom: 12px;
            white-space: nowrap;
            opacity: 0;
            transform: translateY(10px);
            transition: all 0.3s;
            pointer-events: none;
            box-shadow: 0 10px 20px rgba(0,0,0,0.2);
            border: 1px solid rgba(255,255,255,0.1);
        }

        .ai-toggle-pill:hover .ai-toggle-tooltip {
            opacity: 1;
            transform: translateY(0);
        }

        .nvidia-badge {
            font-size: 10px;
            background: #76b900;
            color: #000;
            padding: 1px 6px;
            border-radius: 4px;
            font-weight: 800;
            margin-left: 4px;
            display: none;
        }

        .ai-toggle-pill.nvidia .nvidia-badge {
            display: inline-block;
        }
    `;

    // ── IMPLEMENTATION ────────────────────────────────────────────────────────

    function initToggle() {
        // Add styles
        const styleEl = document.createElement('style');
        styleEl.textContent = styles;
        document.head.appendChild(styleEl);

        // Create container
        const container = document.createElement('div');
        container.id = 'ai-engine-toggle-root';
        document.body.appendChild(container);

        // Create inner pill
        const pill = document.createElement('div');
        pill.className = 'ai-toggle-pill';
        pill.innerHTML = `
            <div class="ai-toggle-tooltip">Switch to NVIDIA High-Performance Engine</div>
            <div class="ai-toggle-label">Engine</div>
            <div class="ai-toggle-current">Gemini</div>
            <div class="ai-toggle-switch"></div>
            <span class="nvidia-badge">70B</span>
        `;
        container.appendChild(pill);

        // State management
        let currentProvider = 'gemini';

        async function fetchState() {
            try {
                const res = await fetch('/api/current-ai');
                const data = await res.json();
                updateUI(data.provider);
            } catch (e) {
                console.warn("AI Toggle: Failed to fetch state", e);
            }
        }

        function updateUI(provider) {
            currentProvider = provider;
            const currentLabel = pill.querySelector('.ai-toggle-current');
            const tooltip = pill.querySelector('.ai-toggle-tooltip');
            
            if (provider === 'nvidia') {
                pill.classList.add('nvidia');
                currentLabel.textContent = 'Mistral';
                tooltip.textContent = 'Active: NVIDIA High-Performance Engine';
            } else {
                pill.classList.remove('nvidia');
                currentLabel.textContent = 'Gemini';
                tooltip.textContent = 'Switch to NVIDIA High-Performance Engine';
            }
        }

        async function toggleProvider() {
            const next = currentProvider === 'gemini' ? 'nvidia' : 'gemini';
            
            // Optimistic UI
            updateUI(next);
            
            try {
                const res = await fetch('/api/toggle-ai', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ provider: next })
                });
                
                const data = await res.json();
                if (data.status === 'success') {
                    // Show a subtle notification
                    console.log(`AI Engine swapped to ${data.label}`);
                    
                    // Force refresh if on dashboard to show new results
                    if (window.location.pathname.includes('dashboard') || window.location.pathname === '/') {
                        setTimeout(() => window.location.reload(), 500);
                    }
                }
            } catch (e) {
                console.error("AI Toggle failed", e);
                updateUI(currentProvider); // Revert
            }
        }

        pill.addEventListener('click', toggleProvider);
        
        // Initial fetch
        fetchState();
    }

    // Run when ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initToggle);
    } else {
        initToggle();
    }
})();
