// Einstein CHOICES Training - Hybrid Version
// Combines video content with interactive scenarios

// =====================================
// VIDEO CONFIGURATION
// Replace these IDs with your YouTube video IDs
// =====================================
const VIDEO_CONFIG = {
    welcome: '8Dh10knA15k',      // Welcome/intro video
    culture: 'QMHA3ZrXAxY',     // Why Culture Wins
    choices: 'S_pvbypDrrI',      // Introducing CHOICES
    congrats: 'VIDEO_ID_4'       // Optional congratulations video (leave as-is to skip)
};

// Set to true once you've added real video IDs
const VIDEOS_READY = true;

// Gate the Continue buttons until each video has been watched to the end.
// Fails OPEN: if YouTube's API can't load or a player errors, the buttons
// unlock — a broken embed should never trap someone in the training.
const VIDEO_GATE = true;

// =====================================
// MAIN APPLICATION
// =====================================
class HybridTraining {
    constructor() {
        // State
        this.currentModule = 0;
        this.currentScenario = 0;
        this.currentQuizQuestion = 0;
        this.xp = 0;
        this.quizScore = 0;
        this.quizAttempts = 0;
        this.achievements = [];
        this.scenarioScores = [];
        this.assessmentRatings = {};
        this.commitmentText = '';
        this.userName = '';
        this.watchedVideos = {};
        this.startTime = null;
        this.ytPlayers = {};

        // Module mapping
        this.modules = [
            'module-welcome',
            'module-culture',
            'module-intro-choices',
            'module-scenarios',
            'module-assessment',
            'module-quiz',
            'module-expect',
            'module-complete'
        ];

        this.totalModules = this.modules.length;

        // Load saved progress
        this.loadProgress();

        // Initialize
        this.init();
    }

    init() {
        this.startTime = this.startTime || Date.now();
        this.bindEvents();
        this.initializeVideos();
        this.updateProgress();
        this.updateXPDisplay();
        this.showModule(this.currentModule);

        const nameInput = document.getElementById('userName');
        if (nameInput && this.userName) nameInput.value = this.userName;

        if (this.resumePending) this.showResumePrompt();
    }

