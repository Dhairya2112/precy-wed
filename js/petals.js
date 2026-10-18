/* ═══════════════════════════════════════════════════════
   Petals & Golden Sparkle — Lightweight Canvas Celebration
   ═══════════════════════════════════════════════════════ */

class PetalSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animationId = null;
    this.isActive = false;

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.ctx.scale(dpr, dpr);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }

  createPetal() {
    const types = ['petal', 'sparkle', 'confetti'];
    const type = types[Math.floor(Math.random() * types.length)];

    const particle = {
      type,
      x: Math.random() * this.width,
      y: -20 - Math.random() * 100,
      size: 0,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.04,
      speedX: (Math.random() - 0.5) * 1.5,
      speedY: 0,
      gravity: 0.02 + Math.random() * 0.03,
      maxSpeedY: 1.5 + Math.random() * 1.5,
      wobbleAmplitude: 0.5 + Math.random() * 1.5,
      wobbleFreq: 0.02 + Math.random() * 0.02,
      wobblePhase: Math.random() * Math.PI * 2,
      opacity: 0.6 + Math.random() * 0.4,
      fadeRate: 0.001 + Math.random() * 0.002,
      life: 0,
    };

    if (type === 'petal') {
      particle.size = 6 + Math.random() * 8;
      // Marigold & Rose colors
      const colors = [
        '#F7B731', '#E25822', '#FF6B35', '#FFD700',
        '#FF4757', '#C44569', '#F8A5C2', '#FFEAA7',
        '#D4AF37', '#FCF6BA'
      ];
      particle.color = colors[Math.floor(Math.random() * colors.length)];
    } else if (type === 'sparkle') {
      particle.size = 2 + Math.random() * 3;
      particle.color = `rgba(252, 246, 186, ${0.5 + Math.random() * 0.5})`;
      particle.gravity = 0.01;
      particle.maxSpeedY = 1;
    } else {
      particle.size = 4 + Math.random() * 4;
      const goldShades = ['#D4AF37', '#F2D06B', '#BF953F', '#FCF6BA', '#B38728'];
      particle.color = goldShades[Math.floor(Math.random() * goldShades.length)];
    }

    return particle;
  }

  burst(count = 80) {
    this.isActive = true;
    this.canvas.classList.add('active');

    // Create initial burst
    for (let i = 0; i < count; i++) {
      const p = this.createPetal();
      p.x = this.width / 2 + (Math.random() - 0.5) * this.width * 0.6;
      p.y = this.height * 0.4 + (Math.random() - 0.5) * 100;
      p.speedY = -2 - Math.random() * 3;
      p.speedX = (Math.random() - 0.5) * 4;
      this.particles.push(p);
    }

    // Continue adding gentle falling petals
    this.spawnInterval = setInterval(() => {
      if (this.particles.length < 150) {
        for (let i = 0; i < 3; i++) {
          this.particles.push(this.createPetal());
        }
      }
    }, 200);

    // Auto-stop after 5 seconds
    this.stopTimeout = setTimeout(() => this.stop(), 5000);

    if (!this.animationId) {
      this.animate();
    }
  }

  stop() {
    clearInterval(this.spawnInterval);
    clearTimeout(this.stopTimeout);

    // Let existing particles fall off naturally
    setTimeout(() => {
      this.isActive = false;
      this.particles = [];
      this.canvas.classList.remove('active');
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
      this.ctx.clearRect(0, 0, this.width, this.height);
    }, 3000);
  }

  drawPetal(p) {
    this.ctx.save();
    this.ctx.translate(p.x, p.y);
    this.ctx.rotate(p.rotation);
    this.ctx.globalAlpha = p.opacity;

    if (p.type === 'petal') {
      // Draw petal shape
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, p.size * 0.5, p.size, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Add slight gradient sheen
      this.ctx.globalAlpha = p.opacity * 0.3;
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.beginPath();
      this.ctx.ellipse(-p.size * 0.15, -p.size * 0.2, p.size * 0.2, p.size * 0.4, 0, 0, Math.PI * 2);
      this.ctx.fill();
    } else if (p.type === 'sparkle') {
      // Draw sparkle / star
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const x1 = Math.cos(angle) * p.size;
        const y1 = Math.sin(angle) * p.size;
        const x2 = Math.cos(angle + Math.PI / 4) * p.size * 0.3;
        const y2 = Math.sin(angle + Math.PI / 4) * p.size * 0.3;
        if (i === 0) this.ctx.moveTo(x1, y1);
        else this.ctx.lineTo(x1, y1);
        this.ctx.lineTo(x2, y2);
      }
      this.ctx.closePath();
      this.ctx.fill();
    } else {
      // Confetti rectangle
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    }

    this.ctx.restore();
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // Physics
      p.life++;
      p.speedY = Math.min(p.speedY + p.gravity, p.maxSpeedY);
      p.x += p.speedX + Math.sin(p.life * p.wobbleFreq + p.wobblePhase) * p.wobbleAmplitude;
      p.y += p.speedY;
      p.rotation += p.rotationSpeed;

      // Fade out
      if (p.y > this.height * 0.7) {
        p.opacity -= p.fadeRate * 3;
      }

      // Draw
      if (p.opacity > 0) {
        this.drawPetal(p);
      }

      // Remove off-screen or faded particles
      if (p.y > this.height + 20 || p.opacity <= 0) {
        this.particles.splice(i, 1);
      }
    }

    if (this.isActive || this.particles.length > 0) {
      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      this.animationId = null;
    }
  }
}

window.PetalSystem = PetalSystem;
