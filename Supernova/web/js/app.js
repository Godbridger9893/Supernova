/**
 * Supernova // JARVIS - Main Application Controller
 * Orchestrates WebSockets, 3D Orb, Audio Visualizer, Speech, Sound FX, and Stark UI interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const statusBadge = document.getElementById('aiStatusBadge');
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  const chatFeed = document.getElementById('chatFeed');
  const commandInput = document.getElementById('commandInput');
  const sendBtn = document.getElementById('sendBtn');
  const micBtn = document.getElementById('micBtn');
  const stopAudioBtn = document.getElementById('stopAudioBtn');
  const clearFeedBtn = document.getElementById('clearFeedBtn');
  const taskPlanBox = document.getElementById('taskPlanBox');
  const visionPreviewCard = document.getElementById('visionPreviewCard');
  const visionPreviewImg = document.getElementById('visionPreviewImg');
  const closeVisionBtn = document.getElementById('closeVisionBtn');
  const quickScreenBtn = document.getElementById('quickScreenBtn');
  const quickWeatherBtn = document.getElementById('quickWeatherBtn');
  const settingsModalBtn = document.getElementById('settingsModalBtn');
  const settingsModal = document.getElementById('settingsModal');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const cancelSettingsBtn = document.getElementById('cancelSettingsBtn');
  const geminiKeyInput = document.getElementById('geminiKeyInput');
  const openrouterKeyInput = document.getElementById('openrouterKeyInput');
  const voiceSelect = document.getElementById('voiceSelect');
  const voiceToggle = document.getElementById('voiceToggle');
  const providerSelect = document.getElementById('providerSelect');
  const ollamaSettingsGroup = document.getElementById('ollamaSettingsGroup');
  const geminiSettingsGroup = document.getElementById('geminiSettingsGroup');
  const ollamaUrlInput = document.getElementById('ollamaUrlInput');
  const ollamaModelSelect = document.getElementById('ollamaModelSelect');
  const ollamaStatusText = document.getElementById('ollamaStatusText');
  const sfxToggleBtn = document.getElementById('sfxToggleBtn');
  const sfxIcon = document.getElementById('sfxIcon');
  const sfxText = document.getElementById('sfxText');
  const hudTime = document.getElementById('hudTime');
  const hexDumpBox = document.getElementById('hexDumpBox');

  // Initialize Sound FX Synthesizer
  const sfx = new JarvisSoundFX();
  window.jarvisSFX = sfx;

  // Play power up sound after 600ms
  setTimeout(() => {
    sfx.playStartup();
  }, 600);

  // Initialize 3D Hologram Orb
  let orb = null;
  if (window.SupernovaOrb) {
    orb = new SupernovaOrb('orb-canvas-container');
  }

  // Audio Visualizer
  const visualizer = new AudioVisualizer('waveformCanvas', (lvl) => {
    if (orb) orb.setAudioLevel(lvl);
  });

  // Telemetry Manager
  const telemetry = new TelemetryManager();

  // Speech Controller
  const speech = new SpeechController(
    (transcript) => {
      commandInput.value = transcript;
      sendCommand(transcript);
    },
    (state) => {
      updateSystemState(state);
    }
  );

  // Live UTC Clock & Telemetry Tick
  function updateLiveClock() {
    if (!hudTime) return;
    const now = new Date();
    const h = String(now.getUTCHours()).padStart(2, '0');
    const m = String(now.getUTCMinutes()).padStart(2, '0');
    const s = String(now.getUTCSeconds()).padStart(2, '0');
    hudTime.textContent = `${h}:${m}:${s} UTC`;
  }
  setInterval(updateLiveClock, 1000);
  updateLiveClock();

  // Live Hex Memory Stream Cycling
  function cycleHexStream() {
    if (!hexDumpBox) return;
    const hex = () => '0x' + Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase().padStart(8, '0');
    const word = () => Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
    const tags = ['[SYNC]', '[READY]', '[ACTIVE]', '[ENGAGED]', '[QUANTUM]', '[OPTIMAL]'];
    const tag = () => tags[Math.floor(Math.random() * tags.length)];

    hexDumpBox.innerHTML = `
      <div>${hex()} ${word()} ${word()} ${tag()}</div>
      <div>${hex()} ${word()} ${word()} ${tag()}</div>
      <div>${hex()} ${word()} ${word()} ${tag()}</div>
    `;
  }
  setInterval(cycleHexStream, 3000);

  // Sound FX Toggle
  if (sfxToggleBtn) {
    sfxToggleBtn.addEventListener('click', () => {
      sfx.enabled = !sfx.enabled;
      if (sfx.enabled) {
        sfxIcon.textContent = '🔊';
        sfxText.textContent = 'SFX ON';
        sfx.playClick();
      } else {
        sfxIcon.textContent = '🔇';
        sfxText.textContent = 'SFX OFF';
      }
    });
  }

  // Hover Audio on UI buttons & prompt chips
  document.querySelectorAll('button, .prompt-chip').forEach(btn => {
    btn.addEventListener('mouseenter', () => sfx.playHover());
  });

  // Global Keyboard Shortcuts (Stark HUD Shortcuts)
  window.addEventListener('keydown', (e) => {
    // If typing inside an input or modal, do not intercept normal typing
    const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);
    
    // Space or V -> Toggle Voice (when not typing)
    if ((e.code === 'Space' || e.key === 'v' || e.key === 'V') && !isInput) {
      e.preventDefault();
      speech.toggleListening();
    }
    // Escape -> Silence speech & stop listening
    else if (e.key === 'Escape') {
      speech.stopSpeaking();
      visualizer.stopListening();
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "stop_speech" }));
      }
      updateSystemState("IDLE");
      sfx.playDeactivate();
    }
    // Cmd+K or Ctrl+K -> Focus Command Bar
    else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      commandInput.focus();
      sfx.playHover();
    }
  });

  // WebSocket Bridge
  let socket = null;
  let reconnectTimer = null;

  function connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host || '127.0.0.1:8765';
    const wsUrl = `${protocol}//${host}/ws`;

    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("[WS] Connected to Supernova Core Server.");
      updateSystemState("IDLE");
    };

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        handleServerMessage(msg);
      } catch (e) {
        console.error("[WS] Error parsing message:", e);
      }
    };

    socket.onclose = () => {
      console.warn("[WS] Disconnected. Reconnecting in 2s...");
      updateSystemState("DISCONNECTED");
      clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(connectWebSocket, 2000);
    };

    socket.onerror = (err) => {
      console.error("[WS] Socket error:", err);
    };
  }

  function handleServerMessage(msg) {
    const type = msg.type;

    if (type === "state_change") {
      updateSystemState(msg.state);
    } else if (type === "telemetry") {
      telemetry.update(msg.data);
    } else if (type === "tool_step") {
      updateTaskStep(msg.name, msg.status);
    } else if (type === "assistant_response") {
      appendAssistantMessage(msg.reply, msg.tools_executed);
      renderTaskPlan(msg.task_steps, true);
      
      // Check if any tool produced a vision screenshot
      if (msg.tools_executed) {
        msg.tools_executed.forEach(t => {
          if (t.tool === "screen_process" && t.result && t.result.preview_url) {
            showVisionPreview(t.result.preview_url + "?t=" + Date.now());
          }
        });
      }
      
      // Auto speech synthesis in web if needed
      updateSystemState("SPEAKING");
      visualizer.startSimulated("speaking");
      setTimeout(() => {
        updateSystemState("IDLE");
        visualizer.stopListening();
      }, Math.min(10000, Math.max(2500, msg.reply.length * 60)));
    }
  }

  function updateSystemState(state) {
    if (orb) orb.setState(state);

    statusDot.className = "status-indicator-dot";
    
    if (state === "IDLE") {
      statusText.textContent = "JARVIS CORE // STANDBY";
      statusDot.style.background = "#00ff88";
      statusDot.style.boxShadow = "0 0 8px #00ff88";
      micBtn.classList.remove('listening');
    } else if (state === "LISTENING") {
      statusText.textContent = "VOICE MATRIX // ACTIVE";
      statusDot.style.background = "#ffcc00";
      statusDot.style.boxShadow = "0 0 14px #ffcc00";
      micBtn.classList.add('listening');
      sfx.playActivate();
      visualizer.startListening();
    } else if (state === "THINKING") {
      statusText.textContent = "NOVA NEURAL CORE // PROCESSING";
      statusDot.style.background = "#ff9900";
      statusDot.style.boxShadow = "0 0 14px #ff9900";
      micBtn.classList.remove('listening');
      sfx.playProcessing();
    } else if (state === "SPEAKING") {
      statusText.textContent = "AUDIO SYNTH // TRANSMITTING";
      statusDot.style.background = "#ffe566";
      statusDot.style.boxShadow = "0 0 16px #ffe566";
      micBtn.classList.remove('listening');
    } else if (state === "EXECUTING") {
      statusText.textContent = "SYSTEM PROTOCOL // EXECUTING";
      statusDot.style.background = "#00ff88";
      statusDot.style.boxShadow = "0 0 14px #00ff88";
      sfx.playShockwave();
    } else if (state === "DISCONNECTED") {
      statusText.textContent = "CORE OFFLINE // RECONNECTING";
      statusDot.style.background = "#ff3333";
      statusDot.style.boxShadow = "0 0 8px #ff3333";
    }
  }

  function sendCommand(text) {
    const clean = (text || commandInput.value || "").trim();
    if (!clean) return;

    sfx.playSend();
    if (orb) orb.triggerShockwave(2.0);

    appendUserMessage(clean);
    commandInput.value = "";

    renderTaskPlan(["Analyzing query & planning tool execution...", "Executing action sequence..."], false);
    updateSystemState("THINKING");

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: "user_message",
        text: clean
      }));
    } else {
      // REST Fallback if WS not ready
      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: clean })
      }).then(r => r.json()).then(data => {
        appendAssistantMessage(data.reply, data.tools_executed);
      }).catch(e => {
        appendAssistantMessage("Error connecting to Supernova backend: " + e.message);
      });
    }
  }

  function appendUserMessage(text) {
    const div = document.createElement('div');
    div.className = 'chat-message user-message';
    div.innerHTML = `
      <div class="msg-sender">DIRECTIVE // USER</div>
      <div class="msg-content">${escapeHtml(text)}</div>
      <div class="msg-timestamp">${getTimeString()}</div>
    `;
    chatFeed.appendChild(div);
    chatFeed.scrollTop = chatFeed.scrollHeight;
  }

  function appendAssistantMessage(text, tools) {
    const div = document.createElement('div');
    div.className = 'chat-message assistant-message';
    
    let toolsHtml = '';
    if (tools && tools.length > 0) {
      toolsHtml = '<div class="msg-tools-used" style="margin-top:6px; font-size:0.75rem; color:#ffcc00;">';
      tools.forEach(t => {
        toolsHtml += `<div>⚡ Executed <strong>${t.tool}</strong></div>`;
      });
      toolsHtml += '</div>';
    }

    div.innerHTML = `
      <div class="msg-sender">SUPERNOVA // JARVIS CORE</div>
      <div class="msg-content">${formatMarkdown(text)}${toolsHtml}</div>
      <div class="msg-timestamp">${getTimeString()}</div>
    `;
    chatFeed.appendChild(div);
    chatFeed.scrollTop = chatFeed.scrollHeight;
  }

  function renderTaskPlan(steps, completed = false) {
    if (!steps || steps.length === 0) {
      taskPlanBox.innerHTML = '<div class="task-empty-state">Standby for protocol execution</div>';
      return;
    }

    taskPlanBox.innerHTML = '';
    steps.forEach((step, idx) => {
      const item = document.createElement('div');
      item.className = 'task-step-item';
      const icon = completed ? '✓' : (idx === 0 ? '⟳' : '•');
      const iconClass = completed ? 'done' : (idx === 0 ? 'running' : '');
      item.innerHTML = `
        <span class="step-status-icon ${iconClass}">${icon}</span>
        <span>${escapeHtml(step)}</span>
      `;
      taskPlanBox.appendChild(item);
    });
  }

  function updateTaskStep(name, status) {
    const items = taskPlanBox.querySelectorAll('.task-step-item');
    if (items.length > 0) {
      items[0].innerHTML = `<span class="step-status-icon done">✓</span><span>${escapeHtml(name)} (${status})</span>`;
    }
  }

  function showVisionPreview(src) {
    visionPreviewImg.src = src;
    visionPreviewCard.style.display = 'block';
  }

  function escapeHtml(str) {
    return (str || "").replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
  }

  function formatMarkdown(str) {
    let formatted = escapeHtml(str);
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\n\s*-\s*(.*?)/g, '<br>• $1');
    formatted = formatted.replace(/\n/g, '<br>');
    return formatted;
  }

  function getTimeString() {
    const d = new Date();
    return d.toTimeString().split(' ')[0];
  }

  // Event Listeners
  sendBtn.addEventListener('click', () => sendCommand());
  commandInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendCommand();
  });

  micBtn.addEventListener('click', () => {
    speech.toggleListening();
  });

  stopAudioBtn.addEventListener('click', () => {
    sfx.playDeactivate();
    speech.stopSpeaking();
    visualizer.stopListening();
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "stop_speech" }));
    }
    updateSystemState("IDLE");
  });

  clearFeedBtn.addEventListener('click', () => {
    sfx.playClick();
    chatFeed.innerHTML = '';
  });

  closeVisionBtn.addEventListener('click', () => {
    sfx.playClick();
    visionPreviewCard.style.display = 'none';
  });

  quickScreenBtn.addEventListener('click', () => {
    sfx.playClick();
    sendCommand("Analyze what is currently on my screen.");
  });

  quickWeatherBtn.addEventListener('click', () => {
    sfx.playClick();
    sendCommand("What is the current weather forecast?");
  });

  // Prompt Chips
  document.querySelectorAll('.prompt-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      sfx.playClick();
      const text = chip.getAttribute('data-text');
      if (text) sendCommand(text);
    });
  });

  function updateProviderVisibility(provider) {
    if (provider === 'ollama') {
      ollamaSettingsGroup.style.display = 'block';
      geminiSettingsGroup.style.display = 'none';
      checkOllamaModels();
    } else {
      ollamaSettingsGroup.style.display = 'none';
      geminiSettingsGroup.style.display = 'block';
    }
  }

  async function checkOllamaModels() {
    ollamaStatusText.textContent = "Connecting to local Ollama...";
    try {
      const res = await fetch('/api/ollama/status').then(r => r.json());
      if (res.online && res.models && res.models.length > 0) {
        ollamaStatusText.textContent = `✓ Connected! Found ${res.models.length} model(s).`;
        ollamaStatusText.style.color = '#00ff88';
        const currVal = ollamaModelSelect.value;
        ollamaModelSelect.innerHTML = '';
        res.models.forEach(m => {
          const opt = document.createElement('option');
          opt.value = m;
          opt.textContent = m;
          ollamaModelSelect.appendChild(opt);
        });
        if (res.models.includes(currVal)) {
          ollamaModelSelect.value = currVal;
        }
      } else if (res.online) {
        ollamaStatusText.textContent = "Ollama is running, but no models found. Run `ollama pull llama3.2`";
        ollamaStatusText.style.color = '#ffaa30';
      } else {
        ollamaStatusText.textContent = "Ollama is offline. Start it with `ollama serve` in Terminal.";
        ollamaStatusText.style.color = '#ff3333';
      }
    } catch (e) {
      ollamaStatusText.textContent = "Could not reach Ollama server.";
      ollamaStatusText.style.color = '#ff3333';
    }
  }

  providerSelect.addEventListener('change', () => {
    updateProviderVisibility(providerSelect.value);
  });

  // Settings Modal
  settingsModalBtn.addEventListener('click', async () => {
    sfx.playClick();
    try {
      const res = await fetch('/api/settings').then(r => r.json());
      if (res.api_keys) {
        geminiKeyInput.value = res.api_keys.gemini_api_key || '';
        openrouterKeyInput.value = res.api_keys.openrouter_api_key || '';
      }
      if (res.settings) {
        providerSelect.value = res.settings.ai_provider || 'gemini';
        ollamaUrlInput.value = res.settings.ollama_url || 'http://127.0.0.1:11434';
        if (res.settings.ollama_model) {
          ollamaModelSelect.value = res.settings.ollama_model;
        }
        voiceSelect.value = res.settings.tts_voice || 'Samantha';
        voiceToggle.checked = res.settings.voice_enabled !== false;
      }
      updateProviderVisibility(providerSelect.value);
    } catch (e) {}
    settingsModal.classList.add('active');
  });

  closeSettingsBtn.addEventListener('click', () => {
    sfx.playClick();
    settingsModal.classList.remove('active');
  });
  cancelSettingsBtn.addEventListener('click', () => {
    sfx.playClick();
    settingsModal.classList.remove('active');
  });

  saveSettingsBtn.addEventListener('click', async () => {
    sfx.playClick();
    const payload = {
      api_keys: {
        gemini_api_key: geminiKeyInput.value.trim(),
        openrouter_api_key: openrouterKeyInput.value.trim()
      },
      settings: {
        ai_provider: providerSelect.value,
        ollama_url: ollamaUrlInput.value.trim() || 'http://127.0.0.1:11434',
        ollama_model: ollamaModelSelect.value || 'llama3.2',
        tts_voice: voiceSelect.value,
        voice_enabled: voiceToggle.checked
      }
    };
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      settingsModal.classList.remove('active');
      appendAssistantMessage(`System configuration saved. Active Neural Core: <strong>${payload.settings.ai_provider.toUpperCase()}</strong>.`);
    } catch (e) {
      alert("Error saving settings: " + e.message);
    }
  });

  // Initialize Connection
  connectWebSocket();
});
