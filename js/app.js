/* ═══════════════════════════════════════════════════════
   PRECY & HET — Royal Wedding Invitation Controller v3.0
   Procedural Indian Wedding Music Synthesizer,
   Enhanced Carousel, Storyline Section Transitions,
   Countdown & Bilingual i18n Engine
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Wedding Date: Nov 23, 2026, 08:00 AM IST ────────
  const WEDDING_DATE = new Date('2026-11-23T08:00:00+05:30');

  // ═════════════════════════════════════════════════════
  // 1. PROCEDURAL INDIAN WEDDING AUDIO SYNTHESIZER
  // Zero external dependencies, offline-ready, iOS safe
  // ═════════════════════════════════════════════════════
  class IndianWeddingAudioEngine {
    constructor() {
      this.ctx = null;
      this.masterGain = null;
      this.isPlaying = false;
      this.isSynthRunning = false;
      this.melodyTimer = null;
      this.droneOscillators = [];
      this.htmlAudio = null;
      this.usingHtmlAudio = false;

      // Try checking if local MP3 file exists first
      this.initHtmlAudio();
    }

    initHtmlAudio() {
      try {
        const audio = new Audio();
        audio.loop = true;
        audio.preload = 'auto';
        audio.src = 'assets/audio/sahiba.mp3';
        this.htmlAudio = audio;
        this.usingHtmlAudio = true;
      } catch (e) {
        this.usingHtmlAudio = false;
      }
    }

    initWebAudio() {
      if (this.ctx) return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }

    // Tanpura Drone (Sa: D3 ~146.83Hz, Pa: A3 ~220Hz, Sa: D4 ~293.66Hz)
    startTanpuraDrone() {
      if (!this.ctx || this.droneOscillators.length > 0) return;

      const freqs = [146.83, 220.00, 293.66];
      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        osc.type = idx === 1 ? 'triangle' : 'sawtooth';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        const detuneOsc = this.ctx.createOscillator();
        detuneOsc.type = 'triangle';
        detuneOsc.frequency.setValueAtTime(freq * 1.002, this.ctx.currentTime);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(380 + idx * 70, this.ctx.currentTime);
        filter.Q.setValueAtTime(2.5, this.ctx.currentTime);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.08 / (idx + 1), this.ctx.currentTime);

        osc.connect(filter);
        detuneOsc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        detuneOsc.start();
        this.droneOscillators.push(osc, detuneOsc);
      });
    }

    stopTanpuraDrone() {
      this.droneOscillators.forEach(osc => {
        try { osc.stop(); osc.disconnect(); } catch (e) {}
      });
      this.droneOscillators = [];
    }

    // Bansuri / Shehnai Flute Melody (Raag Yaman notes: D4, E4, F#4, A4, B4, D5)
    playMelodicNote(freq, startTime, duration) {
      if (!this.ctx || !this.isPlaying) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      const vibrato = this.ctx.createOscillator();
      const vibratoGain = this.ctx.createGain();
      vibrato.frequency.setValueAtTime(5.2, startTime);
      vibratoGain.gain.setValueAtTime(freq * 0.015, startTime);
      vibrato.connect(osc.frequency);
      vibrato.start(startTime + 0.15);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1600, startTime);
      filter.Q.setValueAtTime(1.8, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.15);
      gain.gain.setValueAtTime(0.11, startTime + duration - 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + duration);
      vibrato.stop(startTime + duration);
    }

    playTempleChime(startTime) {
      if (!this.ctx || !this.isPlaying) return;
      const freqs = [1760, 2640];
      freqs.forEach(freq => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.04, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 2.5);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(startTime);
        osc.stop(startTime + 2.6);
      });
    }

    startMelodyLoop() {
      if (this.isSynthRunning) return;
      this.isSynthRunning = true;

      const notes = [
        { f: 293.66, d: 1.2 },
        { f: 329.63, d: 1.0 },
        { f: 369.99, d: 1.6 },
        { f: 440.00, d: 1.8 },
        { f: 493.88, d: 1.2 },
        { f: 587.33, d: 2.2 },
        { f: 493.88, d: 1.0 },
        { f: 440.00, d: 1.5 },
        { f: 369.99, d: 1.8 },
        { f: 329.63, d: 1.2 },
        { f: 293.66, d: 2.8 },
      ];

      let noteIdx = 0;
      let nextTime = this.ctx.currentTime + 0.5;

      const schedule = () => {
        if (!this.isPlaying) return;

        while (nextTime < this.ctx.currentTime + 2.5) {
          const note = notes[noteIdx];
          this.playMelodicNote(note.f, nextTime, note.d);

          if (noteIdx === 0) {
            this.playTempleChime(nextTime);
          }

          nextTime += note.d + 0.25;
          noteIdx = (noteIdx + 1) % notes.length;

          if (noteIdx === 0) {
            nextTime += 2.0;
          }
        }

        this.melodyTimer = setTimeout(schedule, 1000);
      };

      schedule();
    }

    stopMelodyLoop() {
      this.isSynthRunning = false;
      if (this.melodyTimer) {
        clearTimeout(this.melodyTimer);
        this.melodyTimer = null;
      }
    }

    async play() {
      if (this.usingHtmlAudio && this.htmlAudio) {
        try {
          await this.htmlAudio.play();
          this.isPlaying = true;
          return;
        } catch (e) {
          console.warn('HTML Audio play notice, falling back to Web Audio:', e);
        }
      }

      this.initWebAudio();
      if (!this.ctx) return;

      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      this.isPlaying = true;

      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(0.85, this.ctx.currentTime + 1.8);

      this.startTanpuraDrone();
      this.startMelodyLoop();
    }

    pause() {
      this.isPlaying = false;

      if (this.usingHtmlAudio && this.htmlAudio) {
        try {
          this.htmlAudio.pause();
        } catch (e) {}
        return;
      }

      if (this.ctx && this.masterGain) {
        this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
        this.masterGain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);

        setTimeout(() => {
          if (!this.isPlaying) {
            this.stopTanpuraDrone();
            this.stopMelodyLoop();
          }
        }, 550);
      }
    }

    toggle() {
      if (this.isPlaying) {
        this.pause();
      } else {
        this.play();
      }
    }
  }

  // ═════════════════════════════════════════════════════
  // 2. SCROLL PROGRESS BAR CONTROLLER
  // ═════════════════════════════════════════════════════
  class ScrollProgressController {
    constructor() {
      this.bar = document.getElementById('scroll-progress');
      window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    }

    onScroll() {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

      if (this.bar) {
        this.bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
      }
    }
  }

  // ═════════════════════════════════════════════════════
  // 3. ENHANCED MEMORIES CAROUSEL & LIGHTBOX
  // ═════════════════════════════════════════════════════
  class MemoriesGalleryController {
    constructor() {
      this.carousel = document.getElementById('gallery-carousel');
      this.cards = document.querySelectorAll('.gallery__card');
      this.dots = document.querySelectorAll('.gallery__dot');
      this.prevBtn = document.getElementById('gallery-prev-btn');
      this.nextBtn = document.getElementById('gallery-next-btn');
      this.counter = document.getElementById('gallery-counter');
      this.lightbox = document.getElementById('lightbox');
      this.lightboxImg = document.getElementById('lightbox-img');
      this.lightboxClose = document.getElementById('lightbox-close');

      this.currentIndex = 0;
      this.total = this.cards.length;

      this.init();
    }

    init() {
      if (!this.carousel || this.total === 0) return;

      if (this.prevBtn) {
        this.prevBtn.addEventListener('click', () => this.navigate(-1));
      }
      if (this.nextBtn) {
        this.nextBtn.addEventListener('click', () => this.navigate(1));
      }

      this.dots.forEach(dot => {
        dot.addEventListener('click', () => {
          const idx = parseInt(dot.getAttribute('data-idx'), 10);
          this.scrollToIndex(idx);
        });
      });

      let scrollTimeout;
      this.carousel.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => this.onCarouselScroll(), 60);
      }, { passive: true });

      this.cards.forEach(card => {
        card.addEventListener('click', () => {
          const img = card.querySelector('img');
          const caption = card.getAttribute('data-caption') || (img ? img.alt : '');
          if (img) this.openLightbox(img.src, caption);
        });
      });

      if (this.lightboxClose) {
        this.lightboxClose.addEventListener('click', () => this.closeLightbox());
      }
      if (this.lightbox) {
        this.lightbox.addEventListener('click', (e) => {
          if (e.target === this.lightbox) this.closeLightbox();
        });
      }
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.closeLightbox();
      });
    }

    onCarouselScroll() {
      const scrollLeft = this.carousel.scrollLeft;
      const cardWidth = this.cards[0].offsetWidth + 20;
      const newIndex = Math.round(scrollLeft / cardWidth);

      if (newIndex !== this.currentIndex && newIndex >= 0 && newIndex < this.total) {
        this.currentIndex = newIndex;
        this.updateActiveState();
      }
    }

    navigate(direction) {
      let target = this.currentIndex + direction;
      if (target < 0) target = this.total - 1;
      if (target >= this.total) target = 0;
      this.scrollToIndex(target);
    }

    scrollToIndex(idx) {
      if (idx < 0 || idx >= this.total) return;
      this.currentIndex = idx;
      const card = this.cards[idx];
      if (card) {
        const offset = card.offsetLeft - (this.carousel.offsetWidth - card.offsetWidth) / 2;
        this.carousel.scrollTo({
          left: Math.max(0, offset),
          behavior: 'smooth'
        });
      }
      this.updateActiveState();
    }

    updateActiveState() {
      this.dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === this.currentIndex);
      });

      if (this.counter) {
        const currentPadded = String(this.currentIndex + 1).padStart(2, '0');
        const totalPadded = String(this.total).padStart(2, '0');
        this.counter.textContent = `${currentPadded} / ${totalPadded}`;
      }
    }

    openLightbox(src, alt) {
      if (this.lightboxImg) {
        this.lightboxImg.src = src;
        this.lightboxImg.alt = alt || '';
      }
      if (this.lightbox) {
        this.lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    }

    closeLightbox() {
      if (this.lightbox) {
        this.lightbox.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
  }

  // ═════════════════════════════════════════════════════
  // 4. LIVE WEDDING COUNTDOWN TIMER
  // ═════════════════════════════════════════════════════
  class CountdownTimer {
    constructor() {
      this.daysEl = document.getElementById('countdown-days');
      this.hoursEl = document.getElementById('countdown-hours');
      this.minutesEl = document.getElementById('countdown-minutes');
      this.secondsEl = document.getElementById('countdown-seconds');

      if (this.daysEl) {
        this.update();
        setInterval(() => this.update(), 1000);
      }
    }

    update() {
      const now = new Date();
      const diff = WEDDING_DATE - now;

      if (diff <= 0) {
        if (this.daysEl) this.daysEl.textContent = '00';
        if (this.hoursEl) this.hoursEl.textContent = '00';
        if (this.minutesEl) this.minutesEl.textContent = '00';
        if (this.secondsEl) this.secondsEl.textContent = '00';
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % 1000) / 1000);

      if (this.daysEl) this.daysEl.textContent = String(days).padStart(2, '0');
      if (this.hoursEl) this.hoursEl.textContent = String(hours).padStart(2, '0');
      if (this.minutesEl) this.minutesEl.textContent = String(minutes).padStart(2, '0');
      if (this.secondsEl) this.secondsEl.textContent = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');
    }
  }

  // ═════════════════════════════════════════════════════
  // 5. TIMELINE TABS
  // ═════════════════════════════════════════════════════
  class TimelineTabs {
    constructor() {
      this.tabs = document.querySelectorAll('.timeline__tab');
      this.panels = document.querySelectorAll('.timeline__day-panel');

      this.tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          const day = tab.getAttribute('data-day');
          this.switchTo(day);
        });
      });
    }

    switchTo(day) {
      this.tabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-day') === day));
      this.panels.forEach(p => p.classList.toggle('active', p.getAttribute('data-day') === day));
    }
  }

  // ═════════════════════════════════════════════════════
  // 6. 8-SLIDE PRESENTATION DECK MANAGER (PPT Overlapping Transitions)
  // ═════════════════════════════════════════════════════
  class PresentationDeckManager {
    constructor(envelopeInstance) {
      this.envelope = envelopeInstance;
      this.slides = Array.from(document.querySelectorAll('.slide'));
      this.currentIdx = 0;
      this.isTransitioning = false;
      this.progressBar = document.getElementById('scroll-progress');
      this.chapterTitleEl = document.getElementById('deck-chapter-title');
      this.fractionEl = document.getElementById('deck-fraction');
      this.prevBtn = document.getElementById('deck-prev-btn');
      this.nextBtn = document.getElementById('deck-next-btn');
      this.scrollCue = document.getElementById('hero-scroll-cue');

      this.initEvents();
      this.updateProgress();

      window.deckManager = this;
    }

    initEvents() {
      let lastTransitionTime = 0;
      const TRANSITION_COOLDOWN = 620; // Matches silky 0.62s CSS transition

      // Deck Navigation Buttons
      if (this.prevBtn) {
        this.prevBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.prev();
        });
      }
      if (this.nextBtn) {
        this.nextBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.next();
        });
      }
      if (this.scrollCue) {
        this.scrollCue.addEventListener('click', (e) => {
          e.preventDefault();
          this.next();
        });
      }

      // 1. Silky Wheel Navigation with velocity check & debounce
      let wheelAccumulator = 0;
      let wheelResetTimer = null;
      window.addEventListener('wheel', (e) => {
        const now = Date.now();
        if (this.isTransitioning || now - lastTransitionTime < TRANSITION_COOLDOWN) return;

        // If current slide's content can scroll internally, let it scroll smoothly
        const activeContent = this.slides[this.currentIdx]?.querySelector('.slide__content');
        if (activeContent && activeContent.scrollHeight > activeContent.clientHeight + 12) {
          const isAtBottom = activeContent.scrollTop + activeContent.clientHeight >= activeContent.scrollHeight - 6;
          const isAtTop = activeContent.scrollTop <= 6;
          if (e.deltaY > 0 && !isAtBottom) return;
          if (e.deltaY < 0 && !isAtTop) return;
        }

        wheelAccumulator += e.deltaY;
        clearTimeout(wheelResetTimer);
        wheelResetTimer = setTimeout(() => {
          wheelAccumulator = 0;
        }, 140);

        const THRESHOLD = 24;
        if (wheelAccumulator > THRESHOLD) {
          wheelAccumulator = 0;
          lastTransitionTime = now;
          this.next();
        } else if (wheelAccumulator < -THRESHOLD) {
          wheelAccumulator = 0;
          lastTransitionTime = now;
          this.prev();
        }
      }, { passive: true });

      // 2. High-performance Touch & Flick Swiping (60fps Mobile Optimized)
      let touchStartY = 0;
      let touchStartX = 0;
      let touchStartTime = 0;

      window.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
          touchStartY = e.touches[0].clientY;
          touchStartX = e.touches[0].clientX;
          touchStartTime = Date.now();
        }
      }, { passive: true });

      window.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (this.isTransitioning || now - lastTransitionTime < TRANSITION_COOLDOWN) return;
        if (e.changedTouches.length === 0) return;

        const touchEndY = e.changedTouches[0].clientY;
        const touchEndX = e.changedTouches[0].clientX;
        const deltaY = touchStartY - touchEndY;
        const deltaX = touchStartX - touchEndX;
        const duration = Math.max(1, now - touchStartTime);

        // Allow smooth horizontal swiping inside gallery carousel without changing slides
        if (e.target && e.target.closest('#gallery-carousel')) {
          if (Math.abs(deltaX) > Math.abs(deltaY)) return;
        }

        // Fast flick (<320ms) needs only 20px threshold; slower swipe needs 34px
        const threshold = duration < 320 ? 20 : 34;

        if (Math.abs(deltaY) > threshold && Math.abs(deltaY) > Math.abs(deltaX) * 1.1) {
          const activeContent = this.slides[this.currentIdx]?.querySelector('.slide__content');
          if (activeContent && activeContent.scrollHeight > activeContent.clientHeight + 12) {
            const isAtBottom = activeContent.scrollTop + activeContent.clientHeight >= activeContent.scrollHeight - 6;
            const isAtTop = activeContent.scrollTop <= 6;
            if (deltaY > 0 && !isAtBottom) return;
            if (deltaY < 0 && !isAtTop) return;
          }

          lastTransitionTime = now;
          if (deltaY > 0) {
            this.next();
          } else {
            this.prev();
          }
        }
      }, { passive: true });

      // 3. Keyboard navigation
      window.addEventListener('keydown', (e) => {
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
        if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === 'ArrowRight' || e.key === ' ') {
          e.preventDefault();
          this.next();
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'ArrowLeft') {
          e.preventDefault();
          this.prev();
        }
      });

      // 4. Slide 8 Replay Invitation Button
      const replaySlideBtn = document.getElementById('btn-replay-invitation');
      if (replaySlideBtn) {
        replaySlideBtn.addEventListener('click', (e) => {
          e.preventDefault();
          if (this.envelope) {
            this.envelope.replayOpening();
          }
        });
      }
    }

    goToSlide(targetIdx) {
      if (targetIdx < 0 || targetIdx >= this.slides.length) return;
      if (targetIdx === this.currentIdx && this.slides[targetIdx].classList.contains('is-active')) return;
      if (this.isTransitioning) return;

      this.isTransitioning = true;
      const prevIdx = this.currentIdx;
      this.currentIdx = targetIdx;
      const isMovingForward = targetIdx > prevIdx;

      const prevSlide = this.slides[prevIdx];
      const targetSlide = this.slides[targetIdx];

      // Prepare target slide initial position before transition
      if (targetSlide) {
        targetSlide.classList.remove('is-leaving-up', 'is-leaving-down', 'is-entering-top');
        if (!isMovingForward) {
          // If going backward, incoming slide starts from above
          targetSlide.classList.add('is-entering-top');
        }
        // Force layout reflow so the browser registers the starting coordinate
        void targetSlide.offsetHeight;
      }

      // Double requestAnimationFrame ensures the layout engine has painted the starting frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Current slide transitions out in opposite direction
          if (prevSlide) {
            prevSlide.classList.remove('is-active', 'is-entering-top');
            if (isMovingForward) {
              prevSlide.classList.add('is-leaving-up');
            } else {
              prevSlide.classList.add('is-leaving-down');
            }
          }

          // Target slide transitions in
          if (targetSlide) {
            targetSlide.classList.remove('is-entering-top', 'is-leaving-up', 'is-leaving-down', 'is-prev');
            targetSlide.classList.add('is-active');
            const content = targetSlide.querySelector('.slide__content');
            if (content) content.scrollTo({ top: 0, behavior: 'instant' });
          }
        });
      });

      this.updateProgress();

      // Clean up classes after transition finishes (620ms)
      setTimeout(() => {
        this.slides.forEach((s, idx) => {
          if (idx !== this.currentIdx) {
            s.classList.remove('is-leaving-up', 'is-leaving-down', 'is-entering-top', 'is-prev', 'is-active');
          }
        });
        this.isTransitioning = false;
      }, 620);
    }

    next() {
      if (this.currentIdx < this.slides.length - 1) {
        this.goToSlide(this.currentIdx + 1);
      }
    }

    prev() {
      if (this.currentIdx > 0) {
        this.goToSlide(this.currentIdx - 1);
      }
    }

    updateProgress() {
      if (this.progressBar) {
        const pct = this.slides.length > 1 ? (this.currentIdx / (this.slides.length - 1)) * 100 : 0;
        this.progressBar.style.width = `${pct}%`;
      }

      const CHAPTER_TITLES = [
        'Precy & Het',
        'Ancestral Heritage',
        'Ceremonies · Day I',
        'Ceremonies · Day II',
        'Love Keepsakes',
        'Moments of Forever',
        'Sacred Venue Guide',
        'Patel Parivar'
      ];

      if (this.chapterTitleEl) {
        this.chapterTitleEl.textContent = CHAPTER_TITLES[this.currentIdx] || `Chapter ${this.currentIdx + 1}`;
      }
      if (this.fractionEl) {
        const current = String(this.currentIdx + 1).padStart(2, '0');
        const total = String(this.slides.length).padStart(2, '0');
        this.fractionEl.textContent = `${current} / ${total}`;
      }
      if (this.prevBtn) {
        this.prevBtn.disabled = this.currentIdx === 0;
      }
      if (this.nextBtn) {
        this.nextBtn.disabled = this.currentIdx === this.slides.length - 1;
      }
      if (this.scrollCue) {
        this.scrollCue.style.opacity = this.currentIdx === 0 ? '0.85' : '0';
        this.scrollCue.style.pointerEvents = this.currentIdx === 0 ? 'auto' : 'none';
      }
    }
  }

  // ═════════════════════════════════════════════════════
  // 7. CALENDAR & DIRECTIONS URL GENERATORS
  // ═════════════════════════════════════════════════════
  function openCalendar() {
    const start = '20261123T023000Z'; // Nov 23, 08:00 AM IST
    const end = '20261124T120000Z';   // Nov 24, 05:30 PM IST
    const title = encodeURIComponent('Precy & Het Royal Wedding Celebration 💒');
    const location = encodeURIComponent('Vanraji Resort, Danta Ambaji Highway, Ambaji, Gujarat 385110');
    const details = encodeURIComponent(
      'Sacred Wedding Celebration of Dr. Precy & Het\n\n' +
      'Day 1 (Nov 23): Lagna Muhurt (8:00 AM), Ganesh Sthapan (9:00 AM), Grah Shantak (10:30 AM), Mameru (2:00 PM), Haldi Rasm (4:00 PM), Sangeet Sandhya (8:30 PM)\n' +
      'Day 2 (Nov 24): Jaan Aagaman (8:30 AM), Hasta Melap (11:30 AM), Bhojan Samarambh (12:30 PM), Kanya Viday (3:15 PM)\n\n' +
      'Venue: Vanraji Resort, Ambaji\n' +
      'Host Contact: 94274 73078 / 94274 91692'
    );

    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&location=${location}&details=${details}`;
    window.open(url, '_blank');
  }

  function openDirections() {
    window.open('https://www.google.com/maps/search/Vanraji+Resort+Ambaji+Banaskantha+Gujarat', '_blank');
  }

  // ═════════════════════════════════════════════════════
  // 8. MAIN INITIALIZATION
  // ═════════════════════════════════════════════════════
  function init() {
    // 1. Audio Engine
    const audio = new IndianWeddingAudioEngine();

    // 2. Envelope Controller with Audio Trigger on unsealing
    const envelope = new EnvelopeController();
    envelope.onAudioStart(() => {
      audio.play();
    });

    // 3. Initialize English Primary Language
    if (window.i18n) {
      window.i18n.setLanguage('en');
    }

    // 4. Countdown timer
    new CountdownTimer();

    // 5. Timeline tabs
    new TimelineTabs();

    // 6. Enhanced Memories Carousel
    new MemoriesGalleryController();

    // 7. 8-Slide Presentation Deck Manager (PPT Transitions)
    const deck = new PresentationDeckManager(envelope);
    window.deckManager = deck;

    // 8. Action Buttons (Calendar & Directions)
    const calendarBtns = document.querySelectorAll('.btn-calendar');
    calendarBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openCalendar();
      });
    });

    const directionBtns = document.querySelectorAll('.btn-directions');
    directionBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openDirections();
      });
    });

    // Tap venue map area to open Google Maps directly
    const venueMap = document.querySelector('.venue__map');
    if (venueMap) {
      venueMap.style.cursor = 'pointer';
      venueMap.setAttribute('title', 'Tap to open in Google Maps');
      venueMap.addEventListener('click', () => {
        openDirections();
      });
    }
  }

  // DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
