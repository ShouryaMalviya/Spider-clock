/**
 * Spider Clock - Master Animation & Interaction Script
 * Articulated spider analog timepiece with real-time accuracy and smooth animation
 */

(function () {
  'use strict';

  // --- Configuration & Constants ---
  const CLOCK_CENTER = 400;
  const NUMERAL_RADIUS = 295;
  const TICK_RADIUS = 328;
  const WEB_SPOKES_COUNT = 12;
  const WEB_RINGS_COUNT = 6;
  const WEB_MAX_RADIUS = 250;

  // --- DOM Elements ---
  const numbersGroup = document.getElementById('numbersGroup');
  const dialTicksGroup = document.getElementById('dialTicks');
  const mandalaRingsGroup = document.getElementById('mandalaRings');
  const radialSpokesGroup = document.getElementById('radialSpokes');
  const spiralStrandsGroup = document.getElementById('spiralStrands');
  const dewDropsGroup = document.getElementById('dewDrops');
  const clockHandsGroup = document.getElementById('clockHandsGroup');

  const hourHandWrapper = document.getElementById('hourHandWrapper');
  const minuteHandWrapper = document.getElementById('minuteHandWrapper');
  const secondHandWrapper = document.getElementById('secondHandWrapper');

  const digitalTimeEl = document.getElementById('digitalTime');
  const digitalAmPmEl = document.getElementById('digitalAmPm');
  const sweepToggleBtn = document.getElementById('sweepToggleBtn');
  const sweepModeLabel = document.getElementById('sweepModeLabel');
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const soundLabel = document.getElementById('soundLabel');
  const soundMuteSlash = document.getElementById('soundMuteSlash');
  const webPulseBtn = document.getElementById('webPulseBtn');
  const clockWrapper = document.querySelector('.clock-wrapper');
  const spiderBodyGroup = document.getElementById('spiderBodyGroup');
  const ambientCanvas = document.getElementById('ambientCanvas');

  // --- State ---
  let isSmoothSweep = true;
  let isAudioEnabled = false;
  let lastSecondInt = -1;
  let audioCtx = null;
  let mousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

  // ==========================================================================
  // 1. GENERATE CLOCK FACE: NUMERALS 1 TO 12 & SUBTLE TICKS
  // ==========================================================================
  function initClockFace() {
    // 1. Generate 12 Numerals
    for (let i = 1; i <= 12; i++) {
      // 12 is at -90 deg (top), 1 at -60 deg, etc.
      const angleDeg = i * 30 - 90;
      const angleRad = (angleDeg * Math.PI) / 180;

      const x = CLOCK_CENTER + NUMERAL_RADIUS * Math.cos(angleRad);
      const y = CLOCK_CENTER + NUMERAL_RADIUS * Math.sin(angleRad);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x.toFixed(2));
      text.setAttribute('y', y.toFixed(2));
      text.setAttribute('class', 'clock-number');
      text.setAttribute('data-hour', i);
      text.textContent = i;
      numbersGroup.appendChild(text);
    }

    // 2. Generate 60 Minute/Second Subtle Dial Ticks
    for (let i = 0; i < 60; i++) {
      const angleDeg = i * 6 - 90;
      const angleRad = (angleDeg * Math.PI) / 180;
      const isHour = i % 5 === 0;

      const rInner = isHour ? TICK_RADIUS - 10 : TICK_RADIUS - 5;
      const rOuter = TICK_RADIUS;

      const x1 = CLOCK_CENTER + rInner * Math.cos(angleRad);
      const y1 = CLOCK_CENTER + rInner * Math.sin(angleRad);
      const x2 = CLOCK_CENTER + rOuter * Math.cos(angleRad);
      const y2 = CLOCK_CENTER + rOuter * Math.sin(angleRad);

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1.toFixed(2));
      line.setAttribute('y1', y1.toFixed(2));
      line.setAttribute('x2', x2.toFixed(2));
      line.setAttribute('y2', y2.toFixed(2));
      line.setAttribute('class', `dial-tick ${isHour ? 'hour-tick' : ''}`);
      dialTicksGroup.appendChild(line);
    }
  }

  // ==========================================================================
  // 2. GENERATE DELICATE INTRICATE WEB & MANDALA PATTERN
  // ==========================================================================
  function initWebPattern() {
    const spokes = WEB_SPOKES_COUNT;
    const spokeAngles = [];

    // Radial spokes matching the 12 clock hour directions
    for (let i = 0; i < spokes; i++) {
      const angleDeg = i * (360 / spokes) - 90;
      const angleRad = (angleDeg * Math.PI) / 180;
      spokeAngles.push(angleRad);

      const rStart = 28; // clears spider body
      const rEnd = WEB_MAX_RADIUS;

      const x1 = CLOCK_CENTER + rStart * Math.cos(angleRad);
      const y1 = CLOCK_CENTER + rStart * Math.sin(angleRad);
      const x2 = CLOCK_CENTER + rEnd * Math.cos(angleRad);
      const y2 = CLOCK_CENTER + rEnd * Math.sin(angleRad);

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1.toFixed(2));
      line.setAttribute('y1', y1.toFixed(2));
      line.setAttribute('x2', x2.toFixed(2));
      line.setAttribute('y2', y2.toFixed(2));
      radialSpokesGroup.appendChild(line);
    }

    // Concentric Web Rings & Catenary Sagging Arcs (Realistic Spider Web)
    const ringRadii = [48, 80, 118, 160, 205, 248];

    ringRadii.forEach((r, ringIdx) => {
      // Create a smooth polygon/catenary path connecting all 12 spokes
      let pathData = '';
      const sagFactor = 0.94 - ringIdx * 0.012; // Natural silk tension sag between spokes

      for (let s = 0; s < spokes; s++) {
        const nextS = (s + 1) % spokes;
        const a1 = spokeAngles[s];
        const a2 = spokeAngles[nextS];

        const x1 = CLOCK_CENTER + r * Math.cos(a1);
        const y1 = CLOCK_CENTER + r * Math.sin(a1);
        const x2 = CLOCK_CENTER + r * Math.cos(a2);
        const y2 = CLOCK_CENTER + r * Math.sin(a2);

        // Control point for the sagged silk thread arc
        const midAngle = (a1 + a2) / 2 + (a2 < a1 ? Math.PI : 0);
        const rSag = r * sagFactor;
        const cx = CLOCK_CENTER + rSag * Math.cos(midAngle);
        const cy = CLOCK_CENTER + rSag * Math.sin(midAngle);

        if (s === 0) {
          pathData += `M ${x1.toFixed(2)} ${y1.toFixed(2)} `;
        }
        pathData += `Q ${cx.toFixed(2)} ${cy.toFixed(2)} ${x2.toFixed(2)} ${y2.toFixed(2)} `;

        // Tiny dew drop pearls at spoke intersections
        if (ringIdx % 2 === 0 || s % 2 === 0) {
          const drop = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          drop.setAttribute('cx', x1.toFixed(2));
          drop.setAttribute('cy', y1.toFixed(2));
          drop.setAttribute('r', (1.4 + Math.random() * 0.9).toFixed(1));
          dewDropsGroup.appendChild(drop);
        }
      }

      const webPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      webPath.setAttribute('d', pathData + 'Z');
      spiralStrandsGroup.appendChild(webPath);
    });

    // Subtle Mandala Accent: Concentric Rosette Petals in the center
    const mandalaRadius = 90;
    for (let p = 0; p < 12; p++) {
      const a = (p * 30 * Math.PI) / 180;
      const petalDist = 58;
      const px = CLOCK_CENTER + petalDist * Math.cos(a);
      const py = CLOCK_CENTER + petalDist * Math.sin(a);

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', px.toFixed(2));
      circle.setAttribute('cy', py.toFixed(2));
      circle.setAttribute('r', '22');
      circle.setAttribute('stroke', 'rgba(255, 255, 255, 0.08)');
      circle.setAttribute('fill', 'none');
      mandalaRingsGroup.appendChild(circle);
    }
  }

  // ==========================================================================
  // 3. TIME CALCULATION & SMOOTH HAND ROTATION
  // ==========================================================================
  function updateClock() {
    const now = new Date();

    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();

    // Calculate rotation angles
    let secondDeg;
    if (isSmoothSweep) {
      // Continuous buttery smooth sweep (60/120fps)
      secondDeg = (seconds + milliseconds / 1000) * 6;
    } else {
      // Stepped quartz tick
      secondDeg = seconds * 6;
    }

    // Minute Hand (smooth continuous advance as seconds tick)
    const minuteDeg = (minutes + (seconds + milliseconds / 1000) / 60) * 6;

    // Hour Hand (smooth continuous advance as minutes tick: 360 deg / 12 hrs = 30 deg/hr)
    const hourDeg = ((hours % 12) + (minutes + seconds / 60) / 60) * 30;

    // Apply rotation transforms directly using hardware-accelerated CSS transforms and SVG attributes
    const hDeg = hourDeg.toFixed(3);
    const mDeg = minuteDeg.toFixed(3);
    const sDeg = secondDeg.toFixed(3);

    hourHandWrapper.style.transform = `rotate(${hDeg}deg)`;
    minuteHandWrapper.style.transform = `rotate(${mDeg}deg)`;
    secondHandWrapper.style.transform = `rotate(${sDeg}deg)`;

    // SVG standard attribute fallback (rotates around center 400, 400)
    hourHandWrapper.setAttribute('transform', `rotate(${hDeg} 400 400)`);
    minuteHandWrapper.setAttribute('transform', `rotate(${mDeg} 400 400)`);
    secondHandWrapper.setAttribute('transform', `rotate(${sDeg} 400 400)`);

    // Highlight current active hour numeral
    const currentHour12 = hours % 12 || 12;
    document.querySelectorAll('.clock-number').forEach((el) => {
      if (parseInt(el.getAttribute('data-hour'), 10) === currentHour12) {
        el.classList.add('active-hour');
      } else {
        el.classList.remove('active-hour');
      }
    });

    // Update Digital HUD Time Readout
    if (digitalTimeEl && digitalAmPmEl) {
      const displayHours = hours % 12 || 12;
      const pad = (n) => String(n).padStart(2, '0');
      const timeStr = `${pad(displayHours)}:${pad(minutes)}:${pad(seconds)}`;
      const ampm = hours >= 12 ? 'PM' : 'AM';

      digitalTimeEl.textContent = timeStr;
      digitalAmPmEl.textContent = ampm;
    }

    // Trigger Subtle Audio Tick / Web Chime if second changed
    if (seconds !== lastSecondInt) {
      lastSecondInt = seconds;
      if (isAudioEnabled) {
        playWebTick(seconds === 0);
      }
    }

    // Continue animation loop
    requestAnimationFrame(updateClock);
  }

  // ==========================================================================
  // 4. WEB AUDIO SYNTHESIZED TICK / SILK PLUCK
  // ==========================================================================
  function playWebTick(isMinuteChime = false) {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      audioCtx = new AudioContext();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    if (isMinuteChime) {
      // Soft crystalline silk harmonic for top of minute
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.exponentialRampToValueAtTime(1320, t + 0.15);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      filter.type = 'bandpass';
      filter.frequency.value = 1100;
      filter.Q.value = 4.0;
    } else {
      // Delicate arachnid silk tick
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, t);
      osc.frequency.exponentialRampToValueAtTime(400, t + 0.04);

      gain.gain.setValueAtTime(0.035, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);

      filter.type = 'highpass';
      filter.frequency.value = 800;
    }

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(t);
    osc.stop(t + (isMinuteChime ? 0.45 : 0.06));
  }

  // ==========================================================================
  // 5. INTERACTIVITY: WEB PLUCK & SILK RIPPLE
  // ==========================================================================
  function pluckWeb() {
    const webGroup = document.getElementById('webGroup');
    if (!webGroup) return;

    webGroup.classList.remove('web-plucked');
    // Force reflow
    void webGroup.offsetWidth;
    webGroup.classList.add('web-plucked');

    if (isAudioEnabled) {
      playSilkHarpChord();
    }

    setTimeout(() => {
      webGroup.classList.remove('web-plucked');
    }, 900);
  }

  function playSilkHarpChord() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();

    // Pluck 3 harmonic silk frequencies: pentatonic ethereal shimmer
    const notes = [440, 660, 880, 1100];
    notes.forEach((freq, idx) => {
      const t = audioCtx.currentTime + idx * 0.04;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.98, t + 0.6);

      gain.gain.setValueAtTime(0.05 / (idx + 1), t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(t);
      osc.stop(t + 0.65);
    });
  }

  // ==========================================================================
  // 6. ATMOSPHERIC PARTICLES (WARM SILK DUST MOTES)
  // ==========================================================================
  function initAmbientParticles() {
    if (!ambientCanvas) return;
    const ctx = ambientCanvas.getContext('2d');
    let width = (ambientCanvas.width = window.innerWidth);
    let height = (ambientCanvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = ambientCanvas.width = window.innerWidth;
      height = ambientCanvas.height = window.innerHeight;
    });

    const particles = [];
    const PARTICLE_COUNT = 32;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.8 + 0.6,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -Math.random() * 0.35 - 0.1,
        alpha: Math.random() * 0.5 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseVal: Math.random() * Math.PI,
      });
    }

    function renderParticles() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulseVal += p.pulseSpeed;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const dynamicAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulseVal));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 235, 205, ${dynamicAlpha.toFixed(3)})`;
        ctx.fill();
      });

      requestAnimationFrame(renderParticles);
    }

    requestAnimationFrame(renderParticles);
  }

  // ==========================================================================
  // 7. MOUSE PARALLAX & SPIDER AWARENESS
  // ==========================================================================
  function initMouseInteractions() {
    window.addEventListener('mousemove', (e) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;

      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const dx = (e.clientX - centerX) / centerX;
      const dy = (e.clientY - centerY) / centerY;

      // Subtle parallax tilt for the clock
      if (clockWrapper) {
        clockWrapper.style.transform = `perspective(1000px) rotateX(${(-dy * 2).toFixed(2)}deg) rotateY(${(dx * 2).toFixed(2)}deg)`;
      }

      // Spider eye pupil reflection shift
      const pupils = document.querySelectorAll('.eye-reflection');
      pupils.forEach((pupil) => {
        pupil.setAttribute('transform', `translate(${(dx * 0.7).toFixed(2)}, ${(dy * 0.7).toFixed(2)})`);
      });
    });

    window.addEventListener('mouseleave', () => {
      if (clockWrapper) {
        clockWrapper.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
      }
    });

    // Clicking the spider or clock stage plucks the web
    if (spiderBodyGroup) {
      spiderBodyGroup.addEventListener('click', (e) => {
        e.stopPropagation();
        pluckWeb();
      });
    }

    const clockSvg = document.getElementById('spiderClockSvg');
    if (clockSvg) {
      clockSvg.addEventListener('click', () => {
        pluckWeb();
      });
    }
  }

  // ==========================================================================
  // 8. HUD CONTROLS & LISTENERS
  // ==========================================================================
  function initControls() {
    // 1. Toggle Smooth / Stepped Sweep
    if (sweepToggleBtn) {
      sweepToggleBtn.addEventListener('click', () => {
        isSmoothSweep = !isSmoothSweep;
        sweepModeLabel.textContent = isSmoothSweep ? 'Smooth' : 'Stepped';
        sweepToggleBtn.classList.toggle('active', isSmoothSweep);
      });
      sweepToggleBtn.classList.add('active'); // smooth by default
    }

    // 2. Toggle Sound
    if (soundToggleBtn) {
      soundToggleBtn.addEventListener('click', () => {
        isAudioEnabled = !isAudioEnabled;
        soundLabel.textContent = isAudioEnabled ? 'Sound On' : 'Sound Off';
        soundToggleBtn.classList.toggle('active', isAudioEnabled);
        if (soundMuteSlash) {
          soundMuteSlash.style.display = isAudioEnabled ? 'none' : 'block';
        }
        if (isAudioEnabled) {
          playWebTick(true);
        }
      });
    }

    // 3. Pluck Web Button
    if (webPulseBtn) {
      webPulseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        pluckWeb();
      });
    }
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================
  function init() {
    initClockFace();
    initWebPattern();
    initControls();
    initMouseInteractions();
    initAmbientParticles();

    // Start real-time clock loop
    requestAnimationFrame(updateClock);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
