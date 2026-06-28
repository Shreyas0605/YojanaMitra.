(function () {
            var video = document.getElementById('clay-video-scrub');
            var section = document.getElementById('scrolly-intro');
            var ov1 = document.getElementById('sv-ov1');
            var ov2 = document.getElementById('sv-ov2');
            var wol = document.getElementById('white-out-layer');
            var hint = document.getElementById('scrolly-hint');
            if (!section || window.innerWidth <= 768) return;   // desktop only

            // Marker — confirm THIS code is live by typing  __ymScrubFrames  in the console.
            window.__ymScrubFrames = true;

            /* ── FRAME CONFIG — point these at your converted frames ─────────
               FRAME_COUNT : how many images there are. You have 361. If you
                             re-export a different number, set this to match the
                             actual file count exactly.
               FRAME_URL   : builds each frame's URL from its 1-based index.
                             Your files are 00001..00361 (5-digit, zero-padded).
                             Convert the PNGs to WebP first (see the notes), then
                             this points at /static/scrolly/00001.webp ... If you
                             insist on keeping PNG, change '.webp' to '.png'.
               If frames don't appear, open one URL directly in the browser
               (e.g. /static/scrolly/00001.webp) — the console also logs the
               exact URL of any frame that fails to load.
            */
            var FRAME_COUNT = 361;
            function FRAME_URL(i) { return '/static/scrolly/' + ('00000' + i).slice(-5) + '.webp'; }

            /* ── FEEL TUNABLES (same model as the video version) ──────────────
               CLIP_SECONDS  : the clip's real length (12s) — keeps "1x" meaning
                               the animation scrubs over 12 seconds, as before.
               CRUISE_RATE   : calm scrub speed while scrolling (slow/medium ≈ 1x).
               LAG_THRESH    : how far it may fall behind before catching up
                               faster — the knob that prevents the fast-flick hang.
               CATCHUP_BOOST : how hard it catches up after a fast flick.
               SMOOTH_SCROLL : tracking tightness while scrolling.
               SMOOTH_RELEASE: ease-out after you let go (the soft stop).
            */
            var CLIP_SECONDS = 12;
            var CRUISE_RATE = 1;
            var LAG_THRESH = 0.05;
            var CATCHUP_BOOST = 34;
            var SMOOTH_SCROLL = 0.12;
            var SMOOTH_RELEASE = 0.045;

            if (history.scrollRestoration) history.scrollRestoration = 'manual';

            // Stop the old <video> from downloading / holding memory.
            if (video) {
                try { video.pause(); video.removeAttribute('src'); video.load(); } catch (e) { }
                video.style.display = 'none';
            }

            // Build the canvas inside the same sticky wrap, behind the text overlays.
            var wrap = (video && video.parentNode) || section.querySelector('.sticky-canvas-wrap') || section;
            var canvas = document.createElement('canvas');
            canvas.id = 'clay-canvas-scrub';
            canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
            if (wrap.firstChild) wrap.insertBefore(canvas, wrap.firstChild); else wrap.appendChild(canvas);
            var ctx = canvas.getContext('2d', { alpha: false });

            function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
            function lerp(a, b, t) { return a + (b - a) * t; }
            function nowMs() { return (window.performance && performance.now) ? performance.now() : Date.now(); }

            // DPR-aware backing store so frames stay crisp.
            var dpr = Math.min(window.devicePixelRatio || 1, 2);
            function sizeCanvas() {
                var r = wrap.getBoundingClientRect();
                var w = Math.max(1, Math.round(r.width * dpr));
                var h = Math.max(1, Math.round(r.height * dpr));
                if (w !== canvas.width || h !== canvas.height) { canvas.width = w; canvas.height = h; lastDrawn = -1; }
            }

            // ── Preload every frame ──
            var frames = new Array(FRAME_COUNT);
            var loadedCount = 0, allReady = false, lastDrawn = -1;

            var loader = document.createElement('div');
            loader.style.cssText = 'position:absolute;left:50%;bottom:28px;transform:translateX(-50%);z-index:13;' +
                'font:500 11px/1.4 "Plus Jakarta Sans",sans-serif;letter-spacing:.18em;text-transform:uppercase;' +
                'color:rgba(11,26,22,.45);pointer-events:none;';
            loader.textContent = 'Loading 0%';
            wrap.appendChild(loader);

            function frameReady(im) { return im && im.complete && im.naturalWidth > 0; }

            function drawFrame(idx) {
                var im = frames[idx];
                if (!frameReady(im)) {
                    // never show blank: fall back to the nearest already-loaded frame
                    var found = -1;
                    for (var d = 1; d < FRAME_COUNT; d++) {
                        if (idx - d >= 0 && frameReady(frames[idx - d])) { found = idx - d; break; }
                        if (idx + d < FRAME_COUNT && frameReady(frames[idx + d])) { found = idx + d; break; }
                    }
                    if (found < 0) return;
                    idx = found; im = frames[idx];
                }
                if (idx === lastDrawn) return;
                lastDrawn = idx;
                var cw = canvas.width, ch = canvas.height, iw = im.naturalWidth, ih = im.naturalHeight;
                var scale = Math.max(cw / iw, ch / ih);   // object-fit: cover
                var dw = iw * scale, dh = ih * scale;
                ctx.drawImage(im, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
            }

            function tally(idx, ok) {
                loadedCount++;
                if (!ok) console.warn('[scrolly] frame failed to load: ' + FRAME_URL(idx + 1));
                loader.textContent = 'Loading ' + Math.round(loadedCount / FRAME_COUNT * 100) + '%';
                if (idx === 0 && ok) drawFrame(0);                 // show first frame ASAP
                if (loadedCount >= FRAME_COUNT) { allReady = true; loader.style.display = 'none'; }
            }

            sizeCanvas();
            for (var i = 0; i < FRAME_COUNT; i++) {
                (function (idx) {
                    var im = new Image();
                    frames[idx] = im;                              // assign BEFORE src (cache-safe)
                    im.decoding = 'async';
                    im.onload = function () { tally(idx, true); };
                    im.onerror = function () { tally(idx, false); };
                    im.src = FRAME_URL(idx + 1);                    // 1-based filenames
                })(i);
            }

            // Overlay fade — SAME thresholds, driven by the rendered progress.
            function fadeEl(el, p, i0, i1, o0, o1) {
                if (!el) return;
                var op = 0, ty = 14;
                if (p >= i0 && p < i1) { var tt = (p - i0) / (i1 - i0); op = tt; ty = lerp(14, 0, tt); }
                else if (p >= i1 && (!o0 || p < o0)) { op = 1; ty = 0; }
                else if (o0 && p >= o0 && p <= o1) { var tt2 = (p - o0) / (o1 - o0); op = 1 - tt2; ty = lerp(0, -14, tt2); }
                else if (o1 && p > o1) { op = 0; ty = -14; }
                el.style.opacity = op;
                el.style.transform = 'translateY(' + ty + 'px)';
            }

            function getScrollProg() {
                var top = section.getBoundingClientRect().top + window.scrollY;
                var scrollable = section.offsetHeight - window.innerHeight;
                if (scrollable <= 0) return 0;
                return clamp((window.scrollY - top) / scrollable, 0, 1);
            }

            function paint(p) {
                var idx = Math.round(p * (FRAME_COUNT - 1));
                if (idx < 0) idx = 0; else if (idx > FRAME_COUNT - 1) idx = FRAME_COUNT - 1;
                drawFrame(idx);
                fadeEl(ov1, p, 0, 0.03, 0.14, 0.167);
                fadeEl(ov2, p, 0.21, 0.25, 0.62, 0.67);
                if (hint) hint.style.opacity = (p < 0.04 && allReady) ? 1 : 0;
                if (wol) wol.style.opacity = 0;
                section.style.pointerEvents = p >= 1 ? 'none' : 'auto';
            }

            // ── One continuous rAF loop: dual-ease + lag-bounded catch-up ──
            var target = getScrollProg();
            var current = target;
            var lastActive = -1e9;
            var lastT = 0;

            window.addEventListener('scroll', function () { lastActive = nowMs(); }, { passive: true });
            window.addEventListener('resize', function () { dpr = Math.min(window.devicePixelRatio || 1, 2); sizeCanvas(); }, { passive: true });

            function frame(now) {
                var dt = lastT ? (now - lastT) / 1000 : 1 / 60;
                lastT = now;
                if (dt > 1 / 20) dt = 1 / 20;

                target = getScrollProg();

                var scrolling = (now - lastActive) < 90;
                var base = scrolling ? SMOOTH_SCROLL : SMOOTH_RELEASE;

                var k = 1 - Math.pow(1 - base, dt * 60);
                var next = current + (target - current) * k;

                if (Math.abs(target - next) < 0.0008) next = target;

                // speed limit: cruise at 1x, but let a fast flick catch up the
                // lag beyond LAG_THRESH so it never crawls for seconds (the hang).
                var gap = target - next;
                var over = Math.abs(gap) - LAG_THRESH;
                var rate = CRUISE_RATE + (over > 0 ? over * CATCHUP_BOOST : 0);
                var maxStep = (rate * dt) / CLIP_SECONDS;
                var step = next - current;
                if (Math.abs(step) > maxStep) next = current + (step < 0 ? -maxStep : maxStep);

                if (next !== current) { current = next; paint(current); }
                requestAnimationFrame(frame);
            }

            console.log('[scrolly] frame scrubber active — ' + FRAME_COUNT + ' frames');
            requestAnimationFrame(frame);
        })();
