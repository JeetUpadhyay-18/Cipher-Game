/* ==========================================================================
   CIPHER — Number Deduction Game
   Audio Engine (generative ambient jazz via Web Audio API) + Game Logic
   ========================================================================== */

(function () {

  // ============ AUDIO ENGINE (Generative ambient jazz) ============
  let audioCtx = null;
  let isPlaying = false;
  let masterGain = null;
  let scheduledNodes = [];
  let jazzInterval = null;

  const musicBtn = document.getElementById('musicBtn');

  function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(audioCtx.destination);
  }

  function playNote(freq, time, duration, vol = 0.08, type = 'sine') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.value = 1200;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.start(time);
    osc.stop(time + duration + 0.1);
  }

  // Jazz chord voicings (frequencies)
  const jazzChords = [
    // Cmaj7
    [261.63, 329.63, 392.00, 493.88],
    // Am7
    [220.00, 261.63, 329.63, 392.00],
    // Dm7
    [146.83, 220.00, 261.63, 329.63],
    // G7
    [196.00, 246.94, 293.66, 349.23],
    // Fmaj7
    [174.61, 220.00, 261.63, 329.63],
    // Em7b5
    [164.81, 220.00, 261.63, 311.13],
    // A7
    [220.00, 277.18, 329.63, 415.30],
  ];

  const walkingBassNotes = [65.41, 73.42, 82.41, 87.31, 98.00, 110.00, 123.47, 130.81, 146.83, 164.81, 174.61, 196.00];

  let chordIndex = 0;
  let beatTime = 0;

  function scheduleJazzBar() {
    if (!audioCtx || !isPlaying) return;
    const now = audioCtx.currentTime;
    if (beatTime < now) beatTime = now;

    const tempo = 0.55; // seconds per beat
    const chord = jazzChords[chordIndex % jazzChords.length];
    chordIndex++;

    // Chord voicing — arpeggiated gently
    chord.forEach((freq, i) => {
      playNote(freq * 2, beatTime + i * 0.04, tempo * 3.8, 0.04, 'sine');
    });

    // Walking bass — 4 beats
    for (let b = 0; b < 4; b++) {
      const bassFreq = walkingBassNotes[Math.floor(Math.random() * walkingBassNotes.length)];
      playNote(bassFreq, beatTime + b * tempo, tempo * 0.7, 0.12, 'triangle');
    }

    // Brush hi-hat simulation (subtle noise-like)
    for (let b = 0; b < 8; b++) {
      playHat(beatTime + b * (tempo / 2), b % 2 === 0 ? 0.03 : 0.015);
    }

    beatTime += tempo * 4;
  }

  function playHat(time, vol) {
    const bufferSize = audioCtx.sampleRate * 0.04;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1);

    const src = audioCtx.createBufferSource();
    src.buffer = buffer;

    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 8000;

    src.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

    src.start(time);
    src.stop(time + 0.05);
  }

  function startJazz() {
    if (!audioCtx) initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    isPlaying = true;
    beatTime = audioCtx.currentTime + 0.1;
    masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
    masterGain.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 1.5);
    scheduleJazzBar();
    jazzInterval = setInterval(() => {
      if (isPlaying) scheduleJazzBar();
    }, 1800);
  }

  function stopJazz() {
    isPlaying = false;
    clearInterval(jazzInterval);
    if (masterGain && audioCtx) {
      masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.5);
    }
  }

  musicBtn.addEventListener('click', () => {
    if (isPlaying) {
      stopJazz();
      musicBtn.classList.remove('playing');
    } else {
      startJazz();
      musicBtn.classList.add('playing');
    }
  });

  // ============ GAME LOGIC ============
  let secretNumber = [];
  let attempts = 0;
  let gameOver = false;

  function generateSecret() {
    const digits = [];
    const pool = [0,1,2,3,4,5,6,7,8,9];
    while (digits.length < 4) {
      const idx = Math.floor(Math.random() * pool.length);
      digits.push(pool.splice(idx, 1)[0]);
    }
    return digits;
  }

  function initGame() {
    secretNumber = generateSecret();
    attempts = 0;
    gameOver = false;
    document.getElementById('attemptCount').innerHTML = '0 <span>/ ∞</span>';
    document.getElementById('historyList').innerHTML = '<div class="history-empty" id="historyEmpty">Your guesses will<br>appear here.<br><br><span style="font-size:12px; letter-spacing:1px;">Trust the process.</span></div>';
    clearInputs();
    hideFeedback();
    document.getElementById('winOverlay').classList.remove('show');
    document.getElementById('d0').focus();
  }

  function clearInputs() {
    ['d0','d1','d2','d3'].forEach(id => {
      const el = document.getElementById(id);
      el.value = '';
      el.classList.remove('filled');
    });
    document.getElementById('submitBtn').disabled = true;
  }

  function hideFeedback() {
    document.getElementById('feedbackLine').classList.remove('visible');
    document.getElementById('feedbackPills').classList.remove('visible');
  }

  // ---- Input handling ----
  const boxes = [document.getElementById('d0'), document.getElementById('d1'), document.getElementById('d2'), document.getElementById('d3')];

  boxes.forEach((box, i) => {
    box.addEventListener('input', (e) => {
      let val = e.target.value.replace(/[^0-9]/g, '');
      if (val.length > 1) val = val.slice(-1);
      box.value = val;
      box.classList.toggle('filled', val !== '');

      if (val !== '' && i < 3) {
        boxes[i + 1].focus();
      }
      checkAllFilled();
    });

    box.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && box.value === '' && i > 0) {
        boxes[i - 1].focus();
        boxes[i - 1].value = '';
        boxes[i - 1].classList.remove('filled');
        checkAllFilled();
      }
      if (e.key === 'Enter') {
        if (!document.getElementById('submitBtn').disabled) submitGuess();
      }
      // Prevent non-numeric
      if (!/[0-9]/.test(e.key) && !['Backspace','Tab','ArrowLeft','ArrowRight','Delete','Enter'].includes(e.key)) {
        e.preventDefault();
      }
    });

    box.addEventListener('click', () => box.select());
  });

  function checkAllFilled() {
    const all = boxes.every(b => b.value !== '');
    document.getElementById('submitBtn').disabled = !all;
  }

  function submitGuess() {
    if (gameOver) return;

    const guess = boxes.map(b => parseInt(b.value));

    // Check for duplicates in guess
    if (new Set(guess).size !== 4) {
      boxes.forEach(b => {
        b.classList.add('shake');
        setTimeout(() => b.classList.remove('shake'), 500);
      });
      showFeedback('Digits must all be unique', null, null, true);
      return;
    }

    attempts++;
    document.getElementById('attemptCount').innerHTML = `${attempts} <span>/ ∞</span>`;

    // Evaluate
    let correctDigits = 0;
    let correctPositions = 0;

    for (let i = 0; i < 4; i++) {
      if (secretNumber.includes(guess[i])) correctDigits++;
      if (secretNumber[i] === guess[i]) correctPositions++;
    }

    // Remove empty state
    const emptyEl = document.getElementById('historyEmpty');
    if (emptyEl) emptyEl.remove();

    // Add to history (newest at top)
    addHistoryItem(guess, correctDigits, correctPositions, attempts);

    if (correctPositions === 4) {
      // WIN
      setTimeout(() => triggerWin(guess), 500);
    } else {
      showFeedback('result', correctDigits, correctPositions, false);
      clearInputs();
      boxes[0].focus();
    }
  }

  function showFeedback(type, digits, positions, isError) {
    const line = document.getElementById('feedbackLine');
    const pills = document.getElementById('feedbackPills');

    if (isError) {
      line.textContent = type;
      line.style.color = 'var(--red)';
      pills.classList.remove('visible');
    } else {
      if (digits === 0 && positions === 0) {
        line.textContent = 'no matches — recalibrate';
        line.style.color = 'var(--text3)';
      } else if (positions === 4) {
        line.textContent = 'perfect — cipher broken';
        line.style.color = 'var(--gold)';
      } else {
        line.textContent = 'partial match detected';
        line.style.color = 'var(--text3)';
      }
      document.getElementById('pillDigits').textContent = `${digits} / 4 digits`;
      document.getElementById('pillPos').textContent = `${positions} / 4 positions`;
      pills.classList.add('visible');
    }

    line.classList.remove('visible');
    void line.offsetWidth;
    line.classList.add('visible');
  }

  function addHistoryItem(guess, digits, positions, num) {
    const list = document.getElementById('historyList');
    const item = document.createElement('div');
    item.className = 'history-item';
    item.style.animationDelay = '0s';

    item.innerHTML = `
      <div class="history-num">${num}</div>
      <div class="history-digits">
        ${guess.map(d => `<div class="history-digit">${d}</div>`).join('')}
      </div>
      <div class="history-meta">
        <div class="meta-tag d">${digits}/4 d</div>
        <div class="meta-tag p">${positions}/4 p</div>
      </div>
    `;

    list.insertBefore(item, list.firstChild);
  }

  function triggerWin(guess) {
    gameOver = true;
    document.getElementById('winNumber').textContent = secretNumber.join(' ');
    document.getElementById('winAttempts').innerHTML = `Solved in <strong>${attempts} attempt${attempts !== 1 ? 's' : ''}</strong>`;
    document.getElementById('winOverlay').classList.add('show');

    // Play a success arpeggio
    if (audioCtx && isPlaying) {
      const now = audioCtx.currentTime;
      const winNotes = [261.63, 329.63, 392.00, 523.25, 659.25];
      winNotes.forEach((freq, i) => {
        playNote(freq, now + i * 0.12, 0.8, 0.1, 'sine');
      });
    }
  }

  const pad = document.getElementById('scratchpad');
  const toggle = document.getElementById('scratchToggle');
  const icon = document.getElementById('scratchIcon');

  toggle.addEventListener('click', () => {
    const isMin = pad.classList.toggle('minimized');
    icon.textContent = isMin ? '+' : '−';
  });

  // ---- Buttons ----
  document.getElementById('submitBtn').addEventListener('click', submitGuess);
  document.getElementById('newGameBtn').addEventListener('click', initGame);
  document.getElementById('playAgainBtn').addEventListener('click', initGame);

  // ---- Intro screen ----
  document.getElementById('startBtn').addEventListener('click', () => {
    const intro = document.getElementById('introScreen');
    intro.classList.add('fade-out');
    setTimeout(() => {
      intro.style.display = 'none';
      document.getElementById('d0').focus();
    }, 800);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !document.getElementById('introScreen').classList.contains('fade-out') && document.getElementById('introScreen').style.display !== 'none') {
      document.getElementById('startBtn').click();
    }
  });

  // ---- Init ----
  initGame();

})();