    // ===== Resume Prompt =====
    // Progress lives in device-local storage with no login, so a saved run may
    // belong to a previous trainee (or a manager's QA pass). Confirm identity
    // before resuming instead of dropping the new person into someone else's
    // nearly-finished training.
    showResumePrompt() {
        const esc = (s) => String(s).replace(/[&<>"']/g, c => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[c]));
        const firstName = esc((this.userName || '').trim().split(' ')[0] || '');

        const overlay = document.createElement('div');
        overlay.className = 'resume-modal';
        overlay.innerHTML = `
            <div class="resume-content" role="dialog" aria-modal="true" aria-labelledby="resumeTitle">
                <div class="resume-icon">👋</div>
                <h3 id="resumeTitle">${firstName ? `Welcome back, ${firstName}!` : 'Welcome back!'}</h3>
                <p>This device has training in progress${firstName ? ` for <strong>${esc(this.userName)}</strong>` : ''}.
                   If that's you, pick up where you left off. If not, start your own from the beginning.</p>
                <div class="resume-actions">
                    <button class="btn btn-primary" id="resumeContinue">${firstName ? `Continue as ${firstName}` : 'Continue'}</button>
                    <button class="btn btn-secondary" id="resumeFresh">${firstName ? `Not ${firstName}? ` : ''}Start fresh</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        overlay.querySelector('#resumeContinue').addEventListener('click', () => overlay.remove());
        overlay.querySelector('#resumeFresh').addEventListener('click', () => this.resetProgress());
    }

    // ===== Progress Management =====
    saveProgress() {
        const state = {
            currentModule: this.currentModule,
            currentScenario: this.currentScenario,
            currentQuizQuestion: this.currentQuizQuestion,
            xp: this.xp,
            quizScore: this.quizScore,
            quizAttempts: this.quizAttempts,
            achievements: this.achievements,
            scenarioScores: this.scenarioScores,
            assessmentRatings: this.assessmentRatings,
            commitmentText: this.commitmentText,
            userName: this.userName,
            watchedVideos: this.watchedVideos,
            startTime: this.startTime
        };
        localStorage.setItem('einstein-hybrid-progress', JSON.stringify(state));
    }

    loadProgress() {
        const saved = localStorage.getItem('einstein-hybrid-progress');
        if (saved) {
            const state = JSON.parse(saved);
            Object.assign(this, state);
            // Saved runs belong to whoever used this device last — on shared
            // branch computers that's often NOT the current trainee. Flag any
            // meaningful progress so init() can ask "is this you?" instead of
            // silently resuming someone else's run.
            this.resumePending = this.currentModule > 0 || this.currentQuizQuestion > 0 ||
                this.scenarioScores.length > 0 || this.xp > 0;
        }
    }

    resetProgress() {
        localStorage.removeItem('einstein-hybrid-progress');
        location.reload();
    }

    // ===== Video Initialization =====
    initializeVideos() {
        if (!VIDEOS_READY) return;

        // Embed YouTube videos where placeholders exist
        Object.entries(VIDEO_CONFIG).forEach(([key, videoId]) => {
            if (videoId && !videoId.startsWith('VIDEO_ID')) {
                this.embedVideo(key, videoId);
            }
        });

        this.initVideoGate();
    }

    embedVideo(key, videoId) {
        const wrapperMap = {
            welcome: 'video-welcome',
            culture: 'video-culture',
            choices: 'video-choices',
            congrats: 'video-congrats'
        };
        const titleMap = {
            welcome: 'Welcome to Einstein Moving Company',
            culture: 'Why Culture Wins — Einstein Moving Company',
            choices: 'The CHOICES Framework — Einstein Moving Company',
            congrats: 'Congratulations — Einstein Moving Company'
        };

        const wrapper = document.getElementById(wrapperMap[key]);
        if (wrapper) {
            wrapper.innerHTML = `
                <iframe
                    id="yt-${key}"
                    src="https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1"
                    title="${titleMap[key]}"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen>
                </iframe>
            `;
        }
    }

    // ===== Video Gate =====
    // Continue buttons stay locked until each video plays to the end.
    // Fails open on any player/API problem so nobody gets stuck.
    initVideoGate() {
        if (!VIDEO_GATE) return;

        this.gateButtons = {
            welcome: document.getElementById('completeWelcome'),
            culture: document.getElementById('completeCulture'),
            choices: document.getElementById('startScenarios')
        };

        // Lock buttons for videos not yet watched (watched state persists)
        Object.entries(this.gateButtons).forEach(([key, btn]) => {
            if (btn && !this.watchedVideos[key]) {
                btn.dataset.unlockedText = btn.textContent.trim();
                btn.disabled = true;
                btn.textContent = 'Finish the video to continue';
            }
        });

        // If the YouTube API never arrives, unlock everything
        this.ytGateTimeout = setTimeout(() => this.releaseVideoGate('api-timeout'), 12000);

        window.onYouTubeIframeAPIReady = () => {
            clearTimeout(this.ytGateTimeout);
            ['welcome', 'culture', 'choices'].forEach(key => {
                if (!document.getElementById(`yt-${key}`)) return;
                this.ytPlayers[key] = new YT.Player(`yt-${key}`, {
                    events: {
                        onStateChange: (e) => {
                            if (e.data === YT.PlayerState.ENDED) this.markVideoWatched(key);
                        },
                        // A broken embed should never block the training
                        onError: () => this.markVideoWatched(key)
                    }
                });
            });
        };

        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.onerror = () => this.releaseVideoGate('script-error');
        document.head.appendChild(tag);
    }

    markVideoWatched(key) {
        if (this.watchedVideos[key]) return;
        this.watchedVideos[key] = true;
        this.saveProgress();
        this.unlockGateButton(key);
    }

    unlockGateButton(key) {
        const btn = this.gateButtons?.[key];
        if (btn && btn.disabled) {
            btn.disabled = false;
            btn.textContent = btn.dataset.unlockedText || 'Continue';
        }
    }

    // Unlock all gate buttons without marking videos watched (fail-open path)
    releaseVideoGate(reason) {
        Object.keys(this.gateButtons || {}).forEach(key => this.unlockGateButton(key));
    }

    // ===== Easter Egg =====
    initEasterEgg() {
        this.logoTapCount = 0;
        this.logoTapTimer = null;
        const logo = document.getElementById('einsteinLogo');

        logo?.addEventListener('click', () => {
            if (this.achievements.includes('curiousMind')) return;

            this.logoTapCount++;

            // Reset tap count if too slow (must tap 7 times within 4 seconds)
            clearTimeout(this.logoTapTimer);
            this.logoTapTimer = setTimeout(() => { this.logoTapCount = 0; }, 4000);

            // Small wiggle on each tap after 3
            if (this.logoTapCount >= 3) {
                logo.classList.remove('wiggle');
                void logo.offsetWidth; // force reflow to restart animation
                logo.classList.add('wiggle');
            }

            if (this.logoTapCount >= 7) {
                this.logoTapCount = 0;
                this.unlockAchievement('curiousMind');
                this.addXP(150);

                // Show the easter egg message
                document.getElementById('easterEggModal').classList.remove('hidden');
            }
        });

        document.getElementById('closeEasterEgg')?.addEventListener('click', () => {
            document.getElementById('easterEggModal').classList.add('hidden');
        });

        // Quieter second easter egg: tap the truck, get a honk
        document.getElementById('truckIcon')?.addEventListener('click', () => this.honk());
    }

    honk() {
        const truck = document.getElementById('truckIcon');
        const container = document.querySelector('.truck-progress-container');
        if (!truck || !container) return;

        const lines = ['Honk! 📦', 'Beep beep!', 'Genius coming through.', 'Honk honk! 🧠'];
        const bubble = document.createElement('div');
        bubble.className = 'honk-bubble';
        bubble.textContent = lines[Math.floor(Math.random() * lines.length)];
        bubble.style.left = truck.style.left || '3%';
        container.appendChild(bubble);
        setTimeout(() => bubble.remove(), 1400);

        this.honkSound();
    }

    // ===== Synthesized truck sounds (Web Audio — no files, fails silently) =====
    getAudioCtx() {
        try {
            this._audioCtx = this._audioCtx || new (window.AudioContext || window.webkitAudioContext)();
            if (this._audioCtx.state === 'suspended') this._audioCtx.resume();
            return this._audioCtx;
        } catch (e) {
            return null;
        }
    }

    // Friendly pickup-truck double-toot: warm two-note horn chord (major
    // third), quick "beep-beep" rhythm — cheerful, not aggressive
    honkSound() {
        const ctx = this.getAudioCtx();
        if (!ctx) return;
        const now = ctx.currentTime;
        [[0, 0.12], [0.22, 0.18]].forEach(([offset, length]) => {
            const t = now + offset;
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 1600;
            filter.connect(gain);
            gain.connect(ctx.destination);

            [349, 440].forEach(freq => {
                const osc = ctx.createOscillator();
                osc.type = 'triangle';
                osc.frequency.value = freq;
                const osc2 = ctx.createOscillator();
                osc2.type = 'square';
                osc2.frequency.value = freq;
                const squareGain = ctx.createGain();
                squareGain.gain.value = 0.25; // a touch of brass on top
                osc.connect(filter);
                osc2.connect(squareGain);
                squareGain.connect(filter);
                osc.start(t); osc.stop(t + length + 0.05);
                osc2.start(t); osc2.stop(t + length + 0.05);
            });

            gain.gain.setValueAtTime(0.0001, t);
            gain.gain.exponentialRampToValueAtTime(0.14, t + 0.015);
            gain.gain.setValueAtTime(0.14, t + length - 0.03);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + length + 0.04);
        });
    }

    // ===== Event Bindings =====
    bindEvents() {
        // Easter egg
        this.initEasterEgg();

        // Video module buttons
        // Welcome requires a name — it keys the resume prompt on shared
        // devices and prints on the certificate.
        document.getElementById('completeWelcome')?.addEventListener('click', () => {
            const nameInput = document.getElementById('userName');
            const name = (nameInput?.value || this.userName || '').trim();
            if (!name) {
                document.getElementById('userNameError')?.classList.remove('hidden');
                nameInput?.focus();
                return;
            }
            this.userName = name;
            this.saveProgress();
            this.showModule(1);
        });

        document.getElementById('userName')?.addEventListener('input', () => {
            document.getElementById('userNameError')?.classList.add('hidden');
        });

        document.getElementById('completeCulture')?.addEventListener('click', () => {
            this.showModule(2);
        });

        document.getElementById('startScenarios')?.addEventListener('click', () => {
            this.showModule(3);
            this.loadScenario(0);
        });

        // Reference panel toggle
        document.getElementById('toggleReference')?.addEventListener('click', (e) => {
            const btn = e.currentTarget;
            const panel = document.getElementById('referencePanel');
            const isOpen = btn.classList.toggle('open');
            panel.classList.toggle('hidden');
            btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        // Pro tip modal
        document.getElementById('closeProTip')?.addEventListener('click', () => {
            this.hideProTip();
        });

        // Assessment
        // Note: showModule(5) handles quiz init — calling initQuiz() here too
        // double-counted quizAttempts and made Culture Champion unearnable
        document.getElementById('startQuiz')?.addEventListener('click', () => {
            this.showModule(5);
        });

        // Persist the first-week commitment as it's typed
        document.getElementById('commitmentText')?.addEventListener('input', (e) => {
            this.commitmentText = e.target.value;
            this.saveProgress();
        });

        // Quiz
        document.getElementById('retakeQuiz')?.addEventListener('click', () => {
            this.retakeQuiz();
        });

        document.getElementById('showCompletion')?.addEventListener('click', () => {
            this.showModule(6);
        });

        document.getElementById('showResults')?.addEventListener('click', () => {
            this.showModule(7);
        });

        // Completion
        document.getElementById('printCertificate')?.addEventListener('click', () => {
            window.print();
        });

        document.getElementById('restartTraining')?.addEventListener('click', () => {
            this.resetProgress();
        });

        this.initDevNav(); // REVIEW COPY ONLY — not on the live deployment
    }

    // ===== DEV NAV — REVIEW COPY ONLY =====
    initDevNav() {
        const toggle = document.getElementById('devNavToggle');
        const panel = document.getElementById('devNavPanel');
        if (!toggle || !panel) return;

        // Toggle panel visibility
        toggle.addEventListener('click', () => {
            panel.classList.toggle('hidden');
            this.updateDevNavActive();
        });

        // Module jump buttons
        document.querySelectorAll('.dev-nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const moduleIndex = parseInt(btn.dataset.jump);
                this.showModule(moduleIndex);
                if (moduleIndex === 3) {
                    this.loadScenario(0);
                }
                this.updateDevNavActive();
            });
        });

        // Populate scenario dropdown
        const select = document.getElementById('devScenarioJump');
        if (select && typeof SCENARIOS !== 'undefined') {
            SCENARIOS.forEach((s, i) => {
                const opt = document.createElement('option');
                opt.value = i;
                opt.textContent = `${i + 1}. ${s.value} — ${s.setup.substring(0, 40).replace(/\n/g, ' ')}...`;
                select.appendChild(opt);
            });
            select.addEventListener('change', (e) => {
                const idx = parseInt(e.target.value);
                if (!isNaN(idx)) {
                    this.showModule(3);
                    this.loadScenario(idx);
                    select.value = '';
                }
            });
        }

        // Update active state when module changes
        this.updateDevNavActive();
    }

    updateDevNavActive() {
        document.querySelectorAll('.dev-nav-btn').forEach(btn => {
            const moduleIndex = parseInt(btn.dataset.jump);
            btn.classList.toggle('active', moduleIndex === this.currentModule);
        });
    }

    // ===== Module Navigation =====
    // Pause videos on module switch. Use the player API when available
    // (resetting iframe src would destroy the video-gate players); fall back
    // to a src reset for any iframe without a bound player.
    pauseAllVideos() {
        document.querySelectorAll('.video-wrapper iframe').forEach(iframe => {
            const key = iframe.id?.replace(/^yt-/, '');
            const player = this.ytPlayers?.[key];
            if (player && typeof player.pauseVideo === 'function') {
                try { player.pauseVideo(); return; } catch (e) { /* fall through */ }
            }
            const src = iframe.src;
            iframe.src = '';
            iframe.src = src;
        });
    }

    showModule(index) {
        // Pause any playing videos before switching
        this.pauseAllVideos();

        // Hide all modules
        document.querySelectorAll('.module').forEach(m => m.classList.add('hidden'));

        // Show target module
        const targetModule = document.getElementById(this.modules[index]);
        if (targetModule) {
            targetModule.classList.remove('hidden');
        }

        this.currentModule = index;
        this.updateProgress();
        this.saveProgress();

        // Keep the dev-nav active state in sync (review copy only)
        if (document.getElementById('devNav')) this.updateDevNavActive();

        // Update back button visibility
        document.querySelectorAll('.btn-back').forEach(btn => {
            btn.style.display = index > 0 ? 'inline-flex' : 'none';
        });

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Module-specific initialization
        if (index === 3) {
            // Scenarios module - load current scenario
            this.loadScenario(this.currentScenario);
        } else if (index === 4) {
            this.initAssessment();
        } else if (index === 5) {
            // Quiz module - only init if not already in progress
            if (this.currentQuizQuestion === 0 && this.quizScore === 0) {
                this.initQuiz();
            } else {
                // Resuming mid-quiz (e.g. after a page reload) — quizQuestions
                // isn't persisted, so rebuild it and re-render where we left off
                if (!this.quizQuestions) this.quizQuestions = [...QUIZ_QUESTIONS];
                const totalQ = this.quizQuestions.length;
                const totalScoreEl = document.getElementById('quizTotalScore');
                const totalQEl = document.getElementById('quizTotalQ');
                if (totalScoreEl) totalScoreEl.textContent = totalQ;
                if (totalQEl) totalQEl.textContent = totalQ;
                document.getElementById('quizResults').classList.add('hidden');
                document.getElementById('quizContainer').classList.remove('hidden');
                this.loadQuizQuestion();
            }
        } else if (index === 7) {
            this.showCompletion();
        }
    }

    updateProgress() {
        const progress = (this.currentModule / (this.totalModules - 1)) * 100;
        document.getElementById('progressBar').style.width = `${progress}%`;

        // Update aria-valuenow for screen readers
        const progressContainer = document.getElementById('trainingProgress');
        if (progressContainer) {
            progressContainer.setAttribute('aria-valuenow', Math.round(progress));
        }

        // Putter the truck along the road
        const truck = document.getElementById('truckIcon');
        if (truck) {
            const targetPos = Math.max(3, Math.min(97, progress));
            this.animateTruck(truck, targetPos);
        }
    }

    animateTruck(truck, targetPos) {
        // Get current position
        const currentPos = parseFloat(truck.style.left) || 0;
        const distance = targetPos - currentPos;

        // If barely moving or first load, just set it
        if (Math.abs(distance) < 0.5) {
            truck.style.left = `${targetPos}%`;
            return;
        }

        // Start the bounce animation
        truck.classList.add('driving');

        const duration = Math.max(800, Math.abs(distance) * 30); // longer distance = longer drive
        const startTime = performance.now();

        const step = (now) => {
            const elapsed = now - startTime;
            const t = Math.min(elapsed / duration, 1);

            // Ease out — starts fast, slows to a stop (like a truck braking)
            const eased = 1 - Math.pow(1 - t, 3);
            const pos = currentPos + distance * eased;
            truck.style.left = `${pos}%`;

            if (t < 1) {
                requestAnimationFrame(step);
            } else {
                truck.style.left = `${targetPos}%`;
                truck.classList.remove('driving');
            }
        };

        requestAnimationFrame(step);
    }

    // ===== XP System =====
    addXP(amount) {
        this.xp += amount;
        this.updateXPDisplay();
        this.showXPPopup(amount);
        this.saveProgress();

        if (this.xp >= 800) {
            this.unlockAchievement('xpMaster');
        }
    }

    updateXPDisplay() {
        document.getElementById('xpDisplay').textContent = `${this.xp} XP`;
    }

    showXPPopup(amount) {
        const popup = document.getElementById('xpPopup');
        document.getElementById('xpAmount').textContent = `+${amount} XP`;
        popup.classList.remove('hidden');

        setTimeout(() => {
            popup.classList.add('hidden');
        }, 1500);
    }

    // ===== Toasts & Achievements =====
    showToast(title, message, icon = '🏆') {
        const toast = document.getElementById('achievementToast');
        toast.querySelector('.toast-icon').textContent = icon;
        toast.querySelector('.toast-title').textContent = title;
        document.getElementById('toastName').textContent = message;
        toast.classList.remove('hidden');

        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => {
            toast.classList.add('hidden');
        }, 4500);
    }

    unlockAchievement(id) {
        if (this.achievements.includes(id)) return;

        this.achievements.push(id);
        const achievement = ACHIEVEMENTS[id];
        this.showToast('Achievement Unlocked!', `${achievement.icon} ${achievement.name}`);

        this.saveProgress();
    }

    // ===== Scenarios =====
    goPreviousScenario() {
        if (this.currentScenario > 0) {
            this.loadScenario(this.currentScenario - 1);
        } else {
            // Go back to intro-choices video module
            this.showModule(2);
        }
    }

    loadScenario(index) {
        if (index >= SCENARIOS.length) {
            this.completeScenarios();
            return;
        }

        this.currentScenario = index;
        const scenario = SCENARIOS[index];

        document.getElementById('scenarioCount').textContent = index + 1;
        const totalEl = document.getElementById('scenarioTotal');
        if (totalEl) totalEl.textContent = SCENARIOS.length;

        // Update previous button label based on position
        const prevBtn = document.getElementById('prevScenarioBtn');
        if (prevBtn) {
            prevBtn.textContent = index === 0 ? '← Back to Intro' : '← Previous Scenario';
        }

        const container = document.getElementById('scenarioContainer');
        container.innerHTML = `
            <div class="scenario">
                <div class="scenario-value-badge">${scenario.value}: ${scenario.valueDescription}</div>
                <div class="scenario-setup">${scenario.setup.replace(/\n/g, '<br>')}</div>
                <div class="scenario-choices" role="radiogroup" aria-label="Choose your response">
                    ${scenario.choices.map(choice => `
                        <button class="choice-btn" data-choice="${choice.id}" aria-label="Option ${choice.id.toUpperCase()}: ${choice.text.replace(/"/g, '&quot;')}">
                            <span class="choice-letter" aria-hidden="true">${choice.id.toUpperCase()}</span>
                            ${choice.text}
                        </button>
                    `).join('')}
                </div>
                <div class="scenario-feedback-area" aria-live="polite" aria-atomic="true"></div>
            </div>
        `;

        container.querySelectorAll('.choice-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleScenarioChoice(e, scenario));
        });

        // New scenario should start at the top — otherwise the reader lands
        // mid-page on the answer buttons of a question they haven't read
        window.scrollTo({ top: 0, behavior: 'smooth' });

        this.saveProgress();
    }

    handleScenarioChoice(e, scenario) {
        const choiceId = e.target.closest('.choice-btn').dataset.choice;
        const choice = scenario.choices.find(c => c.id === choiceId);
        const isCorrect = choiceId === scenario.correctChoice;

        // Disable and style buttons
        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.disabled = true;
            const btnChoiceId = btn.dataset.choice;
            if (btnChoiceId === choiceId) {
                btn.classList.add(isCorrect ? 'correct' : 'wrong');
            }
            if (btnChoiceId === scenario.correctChoice && !isCorrect) {
                btn.classList.add('show-correct');
            }
        });

        // Record score — keyed by scenario so re-answering (via Previous or a
        // reload) replaces the entry instead of duplicating it / re-earning XP
        const existingIdx = this.scenarioScores.findIndex(s => s.scenarioId === scenario.id);
        const record = {
            scenarioId: scenario.id,
            choiceId: choiceId,
            grade: choice.grade,
            xp: choice.xp
        };
        if (existingIdx >= 0) {
            this.scenarioScores[existingIdx] = record;
        } else {
            this.scenarioScores.push(record);
            if (choice.xp > 0) {
                this.addXP(choice.xp);
            }
        }

        // First choice achievement
        if (this.scenarioScores.length === 1) {
            this.unlockAchievement('firstChoice');
        }

        // Show feedback
        const feedbackArea = document.querySelector('.scenario-feedback-area');
        feedbackArea.innerHTML = `
            <div class="scenario-feedback ${isCorrect ? 'correct' : 'wrong'}">
                <div class="feedback-header">
                    <span class="feedback-icon">${isCorrect ? '✅' : '❌'}</span>
                    <span class="feedback-title">${isCorrect ? 'Excellent!' : 'Not quite...'}</span>
                </div>
                <p class="feedback-text">${choice.feedback.replace(/\n/g, '<br>')}</p>
                ${choice.xp > 0 ? `<p class="xp-earned">+${choice.xp} XP</p>` : ''}
                <button class="btn btn-primary">
                    ${this.currentScenario < SCENARIOS.length - 1 ? 'Next Scenario' : 'Continue to Self-Assessment'}
                </button>
            </div>
        `;

        // On phones the feedback renders below the fold — bring it into view
        feedbackArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        feedbackArea.querySelector('.btn').addEventListener('click', () => {
            if (isCorrect && scenario.proTip) {
                this.showProTip(scenario.proTip);
            } else {
                this.advanceFromScenario();
            }
        });

        this.saveProgress();
    }

    advanceFromScenario() {
        if (this.currentScenario < SCENARIOS.length - 1) {
            this.loadScenario(this.currentScenario + 1);
        } else {
            this.completeScenarios();
        }
    }

    showProTip(tip) {
        document.getElementById('proTipText').textContent = tip;
        document.getElementById('proTipModal').classList.remove('hidden');
    }

    hideProTip() {
        document.getElementById('proTipModal').classList.add('hidden');
        this.advanceFromScenario();
    }

    completeScenarios() {
        // Check for perfect run
        const allA = this.scenarioScores.every(s => s.grade === 'A');
        if (allA) {
            this.unlockAchievement('perfectRun');
        }

        this.showModule(4);
    }

    // ===== Assessment =====
    initAssessment() {
        const grid = document.getElementById('assessmentGrid');

        // Only initialize if empty
        if (grid.children.length === 0) {
            grid.innerHTML = CHOICES_VALUES.map(v => `
                <div class="assessment-item" data-value="${v.letter}" role="radiogroup" aria-label="Rate yourself on ${v.value}">
                    <span class="assessment-value-name" id="rating-label-${v.letter}">${v.value}</span>
                    <div class="rating-buttons">
                        <button class="rating-btn" data-rating="strength" aria-pressed="false">Natural Strength</button>
                        <button class="rating-btn" data-rating="working" aria-pressed="false">Working On It</button>
                        <button class="rating-btn" data-rating="growth" aria-pressed="false">Needs Work</button>
                    </div>
                </div>
            `).join('');

            grid.querySelectorAll('.rating-btn').forEach(btn => {
                btn.addEventListener('click', (e) => this.handleRating(e));
            });
        }

        // Restore saved commitment text
        const commitmentEl = document.getElementById('commitmentText');
        if (commitmentEl && this.commitmentText) {
            commitmentEl.value = this.commitmentText;
        }

        // Apply saved ratings
        Object.entries(this.assessmentRatings).forEach(([value, rating]) => {
            const item = grid.querySelector(`[data-value="${value}"]`);
            if (item) {
                const btn = item.querySelector(`[data-rating="${rating}"]`);
                if (btn) {
                    item.querySelectorAll('.rating-btn').forEach(b => b.classList.remove('selected', 'strength', 'working', 'growth'));
                    btn.classList.add('selected', rating);
                }
            }
        });

        this.checkAssessmentCompletion();
    }

    handleRating(e) {
        const btn = e.target;
        const rating = btn.dataset.rating;
        const item = btn.closest('.assessment-item');
        const value = item.dataset.value;

        // Clear previous selection in this row
        item.querySelectorAll('.rating-btn').forEach(b => {
            b.classList.remove('selected', 'strength', 'working', 'growth');
            b.setAttribute('aria-pressed', 'false');
        });

        // Set new selection
        btn.classList.add('selected', rating);
        btn.setAttribute('aria-pressed', 'true');

        // Save rating
        this.assessmentRatings[value] = rating;
        this.saveProgress();

        this.checkAssessmentCompletion();
    }

    checkAssessmentCompletion() {
        const totalValues = CHOICES_VALUES.length;
        const ratedCount = Object.keys(this.assessmentRatings).length;

        if (ratedCount === totalValues) {
            this.showAssessmentSummary();
        }
    }

    showAssessmentSummary() {
        const strengths = Object.entries(this.assessmentRatings).filter(([, r]) => r === 'strength');
        const growthEdges = Object.entries(this.assessmentRatings).filter(([, r]) => r === 'growth');

        const superpowerValue = strengths.length > 0
            ? CHOICES_VALUES.find(v => v.letter === strengths[0][0])?.value || 'Multiple!'
            : 'Keep exploring!';

        const growthValue = growthEdges.length > 0
            ? CHOICES_VALUES.find(v => v.letter === growthEdges[0][0])?.value || 'Multiple!'
            : 'All-around strong!';

        document.getElementById('superpowerValue').textContent = superpowerValue;
        document.getElementById('growthValue').textContent = growthValue;

        document.getElementById('assessmentSummary').classList.remove('hidden');

        this.unlockAchievement('selfAware');
    }

    // ===== Quiz =====
    initQuiz() {
        this.currentQuizQuestion = 0;
        this.quizScore = 0;
        this.quizAttempts++;

        // Use all questions in defined order
        this.quizQuestions = [...QUIZ_QUESTIONS];

        // Update static total counts in quiz header
        const totalQ = this.quizQuestions.length;
        const totalScoreEl = document.getElementById('quizTotalScore');
        const totalQEl = document.getElementById('quizTotalQ');
        if (totalScoreEl) totalScoreEl.textContent = totalQ;
        if (totalQEl) totalQEl.textContent = totalQ;

        document.getElementById('quizResults').classList.add('hidden');
        document.getElementById('quizContainer').classList.remove('hidden');

        this.loadQuizQuestion();
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    loadQuizQuestion() {
        if (this.currentQuizQuestion >= this.quizQuestions.length) {
            this.showQuizResults();
            return;
        }

        const question = this.quizQuestions[this.currentQuizQuestion];

        document.getElementById('quizQuestionNum').textContent = this.currentQuizQuestion + 1;
        document.getElementById('quizScore').textContent = this.quizScore;
        document.getElementById('quizProgressFill').style.width = `${((this.currentQuizQuestion) / this.quizQuestions.length) * 100}%`;

        const container = document.getElementById('quizContainer');
        container.innerHTML = `
            <div class="quiz-question">
                <p class="quiz-question-text">${question.question}</p>
                <div class="quiz-options">
                    ${question.options.map((opt, i) => `
                        <button class="quiz-option" data-index="${i}">${opt}</button>
                    `).join('')}
                </div>
            </div>
        `;

        container.querySelectorAll('.quiz-option').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleQuizAnswer(e, question));
        });
    }

    handleQuizAnswer(e, question) {
        const selectedIndex = parseInt(e.target.dataset.index);
        const isCorrect = selectedIndex === question.correct;

        document.querySelectorAll('.quiz-option').forEach((btn, i) => {
            btn.disabled = true;
            if (i === selectedIndex) {
                btn.classList.add(isCorrect ? 'correct' : 'incorrect');
            }
            if (i === question.correct) {
                btn.classList.add('correct');
            }
        });

        if (isCorrect) {
            this.quizScore++;
            document.getElementById('quizScore').textContent = this.quizScore;
        }

        // Add a "Next" button instead of auto-advancing
        const quizQuestion = document.querySelector('.quiz-question');
        const nextBtn = document.createElement('button');
        nextBtn.className = 'btn btn-primary';
        nextBtn.style.marginTop = '16px';
        nextBtn.textContent = this.currentQuizQuestion < this.quizQuestions.length - 1 ? 'Next Question' : 'See Results';
        nextBtn.addEventListener('click', () => {
            this.currentQuizQuestion++;
            this.loadQuizQuestion();
        });
        quizQuestion.appendChild(nextBtn);
    }

    showQuizResults() {
        document.getElementById('quizContainer').classList.add('hidden');
        document.getElementById('quizResults').classList.remove('hidden');
        document.getElementById('quizProgressFill').style.width = '100%';

        const total = this.quizQuestions.length;
        const passThreshold = Math.ceil(total * 0.8);
        const passed = this.quizScore >= passThreshold;

        document.getElementById('resultIcon').textContent = passed ? '🎉' : '📚';
        document.getElementById('resultTitle').textContent = passed ? 'Heck yeah — you passed!' : 'Almost There!';
        document.getElementById('resultMessage').textContent = passed
            ? `You scored ${this.quizScore}/${total}! You've demonstrated a solid understanding of the CHOICES values.`
            : `You scored ${this.quizScore}/${total}. You need ${passThreshold}/${total} to pass. Review the values and try again!`;

        if (passed) {
            document.getElementById('showCompletion').classList.remove('hidden');
            document.getElementById('retakeQuiz').classList.add('hidden');

            if (this.quizAttempts === 1) {
                this.unlockAchievement('cultureChampion');
            }
        } else {
            document.getElementById('retakeQuiz').classList.remove('hidden');
            document.getElementById('showCompletion').classList.add('hidden');
        }

        this.saveProgress();
    }

    retakeQuiz() {
        this.initQuiz();
    }

    // ===== Completion =====
    showCompletion() {
        // Set date
        const now = new Date();
        document.getElementById('completionDate').textContent = now.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Pre-fill the certificate with the name captured at welcome
        // (still editable — e.g. to add a middle name)
        const certNameInput = document.getElementById('certName');
        if (certNameInput && !certNameInput.value && this.userName) {
            certNameInput.value = this.userName;
        }

        // Set stats — quizQuestions isn't persisted, so fall back to the
        // source list when arriving here after a page reload
        const quizTotal = (this.quizQuestions || QUIZ_QUESTIONS).length;
        document.getElementById('finalXP').textContent = this.xp;
        document.getElementById('finalQuizScore').textContent = `${this.quizScore}/${quizTotal}`;

        // Calculate scenario grade
        const aCount = this.scenarioScores.filter(s => s.grade === 'A').length;
        const total = this.scenarioScores.length;
        document.getElementById('scenarioGrade').textContent = total > 0 ? `${aCount}/${total} A's` : '—';

        // Echo the first-week commitment — on the certificate and next steps
        const commitment = (this.commitmentText || '').trim();
        const certCommitment = document.getElementById('certCommitment');
        const commitmentEcho = document.getElementById('commitmentEcho');
        if (commitment) {
            if (certCommitment) {
                certCommitment.textContent = `First-week commitment: “${commitment}”`;
                certCommitment.classList.remove('hidden');
            }
            if (commitmentEcho) {
                commitmentEcho.textContent = `You already wrote yours: “${commitment}” — bring it to that conversation.`;
                commitmentEcho.classList.remove('hidden');
            }
        }

        // Create confetti
        this.createConfetti();
    }

    createConfetti() {
        const container = document.getElementById('confetti');
        const colors = ['#EF8B22', '#0979C3', '#69995d', '#FFC107', '#CC0100'];

        for (let i = 0; i < 80; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: absolute;
                width: ${Math.random() * 10 + 5}px;
                height: ${Math.random() * 10 + 5}px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * 100}%;
                top: -20px;
                opacity: ${Math.random() * 0.8 + 0.2};
                animation: confettiFall ${Math.random() * 3 + 2}s linear forwards;
                animation-delay: ${Math.random() * 2}s;
                border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            `;
            container.appendChild(confetti);
        }

        // Add keyframes if not exists — pieces fade out as they fall so they
        // don't pile up on top of the page content
        if (!document.getElementById('confetti-styles')) {
            const style = document.createElement('style');
            style.id = 'confetti-styles';
            style.textContent = `
                @keyframes confettiFall {
                    0% { transform: translateY(0) rotate(0deg); }
                    75% { opacity: inherit; }
                    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        // Remove spent confetti from the DOM once the show is over
        clearTimeout(this.confettiCleanup);
        this.confettiCleanup = setTimeout(() => { container.innerHTML = ''; }, 8000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check for reset flag in URL (add ?reset to URL to clear progress)
    if (window.location.search.includes('reset')) {
        localStorage.removeItem('einstein-hybrid-progress');
        window.location.href = window.location.pathname; // Reload without query
        return;
    }
    window.hybridApp = new HybridTraining();
    window.training = window.hybridApp;
});
