let total = 0, intro, body, conclusion, timeLeft = 0;
let timerInterval = null, isPaused = false;
let mediaRecorder, audioChunks = [], audioBlobUrl = '';

function startTimer() {
  clearInterval(timerInterval);
  const mins = parseInt(document.getElementById('minutes').value);
  if (!mins || mins <= 0) return alert('Enter valid time!');

  total = mins * 60;
  intro = Math.floor(total * 0.15);
  body = Math.floor(total * 0.7);
  conclusion = total - intro - body;
  timeLeft = total;
  runTimer();
}

function runTimer() {
  const timerEl = document.getElementById('timer');
  const phaseEl = document.getElementById('phase');

  timerInterval = setInterval(() => {
    if (isPaused) return;

    let m = Math.floor(timeLeft / 60), s = timeLeft % 60;
    timerEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

    if (timeLeft > body + conclusion) {
      phaseEl.textContent = '🟢 Intro';
      phaseEl.style.backgroundColor = '#e0f7fa';
    } else if (timeLeft > conclusion) {
      phaseEl.textContent = '🟡 Body';
      phaseEl.style.backgroundColor = '#fff3e0';
    } else if (timeLeft > 0) {
      phaseEl.textContent = '🔴 Conclusion';
      phaseEl.style.backgroundColor = '#fce4ec';
    } else {
      phaseEl.textContent = '✅ Done!';
      timerEl.textContent = '00:00';
      clearInterval(timerInterval);
      stopRecording(); // auto stop when done
    }

    timeLeft--;
  }, 1000);
}

function pauseTimer() {
  isPaused = true;
}

function resumeTimer() {
  if (timeLeft > 0) isPaused = false;
}

async function toggleRecording() {
  const btn = document.getElementById('recordBtn');
  const link = document.getElementById('downloadLink');

  if (!mediaRecorder || mediaRecorder.state === 'inactive') {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: 'audio/webm' });
      audioBlobUrl = URL.createObjectURL(blob);
      link.href = audioBlobUrl;
      link.download = `TalkTimer_${Date.now()}.webm`;
      link.style.display = 'inline-block';
      link.textContent = 'Download Recording';
    };

    mediaRecorder.start();
    btn.textContent = 'Stop Recording';
  } else if (mediaRecorder.state === 'recording') {
    stopRecording();
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    document.getElementById('recordBtn').textContent = 'Start Recording';
  }
}

function saveSession() {
  const mins = document.getElementById('minutes').value;
  const now = new Date().toLocaleString();
  const phase = document.getElementById('phase').textContent;
  const session = {
    mins,
    phase,
    time: now,
    audioUrl: audioBlobUrl || ''
  };

  let sessions = JSON.parse(localStorage.getItem('talkSessions')) || [];
  sessions.push(session);
  localStorage.setItem('talkSessions', JSON.stringify(sessions));
  loadSessions();
}

function loadSessions() {
  const container = document.getElementById('sessionList');
  container.innerHTML = '';
  let sessions = JSON.parse(localStorage.getItem('talkSessions')) || [];
  sessions.reverse().forEach(s => {
    const div = document.createElement('div');
    div.className = 'session-card';
    div.innerHTML = `
      <p><strong>${s.mins} min</strong> – ${s.phase} – ${s.time}</p>
      ${s.audioUrl ? `<audio controls src="${s.audioUrl}"></audio>` : '<p><em>No recording</em></p>'}
    `;
    container.appendChild(div);
  });
}

window.onload = loadSessions;
