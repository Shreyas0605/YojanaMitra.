(function () {
            var video = document.getElementById('clay-video-scrub');
            var section = document.getElementById('scrolly-intro');
            var ov1 = document.getElementById('sv-ov1');
            var ov2 = document.getElementById('sv-ov2');
            var wol = document.getElementById('white-out-layer');
            var hint = document.getElementById('scrolly-hint');
            if (!video || !section || window.innerWidth <= 768) return;

            /* ── TUNABLES ─────────────────────────────────────────────────
               SMOOTHING      : how fast the video chases the scroll position.
                                Lower  = longer glide, softer stop, floatier.
                                Higher = tighter tracking, shorter stop.
                                (frame-rate independent; calibrated per 60fps frame)
               MAX_SCRUB_RATE : hard ceiling on scrub speed, in video-seconds
                                per real second. 1 = the video can NEVER move
                                faster than normal 1x playback, no matter how
                                fast or how far the user flicks the wheel/trackpad.
                                Raise toward 1.5–2 if a big fling feels too slow
                                to catch up; keep at 1 for strict 1x.
            */
            var SMOOTHING = 0.085;
            var MAX_SCRUB_RATE = 1;

            if (history.scrollRestoration) history.scrollRestoration = 'manual';
            video.pause();
            video.muted = true;              // required for reliable seeking
            try { video.currentTime = 0; } catch (e) { }

            function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
            function lerp(a, b, t) { return a + (b - a) * t; }

            /* Overlay fade — SAME thresholds as before, but driven by the eased
               progress so the text stays locked to the actual visible frame. */
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

            /* Scroll position -> target progress 0..1.
               Sensitivity-independent: the whole clip always spans the full
               height of the (400vh) section, so one fast flick can't finish it. */
            function getScrollProg() {
                var top = section.getBoundingClientRect().top + window.scrollY;
                var scrollable = section.offsetHeight - window.innerHeight;
                if (scrollable <= 0) return 0;
                return clamp((window.scrollY - top) / scrollable, 0, 1);
            }

            /* Render one eased progress value: seek the video + update overlays.
               We ALWAYS seek straight to the latest time and never queue seeks on
               the 'seeked' event — that queuing is what made the old version lag
               and behave differently every time (it tied scrub speed to decode
               latency). The browser coalesces rapid seeks to the newest value. */
            var lastApplied = -1;
            function paint(p) {
                var dur = video.duration;
                if (video.readyState >= 1 && dur && isFinite(dur)) {
                    var t = p * dur;
                    if (lastApplied < 0 || Math.abs(t - lastApplied) > 0.012) {
                        lastApplied = t;
                        try { video.currentTime = t; } catch (e) { }
                    }
                }
                fadeEl(ov1, p, 0, 0.03, 0.14, 0.167);
                fadeEl(ov2, p, 0.21, 0.25, 0.62, 0.67);
                if (hint) hint.style.opacity = p < 0.04 ? 1 : 0;
                if (wol) wol.style.opacity = 0;
                section.style.pointerEvents = p >= 1 ? 'none' : 'auto';
            }

            /* ── ONE continuous rAF loop: ease current -> target, capped at 1x ──
               This is the whole fix. Scroll only updates a target number; the
               loop smoothly closes the gap every frame, so lifting off no longer
               freezes the video — it glides to a stop. */
            var target = getScrollProg();
            var current = target;            // snap on first frame (no load-time auto-play)
            var primed = false;
            var lastT = 0;

            function frame(now) {
                var dt = lastT ? (now - lastT) / 1000 : 1 / 60;
                lastT = now;
                if (dt > 1 / 20) dt = 1 / 20; // clamp big gaps (tab switch, hitches)

                target = getScrollProg();

                /* First frame the video is seekable: lock instantly to the
                   current scroll position so a refresh mid-section doesn't
                   animate up from 0. Deterministic — no setTimeout guessing. */
                if (!primed) {
                    if (video.readyState >= 1 && video.duration && isFinite(video.duration)) primed = true;
                    current = target;
                    paint(current);
                    requestAnimationFrame(frame);
                    return;
                }

                /* 1) ease toward target (frame-rate independent) */
                var k = 1 - Math.pow(1 - SMOOTHING, dt * 60);
                var next = current + (target - current) * k;

                /* 2) clamp the per-frame step so the scrub never exceeds 1x */
                var maxStep = (MAX_SCRUB_RATE * dt) / (video.duration || 1);
                var step = next - current;
                if (Math.abs(step) > maxStep) next = current + (step < 0 ? -maxStep : maxStep);

                /* 3) settle + idle when essentially there (no endless micro-seeks) */
                if (Math.abs(target - next) < 0.0002) next = target;

                if (next !== current) {
                    current = next;
                    paint(current);
                }
                requestAnimationFrame(frame);
            }

            requestAnimationFrame(frame);
        })();