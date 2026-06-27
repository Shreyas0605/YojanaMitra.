(function () {
            var video = document.getElementById('clay-video-scrub');
            var section = document.getElementById('scrolly-intro');
            var ov1 = document.getElementById('sv-ov1');
            var ov2 = document.getElementById('sv-ov2');
            var wol = document.getElementById('white-out-layer');
            var hint = document.getElementById('scrolly-hint');
            if (!video || !section || window.innerWidth <= 768) return;

            // Marker — confirm THIS code is live by typing  __ymScrubV2  in the console.
            window.__ymScrubV2 = true;

            /* ── TUNABLES (clip is 12s) ───────────────────────────────────
               MAX_SCRUB_RATE : hard ceiling in video-seconds per real second.
                                1 = never faster than normal 1x playback, no
                                matter how fast/far you scroll. Raise to ~1.5–2
                                if a big flick feels too slow to catch up.
               SMOOTH_SCROLL  : how tightly the video tracks WHILE you scroll.
                                Higher = tighter; lower = floatier.
               SMOOTH_RELEASE : how it eases AFTER you let go — this is the
                                "slow down then stop". Lower = longer, softer
                                glide to rest; higher = settles quicker.
            */
            var MAX_SCRUB_RATE = 1;
            var SMOOTH_SCROLL = 0.12;
            var SMOOTH_RELEASE = 0.045;

            if (history.scrollRestoration) history.scrollRestoration = 'manual';
            video.pause();
            video.muted = true;              // required for reliable seeking
            try { video.currentTime = 0; } catch (e) { }

            function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
            function lerp(a, b, t) { return a + (b - a) * t; }
            function nowMs() { return (window.performance && performance.now) ? performance.now() : Date.now(); }

            /* Overlay fade — SAME thresholds, driven by the rendered progress
               so text stays locked to the visible frame. */
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

            /* Scroll position -> target progress 0..1. Sensitivity-independent:
               the clip always spans the full 400vh section, so one fast flick
               can never finish it. */
            function getScrollProg() {
                var top = section.getBoundingClientRect().top + window.scrollY;
                var scrollable = section.offsetHeight - window.innerHeight;
                if (scrollable <= 0) return 0;
                return clamp((window.scrollY - top) / scrollable, 0, 1);
            }

            /* Seek + overlays. Always seek to the LATEST time; never queue seeks
               on the 'seeked' event (that was the old lag / nondeterminism). */
            var lastApplied = -1;
            function paint(p) {
                var dur = video.duration;
                if (video.readyState >= 1 && dur && isFinite(dur)) {
                    var t = p * dur;
                    if (lastApplied < 0 || Math.abs(t - lastApplied) > 0.0035) {
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

            /* ── ONE continuous rAF loop ────────────────────────────────────
               Scroll only sets a target. Every frame we ease toward it and clamp
               the step to 1x. While scrolling we track tightly; the instant you
               release we switch to a gentler ease so the video DECELERATES to a
               stop instead of freezing. Position-anchored => always lands exactly
               where you scrolled, never drifts, never overshoots. */
            var target = getScrollProg();
            var current = target;        // snap on first frame (no load-time auto-play)
            var lastActive = -1e9;       // timestamp of last real scroll
            var primed = false;
            var lastT = 0;

            window.addEventListener('scroll', function () { lastActive = nowMs(); }, { passive: true });

            function frame(now) {
                var dt = lastT ? (now - lastT) / 1000 : 1 / 60;
                lastT = now;
                if (dt > 1 / 20) dt = 1 / 20;     // clamp big gaps (tab switch / hitches)

                target = getScrollProg();
                var dur = video.duration;
                var ready = video.readyState >= 1 && dur && isFinite(dur);

                /* First seekable frame: lock to scroll position instantly so a
                   mid-section refresh doesn't animate up from 0. */
                if (!primed) {
                    if (ready) primed = true;
                    current = target;
                    paint(current);
                    requestAnimationFrame(frame);
                    return;
                }

                var scrolling = (now - lastActive) < 90;
                var base = scrolling ? SMOOTH_SCROLL : SMOOTH_RELEASE;

                // ease toward target (frame-rate independent)
                var k = 1 - Math.pow(1 - base, dt * 60);
                var next = current + (target - current) * k;

                // settle when essentially there (avoids endless micro-seeks)
                if (Math.abs(target - next) < 0.0008) next = target;

                // FINAL guarantee, applied last: clamp the per-frame step so the
                // scrub can NEVER exceed 1x, no matter what feeds in above.
                var maxStep = (MAX_SCRUB_RATE * dt) / dur;
                var step = next - current;
                if (Math.abs(step) > maxStep) next = current + (step < 0 ? -maxStep : maxStep);

                if (next !== current) {
                    current = next;
                    paint(current);
                }
                requestAnimationFrame(frame);
            }

            requestAnimationFrame(frame);
        })();
