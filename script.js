(function () {

  const DROP_SIZE_MIN  = 45;   // px
  const DROP_SIZE_MAX  = 50;
  const FALL_SPEED_MIN = 0.05; // seconds per 100px of travel
  const FALL_SPEED_MAX = 0.15;
  const MAX_DROPS      = 300;  // cap for performance
  const CLOUD_HEIGHT   = ()=> {
    const img = document.getElementById('cloudImg');
    // estimate cloud base: roughly 60% down the cloud image height
    return img ? img.getBoundingClientRect().bottom * 0.6 : 100;
  };

  let activeDrops = 0;

  const hint = document.getElementById('hint');
  let hintGone = false;
  function dismissHint() {
    if (hintGone) return;
    hintGone = true;
    hint.style.transition = 'opacity 0.8s';
    hint.style.opacity = '0';
    setTimeout(() => hint.remove(), 200);
  }

  function spawnDrop(key) {
    if (activeDrops >= MAX_DROPS) return;
    activeDrops++;
    dismissHint();

    const vw        = window.innerWidth;
    const cloudBase = CLOUD_HEIGHT();

    // Random x within viewport
    const x    = Math.random() * (vw - DROP_SIZE_MAX);
    const size = DROP_SIZE_MIN + Math.random() * (DROP_SIZE_MAX - DROP_SIZE_MIN);

    // Fall distance = from cloudBase to just below viewport
    const fallDist  = window.innerHeight - cloudBase + size;
    const speed     = FALL_SPEED_MIN + Math.random() * (FALL_SPEED_MAX - FALL_SPEED_MIN);
    const duration  = (fallDist / 100) * speed;

    // Minimal drift — heavy rain falls nearly straight
    const drift = (Math.random() - 0.5) * 10;

    /* Raindrop image */
    const drop = document.createElement('img');
    drop.src   = 'raindrop.png';
    drop.className = 'raindrop';
    drop.style.cssText = `
      left: ${x}px;
      top: ${cloudBase}px;
      width: ${size}px;
      height: auto;
      animation-duration: ${duration}s;
      animation-delay: 0s;
      filter: hue-rotate(${Math.random()*40-20}deg) brightness(${0.85 + Math.random()*0.3});
    `;

    /* Key label */
    const label = document.createElement('div');
    label.className   = 'key-label';
    label.textContent = key.length === 1 ? key : formatKey(key);
    label.style.cssText = `
      left: ${x + size / 2 - 8}px;
      top: ${cloudBase - 2}px;
      animation-duration: ${Math.min(duration, 1.4)}s;
    `;

    document.body.appendChild(drop);
    document.body.appendChild(label);

    // Splash at landing
    const splashDelay = duration * 1000 - 60;
    const splashTimer = setTimeout(() => {
      createSplash(x + size / 2, window.innerHeight - 8);
    }, splashDelay);

    // Cleanup
    const cleanupTimer = setTimeout(() => {
      drop.remove();
      label.remove();
      activeDrops--;
    }, (duration + 0.15) * 1000);

    // Override transform to include drift
    drop.style.setProperty('--drift', drift + 'px');
    drop.style.animation = 'none';
    drop.getBoundingClientRect(); // reflow
    drop.style.transition = `transform ${duration}s linear, opacity ${duration}s linear`;
    drop.style.transform  = `translateY(${fallDist}px) translateX(${drift}px) rotate(${drift * 0.4}deg)`;
    drop.style.opacity    = '0';

    // Also animate label
    label.style.animation = 'none';
    label.getBoundingClientRect();
    label.style.transition = `opacity ${Math.min(duration, 1.2)}s linear, transform ${Math.min(duration, 1.2)}s linear`;
    label.style.opacity    = '0';
    label.style.transform  = 'translateY(20px)';
  }

  function createSplash(x, y) {
    const splash = document.createElement('div');
    splash.className = 'splash';
    splash.style.left = (x - 20) + 'px';
    splash.style.top  = (y - 4)  + 'px';
    document.body.appendChild(splash);
    setTimeout(() => splash.remove(), 420);
  }

  function formatKey(key) {
    const map = {
      ' ': 'SPC', 'Enter': '↵', 'Backspace': '⌫', 'Tab': '⇥',
      'Shift': '⇧', 'Control': 'Ctrl', 'Alt': 'Alt', 'Meta': '⌘',
      'ArrowUp': '↑', 'ArrowDown': '↓', 'ArrowLeft': '←', 'ArrowRight': '→',
      'Escape': 'Esc', 'CapsLock': '⇪', 'Delete': 'Del',
    };
    return map[key] || key.slice(0, 3);
  }


  document.addEventListener('keydown', e => {
    // Allow browser shortcuts
    if (e.ctrlKey || e.metaKey) return;

    // Throttle rapid repeats slightly
    spawnDrop(e.key);
  });


  document.addEventListener('pointerdown', e => {
    if (e.pointerType === 'touch' || e.pointerType === 'pen') {
      spawnDrop('☔');
    }
  });

})();