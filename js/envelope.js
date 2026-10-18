/* ═══════════════════════════════════════════════════════
   PRECY & HET — 2D Full-Screen Unveiling Envelope Controller
   Smooth Top/Bottom Shutter Parting & Petal Shower
   ═══════════════════════════════════════════════════════ */

class EnvelopeController {
  constructor() {
    this.screen = document.getElementById('envelope-screen');
    this.seal = document.getElementById('wax-seal');
    this.burst = document.getElementById('seal-burst');
    this.cue = document.getElementById('envelope-prompt');
    this.invitation = document.getElementById('invitation');
    this.replayBtn = document.getElementById('replay-btn');
    this.petals = null;
    this.isOpen = false;
    this.audioStartCallback = null;

    this.init();
  }

  init() {
    // 1. Petal celebration particle system
    if (typeof PetalSystem !== 'undefined') {
      this.petals = new PetalSystem('petals-canvas');
    }

    // 2. Bind seal tap & touch
    if (this.seal) {
      this.seal.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openEnvelope();
      });
      this.seal.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.openEnvelope();
      });
    }

    // 3. Prompt cue click also opens
    if (this.cue) {
      this.cue.addEventListener('click', () => this.openEnvelope());
    }

    // 4. Replay button
    if (this.replayBtn) {
      this.replayBtn.addEventListener('click', () => this.replayOpening());
    }
  }

  onAudioStart(callback) {
    this.audioStartCallback = callback;
  }

  openEnvelope() {
    if (this.isOpen) return;
    this.isOpen = true;

    // A. Trigger Light Flare from the seal
    if (this.burst) {
      this.burst.classList.add('active');
    }

    // B. Trigger Audio (Inside user gesture!)
    if (this.audioStartCallback) {
      try {
        this.audioStartCallback();
      } catch (err) {
        console.warn('Audio unlock notice:', err);
      }
    }

    // C. Unveil: Top shutter slides UP, bottom shutter slides DOWN
    if (this.screen) {
      this.screen.classList.add('unveiled');
    }

    // D. Burst festive petals across the screen
    if (this.petals) {
      setTimeout(() => {
        this.petals.burst(140);
      }, 200);
    }

    // E. Reveal invitation underneath
    if (this.invitation) {
      this.invitation.classList.add('active');
    }

    // F. Finalize after shutters finish sliding off-screen
    setTimeout(() => {
      if (this.screen) {
        this.screen.classList.add('hidden');
      }

      // Smoothly show controls & deck nav
      if (this.replayBtn) this.replayBtn.classList.add('visible');
      const deckNav = document.getElementById('deck-nav');
      if (deckNav) deckNav.classList.add('visible');

      if (window.deckManager) window.deckManager.goToSlide(0);

    }, 1300);
  }

  replayOpening() {
    this.isOpen = false;

    // Hide navigation overlays
    if (this.invitation) this.invitation.classList.remove('active');
    if (this.replayBtn) this.replayBtn.classList.remove('visible');
    const deckNav = document.getElementById('deck-nav');
    if (deckNav) deckNav.classList.remove('visible');

    if (window.deckManager) window.deckManager.goToSlide(0);

    // Reset flare
    if (this.burst) this.burst.classList.remove('active');

    // Reset panels: remove unveiled and hidden
    if (this.screen) {
      this.screen.classList.remove('hidden');
      setTimeout(() => {
        this.screen.classList.remove('unveiled');
      }, 50);
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
}

window.EnvelopeController = EnvelopeController;
