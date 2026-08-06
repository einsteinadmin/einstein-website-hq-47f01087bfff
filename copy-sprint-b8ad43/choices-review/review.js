/* ============================================================================
   Einstein CHOICES Training — COPY REVIEW LAYER (Lianna Patch sprint)
   ----------------------------------------------------------------------------
   Bolt-on only. Loaded after data/scenarios.js and app.js; touches ZERO game
   logic. It overlays saved copy edits directly onto the SCENARIOS /
   QUIZ_QUESTIONS objects before the game renders them (grading, XP,
   correctChoice are never touched), stamps stable data-edit-key attributes
   onto dynamically rendered scenario/quiz DOM via a MutationObserver, and
   provides a click-to-edit side panel + export HUD. Badges (ACHIEVEMENTS)
   and CHOICES_VALUES are OUT of the editable set (Cameron's 8/6 ruling).

   Persistence: localStorage 'choices-review-edits' only.
   The game's own 'einstein-hybrid-progress' key is NEVER read or written here.
   ==========================================================================*/
(function () {
    'use strict';

    var LS_EDITS = 'choices-review-edits';
    var LS_UI = 'choices-review-ui';
    var SCHEMA = 'einstein-choices-review/v1';
    var REVIEWER = 'Lianna Patch';

    function $(sel, root) { return (root || document).querySelector(sel); }
    function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

    // FNV-1a 32-bit over UTF-16LE bytes -> 8 hex chars.
    // Mirrored byte-for-byte in apply_choices_edits.py (drift guard).
    function hash8(str) {
        var h = 0x811c9dc5;
        for (var i = 0; i < str.length; i++) {
            var c = str.charCodeAt(i);
            h ^= (c & 0xff); h = Math.imul(h, 0x01000193) >>> 0;
            h ^= ((c >> 8) & 0xff); h = Math.imul(h, 0x01000193) >>> 0;
        }
        return ('0000000' + h.toString(16)).slice(-8);
    }

    // ---------------- store ----------------
    var store = {};
    try { store = JSON.parse(localStorage.getItem(LS_EDITS) || '{}') || {}; } catch (e) { store = {}; }
    var ui = {};
    try { ui = JSON.parse(localStorage.getItem(LS_UI) || '{}') || {}; } catch (e) { ui = {}; }
    function persist() { localStorage.setItem(LS_EDITS, JSON.stringify(store)); }
    function persistUi() { localStorage.setItem(LS_UI, JSON.stringify(ui)); }

    function isEdited(key) {
        var e = store[key];
        return !!(e && typeof e.edited === 'string' && e.edited !== e.original);
    }

    // ---------------- registry ----------------
    // key -> { kind: 'data'|'text'|'html'|'attr', label, get(), set(v), el? }
    var registry = {};
    var ORIGINALS = {};
    function reg(key, spec) { registry[key] = spec; }

    // ---- data layer: SCENARIOS ----
    if (typeof SCENARIOS !== 'undefined') {
        SCENARIOS.forEach(function (s) {
            var b = 'scenario.' + s.id;
            var L = 'Scenario ' + s.id + ' · ' + s.value;
            reg(b + '.setup', { kind: 'data', label: L + ' — setup', get: function () { return s.setup; }, set: function (v) { s.setup = v; } });
            reg(b + '.valueDescription', { kind: 'data', label: L + ' — value tagline', get: function () { return s.valueDescription; }, set: function (v) { s.valueDescription = v; } });
            reg(b + '.proTip', { kind: 'data', label: L + ' — pro tip', get: function () { return s.proTip; }, set: function (v) { s.proTip = v; } });
            s.choices.forEach(function (c) {
                var cid = c.id.toUpperCase();
                reg(b + '.choice.' + c.id + '.text', { kind: 'data', label: L + ' — choice ' + cid + ' text', get: function () { return c.text; }, set: function (v) { c.text = v; } });
                reg(b + '.choice.' + c.id + '.feedback', { kind: 'data', label: L + ' — choice ' + cid + ' feedback', get: function () { return c.feedback; }, set: function (v) { c.feedback = v; } });
            });
        });
    }

    // ---- data layer: QUIZ_QUESTIONS (no id field — keyed by index) ----
    if (typeof QUIZ_QUESTIONS !== 'undefined') {
        QUIZ_QUESTIONS.forEach(function (q, i) {
            var b = 'quiz.' + i;
            var L = 'Quiz Q' + (i + 1) + ' · ' + q.value;
            reg(b + '.question', { kind: 'data', label: L + ' — question', get: function () { return q.question; }, set: function (v) { q.question = v; } });
            q.options.forEach(function (_, n) {
                reg(b + '.option.' + n, { kind: 'data', label: L + ' — option ' + (n + 1), get: function () { return q.options[n]; }, set: function (v) { q.options[n] = v; } });
            });
        });
    }

    // NOTE (Cameron's ruling 8/6): ACHIEVEMENTS (badge.*) and CHOICES_VALUES
    // (value.*) are OUT of the editable set. They are not registered, never
    // stamped, and any stale badge.*/value.* entries in localStorage are
    // silently ignored on load and excluded from the export (the registry
    // check in each of those paths handles it).

    // ---- static layer: elements stamped in index.html ----
    $all('[data-edit-key]').forEach(function (el) {
        var key = el.getAttribute('data-edit-key');
        if (registry[key]) return;
        var attr = el.getAttribute('data-edit-attr');
        if (attr) {
            reg(key, {
                kind: 'attr', attr: attr, el: el, label: 'Page copy — ' + key + ' (' + attr + ')',
                get: function () { return el.getAttribute(attr) || ''; },
                set: function (v) { el.setAttribute(attr, v); }
            });
        } else if (el.children.length > 0) {
            reg(key, {
                kind: 'html', el: el, label: 'Page copy — ' + key,
                get: function () { return el.innerHTML.trim(); },
                set: function (v) { el.innerHTML = v; }
            });
        } else {
            reg(key, {
                kind: 'text', el: el, label: 'Page copy — ' + key,
                get: function () { return el.textContent.trim(); },
                set: function (v) { el.textContent = v; }
            });
        }
    });

    // ---------------- capture originals, then apply saved edits at the source ----------------
    Object.keys(registry).forEach(function (k) { ORIGINALS[k] = registry[k].get(); });
    Object.keys(store).forEach(function (k) {
        var e = store[k], r = registry[k];
        if (!r || !e || typeof e.edited !== 'string') return;
        if (e.edited !== ORIGINALS[k]) r.set(e.edited);
    });

    // ---------------- review chrome CSS ----------------
    var css = [
        ':root { --rvw-orange: #EF8B22; --rvw-orange-deep: #d97a1e; --rvw-tint: rgba(239,139,34,0.10); }',
        '[data-edit-key] { cursor: pointer; }',
        '[data-edit-key]:hover { text-decoration: underline dashed var(--rvw-orange); text-decoration-thickness: 2px; text-underline-offset: 4px; }',
        'button[data-edit-key]:hover, input[data-edit-key]:hover, textarea[data-edit-key]:hover { text-decoration: none; outline: 2px dashed var(--rvw-orange); outline-offset: 2px; }',
        '.rvw-edited { box-shadow: inset 3px 0 0 var(--rvw-orange); background-image: linear-gradient(var(--rvw-tint), var(--rvw-tint)); border-radius: 2px; }',
        /* banner */
        '.rvw-banner { background: #27343D; color: #fff; font-family: Roboto, sans-serif; font-size: 14.5px; line-height: 1.55; padding: 12px 18px; position: relative; z-index: 9000; border-bottom: 3px solid var(--rvw-orange); }',
        '.rvw-banner-inner { max-width: 920px; margin: 0 auto; display: flex; gap: 14px; align-items: center; }',
        '.rvw-banner-inner p { margin: 0; flex: 1; }',
        '.rvw-banner strong { color: var(--rvw-orange); }',
        '.rvw-banner button { flex: none; background: var(--rvw-orange); color: #fff; border: 0; border-radius: 6px; padding: 8px 16px; font-weight: 700; font-family: inherit; font-size: 14px; cursor: pointer; }',
        '.rvw-banner button:hover { background: var(--rvw-orange-deep); }',
        /* Bottom clearance: the game content always scrolls clear of the pill,
           so the Continue/next buttons and choice boxes are never covered. */
        '.main-content { padding-bottom: 120px !important; }',
        /* HUD pill */
        '.rvw-hud { position: fixed; left: 16px; bottom: 16px; z-index: 9500; background: #27343D; color: #fff; border: 2px solid var(--rvw-orange); border-radius: 999px; padding: 8px 14px; font-family: Roboto, sans-serif; font-size: 13px; box-shadow: 0 4px 12px rgba(0,0,0,0.25); max-width: calc(100vw - 32px); transition: transform 160ms ease, left 160ms ease, opacity 160ms ease; }',
        /* Dodge state: whenever the pill would sit on top of a clickable game
           element (tall screens, scrolled up), it slides to a slim left-edge
           tab. Hover or tap brings it back, so export stays reachable. */
        '.rvw-hud.rvw-dodge { left: 0; transform: translateX(calc(10px - 100%)); opacity: 0.8; border-radius: 0 999px 999px 0; }',
        '.rvw-hud.rvw-dodge:hover { transform: translateX(0); opacity: 1; }',
        '.rvw-hud-content { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }',
        '.rvw-hud-count { font-weight: 700; white-space: nowrap; }',
        '.rvw-hud button { background: rgba(255,255,255,0.12); color: #fff; border: 1px solid rgba(255,255,255,0.35); border-radius: 999px; padding: 5px 11px; font-family: inherit; font-size: 12.5px; cursor: pointer; white-space: nowrap; }',
        '.rvw-hud button:hover { background: var(--rvw-orange); border-color: var(--rvw-orange); }',
        '#rvwHudToggle { display: none; }',
        /* Narrow viewports: collapse to a 46px dot; tap to expand upward */
        '@media (max-width: 719px) {',
        '  .rvw-hud { background: transparent; border: 0; box-shadow: none; padding: 0; border-radius: 0; }',
        '  #rvwHudToggle { display: flex; align-items: center; justify-content: center; width: 46px; height: 46px; border-radius: 50%; background: #27343D; border: 2px solid var(--rvw-orange); color: #fff; font-size: 18px; cursor: pointer; position: relative; box-shadow: 0 4px 12px rgba(0,0,0,0.3); padding: 0; }',
        '  .rvw-dot-count { position: absolute; top: -5px; right: -5px; background: var(--rvw-orange); color: #fff; border-radius: 999px; font-size: 10px; line-height: 1; padding: 3px 6px; font-weight: 700; }',
        '  .rvw-hud-content { display: none; }',
        '  .rvw-hud.expanded .rvw-hud-content { display: flex; flex-direction: column; align-items: stretch; gap: 8px; position: absolute; bottom: 56px; left: 0; background: #27343D; border: 2px solid var(--rvw-orange); border-radius: 14px; padding: 12px 14px; box-shadow: 0 6px 18px rgba(0,0,0,0.35); width: max-content; max-width: calc(100vw - 32px); }',
        '  .rvw-hud.expanded .rvw-hud-content button { padding: 9px 13px; font-size: 13.5px; }',
        '}',
        /* floating edit chip for buttons/inputs */
        '.rvw-floater { position: fixed; z-index: 9600; background: var(--rvw-orange); color: #fff; border: 0; border-radius: 999px; padding: 4px 12px; font-family: Roboto, sans-serif; font-size: 12.5px; font-weight: 700; cursor: pointer; box-shadow: 0 3px 8px rgba(0,0,0,0.3); display: none; }',
        '.rvw-floater:hover { background: var(--rvw-orange-deep); }',
        /* side panel */
        '.rvw-panel { position: fixed; top: 0; right: 0; height: 100%; width: min(430px, 100vw); z-index: 9700; background: #fff; border-left: 3px solid var(--rvw-orange); box-shadow: -8px 0 24px rgba(0,0,0,0.18); display: flex; flex-direction: column; font-family: Roboto, sans-serif; transform: translateX(105%); transition: transform 200ms ease; }',
        '.rvw-panel.open { transform: translateX(0); }',
        '.rvw-panel-head { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; background: #27343D; color: #fff; }',
        '.rvw-panel-head strong { font-size: 15px; }',
        '.rvw-panel-x { background: none; border: 0; color: #fff; font-size: 22px; line-height: 1; cursor: pointer; padding: 2px 6px; }',
        '.rvw-panel-body { padding: 16px 18px; overflow-y: auto; flex: 1; }',
        '.rvw-loc { font-size: 12.5px; color: #53575A; background: #F6F6F6; border-left: 3px solid var(--rvw-orange); padding: 8px 10px; border-radius: 4px; margin-bottom: 14px; }',
        '.rvw-loc code { font-size: 11px; color: #888; display: block; margin-top: 2px; word-break: break-all; }',
        '.rvw-panel label { display: block; font-size: 12px; font-weight: 700; color: #53575A; text-transform: uppercase; letter-spacing: 0.04em; margin: 12px 0 5px; }',
        '.rvw-panel textarea { width: 100%; box-sizing: border-box; font-family: Roboto, sans-serif; font-size: 14px; line-height: 1.5; color: #27343D; border: 1.5px solid #D4D6D8; border-radius: 8px; padding: 10px; resize: vertical; }',
        '.rvw-panel textarea:focus { outline: none; border-color: var(--rvw-orange); box-shadow: 0 0 0 3px rgba(239,139,34,0.18); }',
        '#rvwText { min-height: 140px; }',
        '#rvwNote { min-height: 60px; }',
        '.rvw-orig { font-size: 12.5px; color: #666; background: #F6F6F6; border-radius: 6px; padding: 8px 10px; margin-top: 8px; white-space: pre-wrap; max-height: 130px; overflow-y: auto; display: none; }',
        '.rvw-orig.show { display: block; }',
        '.rvw-orig-tag { font-weight: 700; color: var(--rvw-orange-deep); display: block; margin-bottom: 3px; }',
        '.rvw-actions { display: flex; gap: 8px; padding: 14px 18px; border-top: 1px solid #e5e5e5; flex-wrap: wrap; }',
        '.rvw-actions button { border-radius: 8px; padding: 10px 16px; font-family: inherit; font-size: 14px; font-weight: 700; cursor: pointer; border: 1.5px solid transparent; }',
        '.rvw-save { background: var(--rvw-orange); color: #fff; }',
        '.rvw-save:hover { background: var(--rvw-orange-deep); }',
        '.rvw-revert { background: #fff; color: #CC0100; border-color: #CC0100 !important; }',
        '.rvw-cancel { background: #fff; color: #53575A; border-color: #D4D6D8 !important; }',
        '@media print { .rvw-banner, .rvw-hud, .rvw-panel, .rvw-floater { display: none !important; } .rvw-edited { box-shadow: none; background-image: none; } }'
    ].join('\n');
    var styleEl = document.createElement('style');
    styleEl.id = 'rvw-styles';
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    // ---------------- intro banner ----------------
    if (!ui.bannerDismissed) {
        var banner = document.createElement('div');
        banner.className = 'rvw-banner';
        banner.innerHTML =
            '<div class="rvw-banner-inner"><p><strong>Hey Lianna — copy review mode is on.</strong> ' +
            'Play this like a brand-new hire, and any time a line could hit harder, click it to rewrite it right there (dashed underline = editable; for buttons, hover and hit the little ✎) — every edit has an optional note field for Cameron. ' +
            'The game works normally the whole way through; when you’re done, hit ⬇ Export edits in the bottom-left pill and send Cameron the file.</p>' +
            '<button id="rvwBannerClose">Got it</button></div>';
        document.body.insertBefore(banner, document.body.firstChild);
        $('#rvwBannerClose').addEventListener('click', function () {
            banner.remove();
            ui.bannerDismissed = true;
            persistUi();
        });
    }

    // ---------------- HUD ----------------
    var hud = document.createElement('div');
    hud.className = 'rvw-hud';
    hud.innerHTML =
        '<button id="rvwHudToggle" aria-label="Copy review tools" aria-expanded="false">✏️<span class="rvw-dot-count" id="rvwDotCount">0</span></button>' +
        '<div class="rvw-hud-content">' +
        '  <span class="rvw-hud-count" id="rvwCount">✏️ 0 edits · 0 notes</span>' +
        '  <button id="rvwExport">⬇ Export edits (JSON)</button>' +
        '  <button id="rvwReset">↺ Reset all</button>' +
        '</div>';
    document.body.appendChild(hud);

    // Narrow viewports: the pill collapses to a small dot; tapping it opens
    // the full controls (stacked upward), so export stays reachable.
    $('#rvwHudToggle').addEventListener('click', function () {
        var open = hud.classList.toggle('expanded');
        this.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // ---- overlap dodge ----
    // The pill must never cover the module's own interactive elements. On any
    // scroll/resize/screen change, check its box against every visible
    // clickable; if it intersects one, slide it into the left-edge tab.
    var dodgePin = 0; // timestamp until which dodging is suppressed (user pulled it out)
    function restRect() {
        // The pill's RESTING box (left 16, bottom 16), computed from offset
        // sizes — transform-independent, so measuring never fights the 160ms
        // dodge transition (reading getBoundingClientRect mid-transition made
        // the state oscillate).
        var w = hud.offsetWidth, h = hud.offsetHeight;
        return { left: 16, right: 16 + w, top: window.innerHeight - 16 - h, bottom: window.innerHeight - 16 };
    }
    function rectHitsClickable(h) {
        var els = document.querySelectorAll('button, input, textarea, select, a');
        for (var i = 0; i < els.length; i++) {
            var el = els[i];
            if (el.closest('.rvw-hud, .rvw-panel, .rvw-floater, .rvw-banner')) continue;
            var cs = getComputedStyle(el);
            if (cs.display === 'none' || cs.visibility === 'hidden') continue;
            var r = el.getBoundingClientRect();
            if (!r.width || !r.height) continue;
            if (r.left < h.right && h.left < r.right && r.top < h.bottom && h.top < r.bottom) return true;
        }
        return false;
    }
    var dodgeQueued = false;
    function updateDodge() {
        dodgeQueued = false;
        if (hud.classList.contains('expanded') || Date.now() < dodgePin) {
            hud.classList.remove('rvw-dodge');
            return;
        }
        // decide from the resting position — deterministic per scroll state
        hud.classList.toggle('rvw-dodge', rectHitsClickable(restRect()));
    }
    function queueDodge() {
        if (dodgeQueued) return;
        dodgeQueued = true;
        requestAnimationFrame(updateDodge);
    }
    window.addEventListener('scroll', queueDodge, { passive: true });
    window.addEventListener('resize', queueDodge);
    document.addEventListener('click', function () { setTimeout(queueDodge, 60); }, true);
    setInterval(queueDodge, 800); // safety net
    // Screen switches (showModule) toggle .hidden on the module sections —
    // watch their class attribute so the dodge check runs on every navigation.
    var modDodgeMo = new MutationObserver(queueDodge);
    $all('.module').forEach(function (sec) {
        modDodgeMo.observe(sec, { attributes: true, attributeFilter: ['class'] });
    });
    // Pulling the tab back out: first tap on a dodged pill just restores it
    // (and expands the dot on phones) instead of triggering a button.
    hud.addEventListener('click', function (e) {
        if (!hud.classList.contains('rvw-dodge')) return;
        e.stopPropagation();
        e.preventDefault();
        hud.classList.remove('rvw-dodge');
        dodgePin = Date.now() + 4000;
        if (getComputedStyle($('#rvwHudToggle')).display !== 'none' && !hud.classList.contains('expanded')) {
            hud.classList.add('expanded');
            $('#rvwHudToggle').setAttribute('aria-expanded', 'true');
        }
    }, true);
    hud.addEventListener('mouseenter', function () {
        if (hud.classList.contains('rvw-dodge')) dodgePin = Date.now() + 2500;
    });

    function counts() {
        var ne = 0, nn = 0;
        Object.keys(store).forEach(function (k) {
            if (!registry[k]) return; // stale keys (e.g. retired badge.*/value.*) don't count
            if (isEdited(k)) ne++;
            if (store[k] && store[k].note) nn++;
        });
        return { edits: ne, notes: nn };
    }
    function updateHud() {
        var c = counts();
        $('#rvwCount').textContent = '✏️ ' + c.edits + ' edit' + (c.edits === 1 ? '' : 's') + ' · ' + c.notes + ' note' + (c.notes === 1 ? '' : 's');
        $('#rvwDotCount').textContent = c.edits;
    }

    $('#rvwExport').addEventListener('click', function () {
        var edits = {};
        Object.keys(store).forEach(function (k) {
            var e = store[k];
            if (!e || !registry[k]) return; // registry filter: badge.*/value.* never export
            if (isEdited(k) || e.note) edits[k] = e;
        });
        var payload = {
            schema: SCHEMA,
            reviewer: REVIEWER,
            exported: new Date().toISOString(),
            edits: edits
        };
        var d = new Date();
        var fname = 'choices-review-lianna-' + d.getFullYear() + '-' +
            ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2) + '.json';
        var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = fname;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
    });

    $('#rvwReset').addEventListener('click', function () {
        var c = counts();
        if (!confirm('Remove all ' + c.edits + ' edits and ' + c.notes + ' notes? Your training progress itself is untouched. This cannot be undone (export first if in doubt).')) return;
        localStorage.removeItem(LS_EDITS);
        location.reload();
    });

    // ---------------- side panel ----------------
    var panel = document.createElement('aside');
    panel.className = 'rvw-panel';
    panel.setAttribute('aria-label', 'Copy editor');
    panel.innerHTML =
        '<div class="rvw-panel-head"><strong id="rvwPanelTitle">✏️ Edit this line</strong><button class="rvw-panel-x" id="rvwClose" aria-label="Close">×</button></div>' +
        '<div class="rvw-panel-body">' +
        '  <div id="rvwEditView">' +
        '    <div class="rvw-loc"><span id="rvwLocLabel"></span><code id="rvwLocKey"></code></div>' +
        '    <label for="rvwText">Your version</label>' +
        '    <textarea id="rvwText"></textarea>' +
        '    <div class="rvw-orig" id="rvwOrig"><span class="rvw-orig-tag">Original</span><span id="rvwOrigText"></span></div>' +
        '    <label for="rvwNote">Note for Cameron (optional)</label>' +
        '    <textarea id="rvwNote" placeholder="Why the change, an alt take, a question…"></textarea>' +
        '  </div>' +
        '</div>' +
        '<div class="rvw-actions" id="rvwEditActions">' +
        '  <button class="rvw-save" id="rvwSave">Save</button>' +
        '  <button class="rvw-revert" id="rvwRevert">Revert to original</button>' +
        '  <button class="rvw-cancel" id="rvwCancel">Cancel</button>' +
        '</div>';
    document.body.appendChild(panel);

    var current = null; // { key, el }

    function openEditor(key, el) {
        var r = registry[key];
        if (!r) return;
        current = { key: key, el: el || r.el || null };
        $('#rvwPanelTitle').textContent = '✏️ Edit this line';
        $('#rvwLocLabel').textContent = r.label;
        $('#rvwLocKey').textContent = key;
        var cur = r.get();
        $('#rvwText').value = cur;
        $('#rvwNote').value = (store[key] && store[key].note) || '';
        var origBox = $('#rvwOrig');
        if (cur !== ORIGINALS[key]) {
            $('#rvwOrigText').textContent = ORIGINALS[key];
            origBox.classList.add('show');
        } else {
            origBox.classList.remove('show');
        }
        panel.classList.add('open');
        $('#rvwText').focus();
    }

    function closePanel() { panel.classList.remove('open'); current = null; }

    function saveCurrent() {
        if (!current) return;
        var key = current.key, r = registry[key];
        var txt = $('#rvwText').value;
        var note = $('#rvwNote').value.trim();
        applyEdit(key, txt, current.el);
        if (txt === ORIGINALS[key] && !note) {
            delete store[key];
        } else {
            store[key] = {
                original: ORIGINALS[key],
                hash: hash8(ORIGINALS[key]),
                edited: txt,
                note: note,
                ts: new Date().toISOString(),
                kind: r.kind,
                attr: r.attr || undefined,
                label: r.label
            };
        }
        persist();
        updateHud();
        markStaticEdited();
        stampDynamic();
        closePanel();
    }

    $('#rvwSave').addEventListener('click', saveCurrent);
    $('#rvwRevert').addEventListener('click', function () {
        if (!current) return;
        $('#rvwText').value = ORIGINALS[current.key];
        saveCurrent(); // note (if any) is kept; text goes back to the original
    });
    $('#rvwCancel').addEventListener('click', closePanel);
    $('#rvwClose').addEventListener('click', closePanel);
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && panel.classList.contains('open')) closePanel();
    });

    // Apply an edit at the source and refresh the touched element in place —
    // no game re-render needed, and answered/feedback state is preserved.
    function applyEdit(key, txt, el) {
        var r = registry[key];
        r.set(txt); // data keys: patches the data object; static keys: updates DOM
        if (r.kind !== 'data' || !el || !el.isConnected) return;
        var m;
        if (/\.(setup|feedback)$/.test(key)) {
            el.innerHTML = txt.replace(/\n/g, '<br>'); // matches app.js's own rendering
        } else if (/\.valueDescription$/.test(key)) {
            m = key.match(/^scenario\.(\d+)\./);
            var s = SCENARIOS.find(function (x) { return String(x.id) === m[1]; });
            el.textContent = (s ? s.value : '') + ': ' + txt;
        } else if ((m = key.match(/\.choice\.([abc])\.text$/))) {
            el.innerHTML = '<span class="choice-letter" aria-hidden="true">' + m[1].toUpperCase() + '</span>' + txt;
            el.setAttribute('aria-label', 'Option ' + m[1].toUpperCase() + ': ' + txt);
        } else {
            el.textContent = txt; // proTip, quiz question/option, value name
        }
    }

    // ---------------- edited-state markers ----------------
    function markStaticEdited() {
        Object.keys(registry).forEach(function (k) {
            var r = registry[k];
            if (r.el) r.el.classList.toggle('rvw-edited', isEdited(k));
        });
    }

    // ---------------- dynamic stamping (scenario / quiz DOM) ----------------
    var lastChoiceId = null;

    function markEl(el, key) {
        if (el.getAttribute('data-edit-key') !== key) el.setAttribute('data-edit-key', key);
        el.classList.toggle('rvw-edited', isEdited(key));
    }

    function stampDynamic() {
        var t = window.training;
        if (!t) return;
        var s = (typeof SCENARIOS !== 'undefined') ? SCENARIOS[t.currentScenario] : null;

        var sc = $('#scenarioContainer');
        if (sc && s) {
            var setup = $('.scenario-setup', sc);
            if (setup) markEl(setup, 'scenario.' + s.id + '.setup');
            var badge = $('.scenario-value-badge', sc);
            if (badge) markEl(badge, 'scenario.' + s.id + '.valueDescription');
            $all('.choice-btn', sc).forEach(function (btn) {
                if (btn.dataset.choice) markEl(btn, 'scenario.' + s.id + '.choice.' + btn.dataset.choice + '.text');
            });
            var fb = $('.feedback-text', sc);
            if (fb && lastChoiceId) markEl(fb, 'scenario.' + s.id + '.choice.' + lastChoiceId + '.feedback');
        }
        var pt = $('#proTipText');
        if (pt && s) markEl(pt, 'scenario.' + s.id + '.proTip');

        var qc = $('#quizContainer');
        if (qc && typeof QUIZ_QUESTIONS !== 'undefined') {
            var qi = t.currentQuizQuestion;
            if (qi >= 0 && qi < QUIZ_QUESTIONS.length) {
                var qt = $('.quiz-question-text', qc);
                if (qt) markEl(qt, 'quiz.' + qi + '.question');
                $all('.quiz-option', qc).forEach(function (btn) {
                    if (btn.dataset.index != null) markEl(btn, 'quiz.' + qi + '.option.' + btn.dataset.index);
                });
            }
        }

        // (assessment grid deliberately NOT stamped — value.* is out of the
        // editable set per Cameron's 8/6 ruling)

        // freshly rendered scenario/quiz content can land under the pill
        if (typeof queueDodge === 'function') queueDodge();
    }

    var mo = new MutationObserver(function () { stampDynamic(); });
    ['scenarioContainer', 'quizContainer', 'proTipModal'].forEach(function (id) {
        var node = document.getElementById(id);
        if (node) mo.observe(node, { childList: true, subtree: true });
    });

    // ---------------- click / hover wiring ----------------
    function isInteractive(el) {
        return el.matches('button, a, input, textarea, select') || !!el.closest('button, a');
    }

    // Capture phase: record which choice was clicked (keys the feedback stamp),
    // and open the editor for non-interactive editable text.
    document.addEventListener('click', function (e) {
        if (!e.target || !e.target.closest) return;
        var cb = e.target.closest('.choice-btn');
        if (cb && cb.dataset.choice) lastChoiceId = cb.dataset.choice;

        var el = e.target.closest('[data-edit-key]');
        if (!el) return;
        if (isInteractive(el)) return; // buttons/inputs edit via the hover ✎ chip
        e.preventDefault();
        e.stopPropagation();
        openEditor(el.getAttribute('data-edit-key'), el);
    }, true);

    // Floating ✎ chip for interactive editable elements (buttons, inputs) so a
    // normal click still plays the game.
    var floater = document.createElement('button');
    floater.className = 'rvw-floater';
    floater.type = 'button';
    floater.textContent = '✎ edit';
    document.body.appendChild(floater);
    var floatKey = null, floatEl = null, floatTimer = null;

    function showFloater(el) {
        floatEl = el;
        floatKey = el.getAttribute('data-edit-key');
        var rect = el.getBoundingClientRect();
        floater.style.display = 'block';
        var top = Math.max(4, rect.top - 12);
        var left = Math.min(window.innerWidth - 70, rect.right - 30);
        floater.style.top = top + 'px';
        floater.style.left = left + 'px';
    }
    function scheduleHide() {
        clearTimeout(floatTimer);
        floatTimer = setTimeout(function () { floater.style.display = 'none'; floatEl = null; }, 350);
    }
    document.addEventListener('mouseover', function (e) {
        if (!e.target || !e.target.closest) return;
        var el = e.target.closest('[data-edit-key]');
        if (el && isInteractive(el)) {
            clearTimeout(floatTimer);
            showFloater(el);
        } else if (floatEl && e.target !== floater && !floater.contains(e.target)) {
            scheduleHide();
        }
    }, true);
    floater.addEventListener('mouseenter', function () { clearTimeout(floatTimer); });
    floater.addEventListener('mouseleave', scheduleHide);
    floater.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (floatKey) openEditor(floatKey, floatEl);
        floater.style.display = 'none';
    });

    // ---------------- boot ----------------
    markStaticEdited();
    updateHud();
    // If the trainee resumes mid-scenario/quiz, the first render happens during
    // game init (after DOMContentLoaded) — the MutationObserver catches it.
})();
