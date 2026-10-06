/**
 * SPIDER CLOCK - Master Animation & Interaction Script
 * Articulated white spider analog timepiece with real-time accuracy,
 * procedural catenary web, synthesized Web Audio, and 3D mouse parallax.
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
  const clockWrapper = document.getElementById('clockWrapper');
  const spiderBodyGroup = document.getElementById('spiderBodyGroup');
  const ambientCanvas = document.getElementById('ambientCanvas');
  const butterflyContainer = document.getElementById('butterflyContainer');
  const butterflyEl = document.getElementById('butterfly');
  const butterflyTrailCanvas = document.getElementById('butterflyTrailCanvas');
  const chameleonContainer = document.getElementById('chameleonContainer');
  const chameleonSvg = document.getElementById('chameleonSvg');
  const chamEyePrimary = document.getElementById('chamEyePrimary');
  const chamEyeSecondary = document.getElementById('chamEyeSecondary');
  const chamPupilPrimaryGroup = document.getElementById('chamPupilPrimaryGroup');
  const chamPupilSecondaryGroup = document.getElementById('chamPupilSecondaryGroup');
  const chamTongueGroup = document.getElementById('chamTongueGroup');
  const chamTonguePath = document.getElementById('chamTonguePath');
  const chamTongueTip = document.getElementById('chamTongueTip');
  const chamTongueTipPad = document.getElementById('chamTongueTipPad');
  const chamBeetleGroup = document.getElementById('chamBeetleGroup');
  const chamFireflyGroup = document.getElementById('chamFireflyGroup');
  const spidermanContainer = document.getElementById('spidermanContainer');
  const spidermanPendulum = document.getElementById('spidermanPendulum');
  const spidermanFigure = document.getElementById('spidermanFigure');
  const spideyLensLeft = document.getElementById('spideyLensLeft');
  const spideyLensRight = document.getElementById('spideyLensRight');

  // --- State ---
  let isSmoothSweep = true;
  let isAudioEnabled = false;
  let lastSecondInt = -1;
  let audioCtx = null;
  let mousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

  // --- Chameleon Autonomous Simulation State ---
  const chamState = {
    primaryPupil: { x: 0, y: 0 },
    secondaryPupil: { x: 0, y: 0 },
    saccadeTimer: 0,
    saccadeOffset: { x: 0, y: 0 },
    isTongueFlicking: false,
    tongueProgress: 0,
    tonguePhase: 'idle',
    tongueTargetLocal: { x: 244, y: 117 },
    autoFlickCountdown: 600 + Math.floor(Math.random() * 500),
    forcedFocusTarget: null,
    gazeTimer: 0,
    gazeChoice: 0,
  };

  // --- Butterfly Autonomous Simulation State ---
  const bfState = {
    x: 0,
    y: 0,
    vx: 1.2,
    vy: -0.8,
    heading: 45,
    speed: 2.2,
    minSpeed: 1.2,
    maxSpeed: 3.4,
    time: 0,
    orbitAngle: Math.random() * Math.PI * 2,
    startleTimer: 0,
    glideCycle: 0,
    isGliding: false,
    particles: [],
    maxParticles: 45,
  };

  // ==========================================================================
  // 1. PROCEDURAL CLOCK FACE: NUMERALS 1 TO 12 & SUBTLE DIAL TICKS
  // ==========================================================================
  function initClockFace() {
    // 1. Procedurally generate 12 numerals (1 to 12)
    for (let i = 1; i <= 12; i++) {
      // 12 is at top (-90 deg), 1 is at -60 deg, etc.
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

    // 2. Procedurally generate 60 minute & hour dial ticks
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
  // 2. PROCEDURAL WEB & MANDALA ROSETTE PATTERN
  // ==========================================================================
  function initWebPattern() {
    const spokes = WEB_SPOKES_COUNT;
    const spokeAngles = [];

    // 1. Procedurally generate 12 radial spokes aligning exactly with the hour marks
    for (let i = 0; i < spokes; i++) {
      const angleDeg = i * (360 / spokes) - 90;
      const angleRad = (angleDeg * Math.PI) / 180;
      spokeAngles.push(angleRad);

      const rStart = 28; // Clears the spider body
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

    // 2. Procedurally generate 6 concentric, sagging catenary web rings with dew drops
    const ringRadii = [48, 80, 118, 160, 205, 248];

    ringRadii.forEach((r, ringIdx) => {
      let pathData = '';
      const sagFactor = 0.94 - ringIdx * 0.012; // Natural silk tension sag towards center

      for (let s = 0; s < spokes; s++) {
        const nextS = (s + 1) % spokes;
        const a1 = spokeAngles[s];
        const a2 = spokeAngles[nextS];

        const x1 = CLOCK_CENTER + r * Math.cos(a1);
        const y1 = CLOCK_CENTER + r * Math.sin(a1);
        const x2 = CLOCK_CENTER + r * Math.cos(a2);
        const y2 = CLOCK_CENTER + r * Math.sin(a2);

        // Control point for the sagged catenary silk curve
        const midAngle = (a1 + a2) / 2 + (a2 < a1 ? Math.PI : 0);
        const rSag = r * sagFactor;
        const cx = CLOCK_CENTER + rSag * Math.cos(midAngle);
        const cy = CLOCK_CENTER + rSag * Math.sin(midAngle);

        if (s === 0) {
          pathData += `M ${x1.toFixed(2)} ${y1.toFixed(2)} `;
        }
        pathData += `Q ${cx.toFixed(2)} ${cy.toFixed(2)} ${x2.toFixed(2)} ${y2.toFixed(2)} `;

        // Morning dew drop accents at spoke-ring intersections
        const drop = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        drop.setAttribute('cx', x1.toFixed(2));
        drop.setAttribute('cy', y1.toFixed(2));
        const dropR = 1.6 + (ringIdx * 0.22) + (s % 3 === 0 ? 0.6 : 0);
        drop.setAttribute('r', dropR.toFixed(2));
        drop.setAttribute('fill', 'url(#dewDropGrad)');
        drop.setAttribute('filter', 'url(#glowSubtle)');
        dewDropsGroup.appendChild(drop);

        // Secondary small dew drops along the catenary arc on outer rings
        if (ringIdx >= 2 && s % 2 === 0) {
          const midDrop = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          midDrop.setAttribute('cx', cx.toFixed(2));
          midDrop.setAttribute('cy', cy.toFixed(2));
          midDrop.setAttribute('r', '1.2');
          midDrop.setAttribute('fill', 'url(#dewDropGrad)');
          dewDropsGroup.appendChild(midDrop);
        }
      }

      const webPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      webPath.setAttribute('d', pathData + 'Z');
      spiralStrandsGroup.appendChild(webPath);
    });

    // 3. Central Mandala Rosette Petals behind the spider
    const rosetteGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    rosetteGroup.setAttribute('class', 'mandala-rosette');

    // Sacred rosette petals intersecting around center
    for (let p = 0; p < 12; p++) {
      const angle = (p * 30 * Math.PI) / 180;
      const rPetal = 68;
      const px = CLOCK_CENTER + rPetal * Math.cos(angle);
      const py = CLOCK_CENTER + rPetal * Math.sin(angle);

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', px.toFixed(2));
      circle.setAttribute('cy', py.toFixed(2));
      circle.setAttribute('r', '38');
      circle.setAttribute('stroke', 'rgba(255, 255, 255, 0.12)');
      circle.setAttribute('fill', 'rgba(255, 255, 255, 0.015)');
      rosetteGroup.appendChild(circle);
    }

    // Delicate rosette petal curves radiating from center
    for (let p = 0; p < 12; p++) {
      const a = (p * 30 * Math.PI) / 180;
      const petalLen = 82;
      const xEnd = CLOCK_CENTER + petalLen * Math.cos(a);
      const yEnd = CLOCK_CENTER + petalLen * Math.sin(a);
      const cxMid = CLOCK_CENTER + (petalLen * 0.55) * Math.cos(a + 0.26);
      const cyMid = CLOCK_CENTER + (petalLen * 0.55) * Math.sin(a + 0.26);

      const petalPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      petalPath.setAttribute(
        'd',
        `M ${CLOCK_CENTER} ${CLOCK_CENTER} Q ${cxMid.toFixed(2)} ${cyMid.toFixed(2)} ${xEnd.toFixed(2)} ${yEnd.toFixed(2)}`
      );
      petalPath.setAttribute('stroke', 'rgba(255, 255, 255, 0.18)');
      petalPath.setAttribute('stroke-width', '1.1');
      petalPath.setAttribute('fill', 'none');
      rosetteGroup.appendChild(petalPath);
    }

    mandalaRingsGroup.appendChild(rosetteGroup);
  }

  // ==========================================================================
  // 3. CONTINUOUS ANALOG TIME UPDATE & SMOOTH HAND SWEEP
  // ==========================================================================
  function updateClock() {
    const now = new Date();

    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const ms = now.getMilliseconds();

    // Calculate rotation angles
    let secondDeg;
    if (isSmoothSweep) {
      // Continuous buttery-smooth analog sweep with millisecond precision
      secondDeg = (seconds + ms / 1000) * 6;
    } else {
      // Stepped discrete quartz tick
      secondDeg = seconds * 6;
    }

    // Minute Hand (smooth advance as seconds tick)
    const minuteDeg = (minutes + (seconds + ms / 1000) / 60) * 6;

    // Hour Hand (smooth advance as minutes tick: 360 deg / 12 hrs = 30 deg/hr)
    const hourDeg = ((hours % 12) + (minutes + seconds / 60) / 60) * 30;

    const hDeg = hourDeg.toFixed(3);
    const mDeg = minuteDeg.toFixed(3);
    const sDeg = secondDeg.toFixed(3);

    // Apply hardware-accelerated CSS transform and SVG presentation attribute for 100% precision
    hourHandWrapper.style.transform = `rotate(${hDeg}deg)`;
    minuteHandWrapper.style.transform = `rotate(${mDeg}deg)`;
    secondHandWrapper.style.transform = `rotate(${sDeg}deg)`;

    hourHandWrapper.setAttribute('transform', `rotate(${hDeg} 400 400)`);
    minuteHandWrapper.setAttribute('transform', `rotate(${mDeg} 400 400)`);
    secondHandWrapper.setAttribute('transform', `rotate(${sDeg} 400 400)`);

    // Highlight active current hour numeral
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

    // Trigger Synthesized Web Audio Silk Tick on Second Change
    if (seconds !== lastSecondInt) {
      lastSecondInt = seconds;
      if (isAudioEnabled) {
        playWebTick(seconds === 0);
      }
    }

    // Update Butterfly flight path and particles
    updateButterfly();

    // Update Chameleon independent eye tracking, tongue flick, and camouflage
    updateChameleon();

    // Continue high-precision animation loop
    requestAnimationFrame(updateClock);
  }

  // ==========================================================================
  // 4. SYNTHESIZED WEB AUDIO (CRUCIAL: NO EXTERNAL AUDIO FILES)
  // ==========================================================================
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // Delicate silk tick pulse matching the seconds
  function playWebTick(isMinuteChime = false) {
    const ctx = getAudioContext();
    if (!ctx) return;

    const t = ctx.currentTime;

    if (isMinuteChime) {
      // Crystalline silk bell chime on the minute
      const freqs = [1046.5, 1318.5, 1567.98]; // C6, E6, G6
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.04);

        gain.gain.setValueAtTime(0.045, t + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.04 + 0.7);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t + idx * 0.04);
        osc.stop(t + idx * 0.04 + 0.75);
      });
    } else {
      // Delicate gossamer arachnid silk tick pulse
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      // Rapid pitch drop mimicking silk filament snapping lightly under tension
      osc.frequency.setValueAtTime(2400, t);
      osc.frequency.exponentialRampToValueAtTime(650, t + 0.024);

      gain.gain.setValueAtTime(0.038, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);

      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1200, t);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.04);
    }
  }

  // Crisp synthesized biological chameleon tongue flick whip-snap
  function playTongueFlickSound() {
    const ctx = getAudioContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1450, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.045);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1600, t);
    filter.Q.setValueAtTime(4.0, t);

    gain.gain.setValueAtTime(0.045, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.06);
  }

  // Crisp synthesized delicate chitin scuttle / tap sound for the Jewel Beetle
  function playBeetleScuttleSound() {
    const ctx = getAudioContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    [0, 0.024, 0.052].forEach((offset, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1800 + idx * 420, t + offset);
      osc.frequency.exponentialRampToValueAtTime(450, t + offset + 0.022);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2200, t + offset);
      filter.Q.setValueAtTime(3.8, t + offset);

      gain.gain.setValueAtTime(0.026, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + offset + 0.024);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t + offset);
      osc.stop(t + offset + 0.028);
    });
  }

  // Luminous gossamer firefly hover flutter / fairy chime sound
  function playFireflyBuzzSound() {
    const ctx = getAudioContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1174.66, t); // D6
    osc.frequency.exponentialRampToValueAtTime(1760.0, t + 0.08); // A6
    osc.frequency.exponentialRampToValueAtTime(2349.32, t + 0.16); // D7

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, t);
    filter.Q.setValueAtTime(4.8, t);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.038, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.24);
  }

  // Multi-harmonic harp pluck chord triggered when user interacts with web or clicks 'Pluck Web'
  function playSilkHarpChord() {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Ethereal silk pentatonic harp chord (F#4, A4, C#5, E5, F#5)
    const chordNotes = [369.99, 440.00, 554.37, 659.25, 739.99];
    const now = ctx.currentTime;

    chordNotes.forEach((freq, idx) => {
      const noteTime = now + idx * 0.036; // Gentle harp arpeggio stagger

      // Fundamental string oscillator
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.995, noteTime + 1.2);

      // Shimmering overtone
      const overtone = ctx.createOscillator();
      overtone.type = 'sine';
      overtone.frequency.setValueAtTime(freq * 2, noteTime);

      // Acoustic silk resonance filter
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3400, noteTime);
      filter.frequency.exponentialRampToValueAtTime(750, noteTime + 0.85);
      filter.Q.setValueAtTime(3.8, noteTime);

      // Envelope with sharp acoustic pluck transient and resonant decay
      const gain = ctx.createGain();
      const noteAmp = 0.068 / (1 + idx * 0.22);
      gain.gain.setValueAtTime(0.0001, noteTime);
      gain.gain.linearRampToValueAtTime(noteAmp, noteTime + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 1.35);

      osc.connect(filter);
      overtone.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteTime);
      overtone.start(noteTime);
      osc.stop(noteTime + 1.4);
      overtone.stop(noteTime + 1.4);
    });
  }

  // Crisp synthesized web-thwip / zip sound effect for Spider-Man entrances & interactions
  function playWebThwipSound() {
    const ctx = getAudioContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(3200, t);
    osc.frequency.exponentialRampToValueAtTime(380, t + 0.08);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2600, t);
    filter.frequency.exponentialRampToValueAtTime(800, t + 0.08);
    filter.Q.setValueAtTime(3.5, t);

    gain.gain.setValueAtTime(0.045, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  // ==========================================================================
  // 5. INTERACTIVITY: WEB PLUCK & SILK RIPPLE
  // ==========================================================================
  function pluckWeb() {
    const webGroup = document.getElementById('webGroup');
    if (!webGroup) return;

    webGroup.classList.remove('web-plucked');
    // Force DOM reflow to restart CSS animation
    void webGroup.offsetWidth;
    webGroup.classList.add('web-plucked');

    if (isAudioEnabled) {
      playSilkHarpChord();
    }

    setTimeout(() => {
      webGroup.classList.remove('web-plucked');
    }, 900);
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
    const PARTICLE_COUNT = 36;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.8 + 0.6,
        vx: (Math.random() - 0.5) * 0.22,
        vy: -Math.random() * 0.32 - 0.1,
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
        ctx.fillStyle = `rgba(224, 242, 254, ${dynamicAlpha.toFixed(3)})`;
        ctx.fill();
      });

      requestAnimationFrame(renderParticles);
    }

    requestAnimationFrame(renderParticles);
  }

  // ==========================================================================
  // 7. INTERACTIVE 3D PARALLAX & SPIDER PUPIL TRACKING
  // ==========================================================================
  function initMouseInteractions() {
    window.addEventListener('mousemove', (e) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;

      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const dx = (e.clientX - centerX) / centerX; // -1 to 1
      const dy = (e.clientY - centerY) / centerY; // -1 to 1

      // Subtle 3D perspective tilt on clock wrapper
      if (clockWrapper) {
        const tiltX = (-dy * 4.2).toFixed(2);
        const tiltY = (dx * 4.2).toFixed(2);
        clockWrapper.style.transform = `perspective(1200px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
      }

      // Dynamic Spider Pupil Tracking: follows mouse cursor across the screen
      const pupils = document.querySelectorAll('.spider-pupil');
      const highlights = document.querySelectorAll('.spider-pupil-highlight');
      const secondaryPupils = document.querySelectorAll('.secondary-pupil');

      const pupilShiftX = (dx * 1.5).toFixed(2);
      const pupilShiftY = (dy * 1.5).toFixed(2);

      pupils.forEach((p) => {
        p.setAttribute('transform', `translate(${pupilShiftX}, ${pupilShiftY})`);
      });

      highlights.forEach((h) => {
        h.setAttribute('transform', `translate(${(dx * 0.9).toFixed(2)}, ${(dy * 0.9).toFixed(2)})`);
      });

      secondaryPupils.forEach((sp) => {
        sp.setAttribute('transform', `translate(${(dx * 0.75).toFixed(2)}, ${(dy * 0.75).toFixed(2)})`);
      });
    });

    window.addEventListener('mouseleave', () => {
      if (clockWrapper) {
        clockWrapper.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)';
      }
      document.querySelectorAll('.spider-pupil, .spider-pupil-highlight, .secondary-pupil').forEach((el) => {
        el.setAttribute('transform', 'translate(0, 0)');
      });
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
  // 8. FLOATING HUD CONTROLS & LISTENERS
  // ==========================================================================
  function initControls() {
    // 1. Smooth vs. Stepped Sweep Toggle
    if (sweepToggleBtn) {
      sweepToggleBtn.addEventListener('click', () => {
        isSmoothSweep = !isSmoothSweep;
        sweepModeLabel.textContent = isSmoothSweep ? 'Smooth' : 'Stepped';
        sweepToggleBtn.classList.toggle('active', isSmoothSweep);
      });
      sweepToggleBtn.classList.add('active'); // Smooth sweep active by default
    }

    // 2. Ambient Web Audio Silk Tick / Chime Toggle
    if (soundToggleBtn) {
      soundToggleBtn.addEventListener('click', () => {
        isAudioEnabled = !isAudioEnabled;
        soundLabel.textContent = isAudioEnabled ? 'Sound On' : 'Sound Off';
        soundToggleBtn.classList.toggle('active', isAudioEnabled);

        if (soundMuteSlash) {
          soundMuteSlash.style.display = isAudioEnabled ? 'none' : 'block';
        }

        if (isAudioEnabled) {
          getAudioContext();
          playWebTick(true); // Play pleasant confirmation bell
        }
      });
    }

    // 3. Interactive 'Pluck Web' Button
    if (webPulseBtn) {
      webPulseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        getAudioContext();
        pluckWeb();
      });
    }
  }

  // ==========================================================================
  // 9. LUMINOUS 3D BUTTERFLY AUTONOMOUS FLIGHT & STEERING DYNAMICS
  // ==========================================================================
  function initButterfly() {
    if (!butterflyContainer || !butterflyEl) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const cx = w / 2;
    const cy = h / 2;
    const clockRadius = Math.min(w, h) * 0.43;

    // Initialize position in outer catenary web region
    bfState.x = cx + clockRadius * 0.58;
    bfState.y = cy - clockRadius * 0.42;
    bfState.orbitAngle = Math.atan2(bfState.y - cy, bfState.x - cx);

    // Setup stardust trail canvas
    if (butterflyTrailCanvas) {
      butterflyTrailCanvas.width = window.innerWidth;
      butterflyTrailCanvas.height = window.innerHeight;
      window.addEventListener('resize', () => {
        butterflyTrailCanvas.width = window.innerWidth;
        butterflyTrailCanvas.height = window.innerHeight;
      });
    }

    // Interactive startle when clicking near butterfly
    window.addEventListener('click', (e) => {
      const dist = Math.hypot(e.clientX - bfState.x, e.clientY - bfState.y);
      if (dist < 120) {
        // Playful startle dart away from click
        const awayAngle = Math.atan2(bfState.y - e.clientY, bfState.x - e.clientX);
        bfState.vx += Math.cos(awayAngle) * 4.2;
        bfState.vy += Math.sin(awayAngle) * 4.2;
        bfState.startleTimer = 40;
        spawnSparkles(bfState.x, bfState.y, 8);
      }
    });
  }

  // Spawn glowing stardust particles behind butterfly
  function spawnSparkles(x, y, count = 1) {
    for (let i = 0; i < count; i++) {
      if (bfState.particles.length >= bfState.maxParticles) {
        bfState.particles.shift();
      }
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 0.75 + 0.2;
      bfState.particles.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed + 0.32, // Gentle downward drift
        size: Math.random() * 2.2 + 0.8,
        alpha: 1.0,
        decay: Math.random() * 0.02 + 0.016,
        twinkleSpeed: Math.random() * 0.15 + 0.05,
        twinkle: Math.random() * Math.PI,
      });
    }
  }

  // Render and update stardust trail on canvas
  function renderButterflyTrail() {
    if (!butterflyTrailCanvas) return;
    const ctx = butterflyTrailCanvas.getContext('2d');
    const w = butterflyTrailCanvas.width;
    const h = butterflyTrailCanvas.height;

    ctx.clearRect(0, 0, w, h);

    for (let i = bfState.particles.length - 1; i >= 0; i--) {
      const p = bfState.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      p.twinkle += p.twinkleSpeed;

      if (p.alpha <= 0) {
        bfState.particles.splice(i, 1);
        continue;
      }

      const currentAlpha = Math.max(0, p.alpha * (0.7 + 0.3 * Math.sin(p.twinkle)));
      const currentRadius = p.size * (0.5 + 0.5 * p.alpha);

      // Luminous cyan outer glow
      ctx.beginPath();
      ctx.arc(p.x, p.y, currentRadius * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 240, 255, ${(currentAlpha * 0.35).toFixed(3)})`;
      ctx.fill();

      // Bright core stardust mote
      ctx.beginPath();
      ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(224, 247, 255, ${(currentAlpha * 0.9).toFixed(3)})`;
      ctx.fill();
    }
  }

  // Update butterfly flight physics, steering forces, and 3D transforms
  function updateButterfly() {
    if (!butterflyContainer || !butterflyEl) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const cx = w / 2;
    const cy = h / 2;
    const clockRadius = Math.min(w, h) * 0.43;

    bfState.time += 0.024;

    let accX = 0;
    let accY = 0;

    // 1. Casual Orbit along outer catenary web rings (undulating breathing radius)
    bfState.orbitAngle += 0.0075;
    const webOuterR = clockRadius * (0.62 + 0.16 * Math.sin(bfState.time * 0.5) + 0.07 * Math.cos(bfState.time * 1.1));
    const orbitTargetX = cx + webOuterR * Math.cos(bfState.orbitAngle);
    const orbitTargetY = cy + (webOuterR * 0.92) * Math.sin(bfState.orbitAngle * 1.15);

    let finalTargetX = orbitTargetX;
    let finalTargetY = orbitTargetY;

    // 2. Loose attraction to user mouse cursor (curious orbiting halo around cursor)
    if (mousePos) {
      const mouseDist = Math.hypot(mousePos.x - bfState.x, mousePos.y - bfState.y);

      if (mouseDist < 48) {
        // Startle response if cursor rushes directly at butterfly
        const startleAngle = Math.atan2(bfState.y - mousePos.y, bfState.x - mousePos.x);
        accX += Math.cos(startleAngle) * 3.2;
        accY += Math.sin(startleAngle) * 3.2;
        bfState.startleTimer = 30;
        spawnSparkles(bfState.x, bfState.y, 2);
      } else if (mouseDist < 420) {
        // Curious orbiting halo around cursor
        const haloAngle = bfState.time * 1.4;
        const haloDist = 110 + 35 * Math.sin(bfState.time * 1.8);
        const mouseHaloX = mousePos.x + Math.cos(haloAngle) * haloDist;
        const mouseHaloY = mousePos.y + Math.sin(haloAngle) * haloDist;

        // Smooth blending: stronger when closer to mouse, blending with web orbit
        const mouseWeight = Math.max(0, 1 - mouseDist / 420) * 0.55;
        finalTargetX = orbitTargetX * (1 - mouseWeight) + mouseHaloX * mouseWeight;
        finalTargetY = orbitTargetY * (1 - mouseWeight) + mouseHaloY * mouseWeight;
      }
    }

    // 3. Smooth steering acceleration towards final target
    const toTargetX = finalTargetX - bfState.x;
    const toTargetY = finalTargetY - bfState.y;
    const distToTarget = Math.hypot(toTargetX, toTargetY);

    if (distToTarget > 1) {
      const desiredSpeed = Math.min(bfState.maxSpeed, Math.max(bfState.minSpeed, distToTarget * 0.035));
      const desiredVx = (toTargetX / distToTarget) * desiredSpeed;
      const desiredVy = (toTargetY / distToTarget) * desiredSpeed;

      accX += (desiredVx - bfState.vx) * 0.04;
      accY += (desiredVy - bfState.vy) * 0.04;
    }

    // 4. Critical Clearance: Soft Repulsion from Spider Center & Clock Hands
    const distFromCenter = Math.hypot(bfState.x - cx, bfState.y - cy);
    const spiderSafeRadius = Math.max(130, clockRadius * 0.32);

    if (distFromCenter < spiderSafeRadius) {
      const pushFactor = ((spiderSafeRadius - distFromCenter) / spiderSafeRadius) * 2.8;
      const pushAngle = Math.atan2(bfState.y - cy, bfState.x - cx);
      accX += Math.cos(pushAngle) * pushFactor;
      accY += Math.sin(pushAngle) * pushFactor;
    }

    // 5. Boundary avoidance: steer gently away from screen borders
    const margin = 70;
    if (bfState.x < margin) accX += (margin - bfState.x) * 0.05;
    if (bfState.x > w - margin) accX -= (bfState.x - (w - margin)) * 0.05;
    if (bfState.y < margin) accY += (margin - bfState.y) * 0.05;
    if (bfState.y > h - margin) accY -= (bfState.y - (h - margin)) * 0.05;

    // 6. Wing-Beat Turbulence & Micro-Bobbing (realistic light biological flight)
    const headingRad = Math.atan2(bfState.vy, bfState.vx);
    const perpRad = headingRad + Math.PI / 2;
    const bobbing = Math.sin(bfState.time * 15) * (bfState.isGliding ? 0.06 : 0.45);
    accX += Math.cos(perpRad) * bobbing * 0.16;
    accY += Math.sin(perpRad) * bobbing * 0.16;

    // 7. Velocity Update & Speed Clamping
    bfState.vx += accX;
    bfState.vy += accY;

    const currentSpeed = Math.hypot(bfState.vx, bfState.vy);
    const maxLimit = bfState.startleTimer > 0 ? 5.0 : bfState.maxSpeed;

    if (currentSpeed > maxLimit) {
      bfState.vx = (bfState.vx / currentSpeed) * maxLimit;
      bfState.vy = (bfState.vy / currentSpeed) * maxLimit;
    } else if (currentSpeed < bfState.minSpeed) {
      bfState.vx = (bfState.vx / currentSpeed) * bfState.minSpeed;
      bfState.vy = (bfState.vy / currentSpeed) * bfState.minSpeed;
    }

    bfState.x += bfState.vx;
    bfState.y += bfState.vy;

    // 8. Orientation: Rotate to face flight direction (with smooth angle interpolation)
    const targetHeading = Math.atan2(bfState.vy, bfState.vx) * (180 / Math.PI) + 90;
    let angleDiff = (targetHeading - bfState.heading) % 360;
    if (angleDiff > 180) angleDiff -= 360;
    if (angleDiff < -180) angleDiff += 360;
    bfState.heading += angleDiff * 0.11;

    // Dynamic 3D Bank Angle (rolls into turns)
    const bankAngle = Math.max(-28, Math.min(28, angleDiff * 1.5));

    // 9. Gliding vs Fluttering State Management
    if (bfState.startleTimer > 0) {
      bfState.startleTimer--;
      bfState.isGliding = false;
      butterflyContainer.classList.add('fast-flutter');
      butterflyContainer.classList.remove('gliding');
    } else {
      butterflyContainer.classList.remove('fast-flutter');
      bfState.glideCycle = (bfState.glideCycle + 1) % 360;
      if (bfState.glideCycle > 280 && Math.abs(angleDiff) < 6) {
        bfState.isGliding = true;
        butterflyContainer.classList.add('gliding');
      } else {
        bfState.isGliding = false;
        butterflyContainer.classList.remove('gliding');
      }
    }

    // 10. Apply Hardware-Accelerated 3D Transforms
    butterflyContainer.style.transform = `translate3d(${bfState.x.toFixed(2)}px, ${bfState.y.toFixed(2)}px, 0) rotate(${bfState.heading.toFixed(2)}deg)`;
    butterflyEl.style.transform = `rotateY(${bankAngle.toFixed(2)}deg)`;

    // 11. Stardust Sparkle Trail Emission
    if (Math.random() < (bfState.isGliding ? 0.35 : 0.75)) {
      spawnSparkles(bfState.x, bfState.y, 1);
    }
    renderButterflyTrail();
  }

  // ==========================================================================
  // 10. ANIMATED CHAMELEON & MINOR INSECTS: DUAL EYE TRACKING, TONGUE FLICK & ECOSYSTEM
  // ==========================================================================
  function initChameleon() {
    if (!chameleonContainer) return;

    // Direct click on chameleon triggers an alert tongue flick & instant color ripple
    chameleonContainer.addEventListener('click', (e) => {
      e.stopPropagation();
      getAudioContext();

      // Quick elastic tongue strike towards cursor position
      triggerTongueFlick(e.clientX, e.clientY);

      // Color flash reaction
      chameleonContainer.classList.add('color-ripple');
      setTimeout(() => {
        chameleonContainer.classList.remove('color-ripple');
      }, 700);
    });

    // --- Interactive Minor Insect 1: Jewel Beetle on Perch Branch ---
    if (chamBeetleGroup) {
      chamBeetleGroup.addEventListener('click', (e) => {
        e.stopPropagation();
        getAudioContext();
        triggerBeetleReaction();
      });

      chamBeetleGroup.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          getAudioContext();
          triggerBeetleReaction();
        }
      });
    }

    // --- Interactive Minor Insect 2: Gossamer Hovering Firefly ---
    if (chamFireflyGroup) {
      chamFireflyGroup.addEventListener('click', (e) => {
        e.stopPropagation();
        getAudioContext();
        triggerFireflyReaction();
      });

      chamFireflyGroup.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          getAudioContext();
          triggerFireflyReaction();
        }
      });
    }
  }

  // Trigger startled scuttle and chameleon response for the Jewel Beetle
  function triggerBeetleReaction() {
    if (!chamBeetleGroup) return;

    // Beetle startled response: elytra pop open & scuttle
    chamBeetleGroup.classList.remove('beetle-startled');
    void chamBeetleGroup.offsetWidth; // Force CSS reflow
    chamBeetleGroup.classList.add('beetle-startled');
    setTimeout(() => {
      chamBeetleGroup.classList.remove('beetle-startled');
    }, 850);

    if (isAudioEnabled) {
      playBeetleScuttleSound();
    }

    // Direct chameleon's primary turret eye to stare at the beetle
    chamState.forcedFocusTarget = { type: 'beetle', duration: 75 };

    // Chameleon snaps its tongue towards the beetle perched on the branch!
    triggerTongueFlickLocal(280, 140);
  }

  // Trigger evasive hover dodge and chameleon response for the Firefly
  function triggerFireflyReaction() {
    if (!chamFireflyGroup) return;

    // Firefly evasive loop dodge
    chamFireflyGroup.classList.remove('firefly-startled');
    void chamFireflyGroup.offsetWidth; // Force CSS reflow
    chamFireflyGroup.classList.add('firefly-startled');
    setTimeout(() => {
      chamFireflyGroup.classList.remove('firefly-startled');
    }, 650);

    // Emit luminous bioluminescent sparkle motes
    const rect = chamFireflyGroup.getBoundingClientRect();
    spawnSparkles(rect.left + rect.width / 2, rect.top + rect.height / 2, 5);

    if (isAudioEnabled) {
      playFireflyBuzzSound();
    }

    // Direct chameleon's primary turret eye to stare at the hovering firefly
    chamState.forcedFocusTarget = { type: 'firefly', duration: 75 };

    // Chameleon snaps its tongue towards the hovering firefly!
    triggerTongueFlickLocal(270, 78);
  }

  // Trigger tongue strike directly to local SVG coordinate space (e.g. towards insects)
  function triggerTongueFlickLocal(localX, localY) {
    if (chamState.isTongueFlicking || !chameleonSvg || !chamTongueGroup) return;

    const mouthX = 244;
    const mouthY = 117;
    const dx = localX - mouthX;
    const dy = localY - mouthY;
    const dist = Math.hypot(dx, dy);
    const maxReach = 560;

    if (dist > maxReach) {
      localX = mouthX + (dx / dist) * maxReach;
      localY = mouthY + (dy / dist) * maxReach;
    }

    chamState.tongueTargetLocal = { x: localX, y: localY };
    chamState.isTongueFlicking = true;
    chamState.tongueProgress = 0;
    chamState.tonguePhase = 'extending';
    chamTongueGroup.style.opacity = '1';

    if (isAudioEnabled) {
      playTongueFlickSound();
    }
  }

  // Trigger chameleon tongue strike towards a target screen position
  function triggerTongueFlick(targetScreenX, targetScreenY) {
    if (chamState.isTongueFlicking || !chameleonSvg || !chamTongueGroup) return;

    let localX = 350;
    let localY = 50;

    try {
      const ctm = chameleonSvg.getScreenCTM();
      if (ctm) {
        const pt = chameleonSvg.createSVGPoint();
        pt.x = targetScreenX !== undefined ? targetScreenX : mousePos.x;
        pt.y = targetScreenY !== undefined ? targetScreenY : mousePos.y;
        const localPt = pt.matrixTransform(ctm.inverse());
        localX = localPt.x;
        localY = localPt.y;
      }
    } catch (err) {
      localX = 320;
      localY = 60;
    }

    triggerTongueFlickLocal(localX, localY);
  }

  // Main chameleon update loop: runs every frame via updateClock
  function updateChameleon() {
    if (!chameleonContainer || !chameleonSvg) return;

    // 1. DUAL INDEPENDENT REPTILIAN EYE TRACKING
    // Screen position of the primary conical turret eye
    const primaryRect = chamEyePrimary ? chamEyePrimary.getBoundingClientRect() : null;
    const eyePx = primaryRect ? primaryRect.left + primaryRect.width / 2 : window.innerWidth * 0.15;
    const eyePy = primaryRect ? primaryRect.top + primaryRect.height / 2 : window.innerHeight * 0.85;

    // Vectors to Butterfly and User Mouse Cursor
    const dxBf = bfState.x - eyePx;
    const dyBf = bfState.y - eyePy;
    const distBf = Math.hypot(dxBf, dyBf);

    const dxMouse = mousePos.x - eyePx;
    const dyMouse = mousePos.y - eyePy;
    const distMouse = Math.hypot(dxMouse, dyMouse);

    // Screen positions and relative vectors to Minor Insects
    const fireflyRect = chamFireflyGroup ? chamFireflyGroup.getBoundingClientRect() : null;
    const beetleRect = chamBeetleGroup ? chamBeetleGroup.getBoundingClientRect() : null;

    const dxFf = fireflyRect ? (fireflyRect.left + fireflyRect.width / 2) - eyePx : 68;
    const dyFf = fireflyRect ? (fireflyRect.top + fireflyRect.height / 2) - eyePy : -38;

    const dxBt = beetleRect ? (beetleRect.left + beetleRect.width / 2) - eyePx : 78;
    const dyBt = beetleRect ? (beetleRect.top + beetleRect.height / 2) - eyePy : 32;

    // Dynamic focus selection:
    let primaryTargetX = dxBf;
    let primaryTargetY = dyBf;
    let secTargetX = dxMouse;
    let secTargetY = dyMouse;

    // Override primary target if actively interacting with one of the minor insects
    if (chamState.forcedFocusTarget && chamState.forcedFocusTarget.duration > 0) {
      chamState.forcedFocusTarget.duration--;
      if (chamState.forcedFocusTarget.type === 'beetle') {
        primaryTargetX = dxBt;
        primaryTargetY = dyBt;
      } else if (chamState.forcedFocusTarget.type === 'firefly') {
        primaryTargetX = dxFf;
        primaryTargetY = dyFf;
      }
    } else if (distMouse < 340) {
      primaryTargetX = dxMouse;
      primaryTargetY = dyMouse;
      secTargetX = dxBf;
      secTargetY = dyBf;
    }

    // Secondary eye autonomous glancing cycle (inquires hovering firefly or crawling beetle)
    chamState.gazeTimer = (chamState.gazeTimer || 0) + 1;
    if (chamState.gazeTimer > 180 + Math.random() * 80) {
      chamState.gazeTimer = 0;
      chamState.gazeChoice = Math.random();
    }

    if (!chamState.forcedFocusTarget || chamState.forcedFocusTarget.duration <= 0) {
      if (chamState.gazeChoice < 0.38) {
        // Glances at the hovering firefly
        secTargetX = dxFf;
        secTargetY = dyFf;
      } else if (chamState.gazeChoice < 0.72) {
        // Glances at the jewel beetle on branch
        secTargetX = dxBt;
        secTargetY = dyBt;
      }
    }

    // Micro-saccades (authentic sudden glance shifts of reptiles)
    chamState.saccadeTimer++;
    if (chamState.saccadeTimer > 100 + Math.random() * 80) {
      chamState.saccadeTimer = 0;
      chamState.saccadeOffset = {
        x: (Math.random() - 0.5) * 0.8,
        y: (Math.random() - 0.5) * 0.8,
      };
    }

    // Primary Conical Turret Eye calculation
    const primAngle = Math.atan2(primaryTargetY, primaryTargetX);
    const primMaxShift = 3.2;
    const primDesiredX = Math.cos(primAngle) * primMaxShift + chamState.saccadeOffset.x;
    const primDesiredY = Math.sin(primAngle) * primMaxShift + chamState.saccadeOffset.y;

    chamState.primaryPupil.x += (primDesiredX - chamState.primaryPupil.x) * 0.14;
    chamState.primaryPupil.y += (primDesiredY - chamState.primaryPupil.y) * 0.14;

    if (chamPupilPrimaryGroup) {
      chamPupilPrimaryGroup.setAttribute(
        'transform',
        `translate(${chamState.primaryPupil.x.toFixed(2)}, ${chamState.primaryPupil.y.toFixed(2)})`
      );
    }

    // Secondary Distal Eye calculation (independent swiveling movement)
    const secAngle = Math.atan2(secTargetY, secTargetX);
    const secMaxShift = 1.9;
    const secDesiredX = Math.cos(secAngle) * secMaxShift;
    const secDesiredY = Math.sin(secAngle) * secMaxShift;

    chamState.secondaryPupil.x += (secDesiredX - chamState.secondaryPupil.x) * 0.1;
    chamState.secondaryPupil.y += (secDesiredY - chamState.secondaryPupil.y) * 0.1;

    if (chamPupilSecondaryGroup) {
      chamPupilSecondaryGroup.setAttribute(
        'transform',
        `translate(${chamState.secondaryPupil.x.toFixed(2)}, ${chamState.secondaryPupil.y.toFixed(2)})`
      );
    }

    // 2. TONGUE FLICK ANIMATION DYNAMICS
    if (chamState.isTongueFlicking) {
      const mouthX = 244;
      const mouthY = 117;
      const tgt = chamState.tongueTargetLocal;

      if (chamState.tonguePhase === 'extending') {
        chamState.tongueProgress += 0.22; // High-velocity strike (~5 frames)
        if (chamState.tongueProgress >= 1) {
          chamState.tongueProgress = 1;
          chamState.tonguePhase = 'retracting';

          // Reactive evasive dodges when tongue reaches apex:
          // Check proximity to Firefly (local ~270, 78)
          if (Math.hypot(tgt.x - 270, tgt.y - 78) < 42 && chamFireflyGroup) {
            chamFireflyGroup.classList.remove('firefly-startled');
            void chamFireflyGroup.offsetWidth;
            chamFireflyGroup.classList.add('firefly-startled');
            if (fireflyRect) {
              spawnSparkles(fireflyRect.left + fireflyRect.width / 2, fireflyRect.top + fireflyRect.height / 2, 4);
            }
          }

          // Check proximity to Beetle (local ~280, 140)
          if (Math.hypot(tgt.x - 280, tgt.y - 140) < 42 && chamBeetleGroup) {
            chamBeetleGroup.classList.remove('beetle-startled');
            void chamBeetleGroup.offsetWidth;
            chamBeetleGroup.classList.add('beetle-startled');
          }

          // Check proximity to Butterfly
          if (distBf < 320) {
            bfState.startleTimer = 38;
            bfState.vx += (Math.random() - 0.5) * 4;
            bfState.vy -= 3.8;
            spawnSparkles(bfState.x, bfState.y, 6);
          }
        }
      } else if (chamState.tonguePhase === 'retracting') {
        chamState.tongueProgress -= 0.15; // Elastic snapback
        if (chamState.tongueProgress <= 0) {
          chamState.tongueProgress = 0;
          chamState.tonguePhase = 'idle';
          chamState.isTongueFlicking = false;
          if (chamTongueGroup) chamTongueGroup.style.opacity = '0';
        }
      }

      const p = chamState.tongueProgress;
      // Slight arc control point for biological spring curvature
      const currTipX = mouthX + (tgt.x - mouthX) * p;
      const currTipY = mouthY + (tgt.y - mouthY) * p;
      const midX = (mouthX + currTipX) / 2 + (tgt.y < mouthY ? -12 : 12) * p;
      const midY = (mouthY + currTipY) / 2 - 18 * p;

      if (chamTonguePath) {
        chamTonguePath.setAttribute('d', `M ${mouthX} ${mouthY} Q ${midX.toFixed(1)} ${midY.toFixed(1)} ${currTipX.toFixed(1)} ${currTipY.toFixed(1)}`);
      }
      if (chamTongueTip) {
        chamTongueTip.setAttribute('cx', currTipX.toFixed(1));
        chamTongueTip.setAttribute('cy', currTipY.toFixed(1));
      }
      if (chamTongueTipPad) {
        chamTongueTipPad.setAttribute('cx', currTipX.toFixed(1));
        chamTongueTipPad.setAttribute('cy', currTipY.toFixed(1));
      }
    } else {
      // Occasional autonomous tongue flick animation
      chamState.autoFlickCountdown--;
      if (chamState.autoFlickCountdown <= 0) {
        chamState.autoFlickCountdown = 750 + Math.floor(Math.random() * 650); // 12-24 seconds
        const roll = Math.random();

        if (roll < 0.32) {
          // Playful snap at the hovering firefly!
          triggerTongueFlickLocal(270, 78);
        } else if (roll < 0.58) {
          // Playful snap at the jewel beetle on the branch!
          triggerTongueFlickLocal(280, 140);
        } else if (distBf < 480 && roll < 0.88) {
          // Snap towards hovering butterfly
          triggerTongueFlick(bfState.x, bfState.y);
        } else {
          // Snap towards mouse cursor
          triggerTongueFlick(mousePos.x, mousePos.y);
        }
      }
    }
  }

  // ==========================================================================
  // 13. SPIDER-MAN: AUTONOMOUS LIFECYCLE & EYE INTERACTIVITY
  // ==========================================================================
  const spideyState = {
    phase: 'hidden', // 'hidden', 'entering', 'hanging', 'exiting'
    hangDuration: 22000, // 22 seconds hanging & swinging
    hiddenDuration: 24000, // 24 seconds hidden off-screen
    timerId: null,
    isInteracting: false,
  };

  // Drop down smoothly from top edge into hanging position
  function dropInSpiderMan() {
    if (!spidermanContainer || spideyState.phase === 'entering' || spideyState.phase === 'hanging') return;

    spideyState.phase = 'entering';
    spidermanContainer.classList.remove('spiderman-hidden', 'spiderman-exiting');
    spidermanContainer.classList.add('spiderman-entering');

    if (isAudioEnabled) {
      playWebThwipSound();
    }

    clearTimeout(spideyState.timerId);
    spideyState.timerId = setTimeout(() => {
      spideyState.phase = 'hanging';
      spidermanContainer.classList.remove('spiderman-entering');
      spidermanContainer.classList.add('spiderman-hanging');

      // Schedule autonomous exit
      spideyState.timerId = setTimeout(pullUpSpiderMan, spideyState.hangDuration);
    }, 1150);
  }

  // Pull himself back up out of the frame
  function pullUpSpiderMan() {
    if (!spidermanContainer || spideyState.phase === 'hidden' || spideyState.phase === 'exiting') return;

    spideyState.phase = 'exiting';
    spidermanContainer.classList.remove('spiderman-entering', 'spiderman-hanging');
    spidermanContainer.classList.add('spiderman-exiting');

    if (isAudioEnabled) {
      playWebThwipSound();
    }

    clearTimeout(spideyState.timerId);
    spideyState.timerId = setTimeout(() => {
      spideyState.phase = 'hidden';
      spidermanContainer.classList.remove('spiderman-exiting');
      spidermanContainer.classList.add('spiderman-hidden');

      // Schedule next autonomous entrance
      spideyState.timerId = setTimeout(dropInSpiderMan, spideyState.hiddenDuration);
    }, 800);
  }

  // Trigger expressive lens squint or wink
  function triggerSpideyEyeReaction(type = 'squint') {
    if (!spidermanFigure) return;

    if (type === 'wink') {
      spidermanFigure.classList.remove('wink', 'squint');
      spidermanFigure.classList.add('wink');
      setTimeout(() => {
        spidermanFigure.classList.remove('wink');
        spidermanFigure.classList.add('squint');
        setTimeout(() => spidermanFigure.classList.remove('squint'), 380);
      }, 320);
    } else {
      spidermanFigure.classList.add('squint');
      setTimeout(() => {
        spidermanFigure.classList.remove('squint');
      }, 450);
    }
  }

  // Initialize Spider-Man events and lifecycle
  function initSpiderMan() {
    if (!spidermanContainer || !spidermanFigure) return;

    // Interactive click: playful elastic recoil bounce + wink + web-thwip sound
    spidermanFigure.addEventListener('click', (e) => {
      e.stopPropagation();
      if (spideyState.isInteracting) return;
      spideyState.isInteracting = true;

      spidermanFigure.classList.remove('bounce');
      void spidermanFigure.offsetWidth; // Force DOM reflow to restart bounce
      spidermanFigure.classList.add('bounce');

      triggerSpideyEyeReaction('wink');

      if (isAudioEnabled) {
        playWebThwipSound();
      }

      setTimeout(() => {
        spidermanFigure.classList.remove('bounce');
        spideyState.isInteracting = false;
      }, 700);
    });

    // Keyboard accessibility: space or enter triggers interaction when focused
    spidermanFigure.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        spidermanFigure.click();
      }
    });

    // Screen click: subtle focus/squint reaction if Spider-Man is currently hanging
    window.addEventListener('click', () => {
      if (spideyState.phase === 'hanging' && !spideyState.isInteracting) {
        triggerSpideyEyeReaction('squint');
      }
    });

    // Autonomous subtle eye micro-blinks while hanging
    setInterval(() => {
      if (spideyState.phase === 'hanging' && !spideyState.isInteracting) {
        if (Math.random() < 0.35) {
          triggerSpideyEyeReaction(Math.random() < 0.3 ? 'wink' : 'squint');
        }
      }
    }, 4500);

    // Global helper to summon Spider-Man on demand (or test in console)
    window.summonSpiderMan = dropInSpiderMan;

    // Initial dramatic entrance after 2.5 seconds
    setTimeout(dropInSpiderMan, 2500);
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
    initButterfly();
    initChameleon();
    initSpiderMan();

    // Start real-time analog clock loop
    requestAnimationFrame(updateClock);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

