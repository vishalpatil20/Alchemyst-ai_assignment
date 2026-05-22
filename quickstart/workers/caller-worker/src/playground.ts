export const PLAYGROUND_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HypeEngine Valuation Terminal</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;600&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <style>
        :root {
            --bg-dark: #0b0f17;
            --panel-bg: #111827;
            --primary: #2563eb;
            --primary-hover: #1d4ed8;
            --text-main: #f3f4f6;
            --text-muted: #9ca3af;
            --border: #374151;
            --border-muted: #1f2937;
            --success: #10b981;
            --danger: #ef4444;
            --font-main: 'Inter', sans-serif;
            --font-code: 'Fira Code', monospace;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: var(--font-main);
            background-color: var(--bg-dark);
            color: var(--text-main);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 3rem 1.5rem;
        }

        header {
            text-align: center;
            margin-bottom: 3rem;
            max-width: 750px;
            width: 100%;
        }

        .badge {
            background: #1f2937;
            border: 1px solid var(--border);
            color: var(--text-muted);
            padding: 0.35rem 0.75rem;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            display: inline-block;
            margin-bottom: 1rem;
        }

        h1 {
            font-size: 2rem;
            font-weight: 700;
            color: var(--text-main);
            margin-bottom: 0.75rem;
            letter-spacing: -0.02em;
        }

        .subtitle {
            font-size: 0.95rem;
            color: var(--text-muted);
            line-height: 1.6;
        }

        .container {
            width: 100%;
            max-width: 1100px;
            display: grid;
            grid-template-columns: 1.2fr 1fr;
            gap: 2rem;
        }

        @media (max-width: 900px) {
            .container {
                grid-template-columns: 1fr;
            }
        }

        .panel {
            background: var(--panel-bg);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 2rem;
        }

        .panel-title {
            font-size: 1.05rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            border-bottom: 1px solid var(--border-muted);
            padding-bottom: 0.75rem;
            color: var(--text-main);
        }

        .panel-title svg {
            color: var(--primary);
            width: 18px;
            height: 18px;
        }

        .form-group {
            margin-bottom: 1.5rem;
        }

        label {
            display: block;
            font-size: 0.8rem;
            font-weight: 600;
            color: var(--text-muted);
            margin-bottom: 0.5rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        input[type="text"] {
            width: 100%;
            background: #0b0f17;
            border: 1px solid var(--border);
            border-radius: 6px;
            padding: 0.75rem 1rem;
            font-size: 0.95rem;
            color: var(--text-main);
            font-family: var(--font-main);
            transition: border-color 0.15s ease;
        }

        input[type="text"]:focus {
            outline: none;
            border-color: var(--primary);
        }

        .buzzwords-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
            gap: 0.5rem;
            margin-bottom: 1.5rem;
        }

        .buzz-tag {
            background: #1f2937;
            border: 1px solid var(--border);
            border-radius: 6px;
            padding: 0.5rem 0.75rem;
            text-align: center;
            font-size: 0.85rem;
            font-weight: 500;
            cursor: pointer;
            user-select: none;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.35rem;
            transition: all 0.15s ease;
        }

        .buzz-tag:hover {
            background: #374151;
            border-color: #4b5563;
        }

        .buzz-tag.active {
            background: var(--primary);
            border-color: var(--primary);
            color: white;
        }

        .tag-name {
            font-size: 0.8rem;
        }

        .multiplier-bar {
            background: #1f2937;
            border: 1px solid var(--border);
            border-radius: 6px;
            padding: 0.75rem 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
        }

        .multiplier-label {
            font-size: 0.85rem;
            color: var(--text-muted);
        }

        .multiplier-value {
            font-size: 1rem;
            font-weight: 600;
            color: var(--primary);
            font-family: var(--font-code);
        }

        .btn-launch {
            width: 100%;
            background: var(--primary);
            color: white;
            border: none;
            border-radius: 6px;
            padding: 0.85rem;
            font-size: 0.95rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.15s ease;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 0.5rem;
        }

        .btn-launch:hover {
            background: var(--primary-hover);
        }

        .btn-launch:disabled {
            background: #1f2937;
            color: var(--text-muted);
            border: 1px solid var(--border);
            cursor: not-allowed;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1rem;
            margin-bottom: 1.5rem;
        }

        .stat-card {
            background: #1f2937;
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 1rem;
            position: relative;
        }

        .stat-label {
            font-size: 0.75rem;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.25rem;
        }

        .stat-value {
            font-size: 2rem;
            font-weight: 700;
            color: var(--text-main);
            font-family: var(--font-code);
        }

        .stat-value.burn {
            color: var(--danger);
        }

        .stat-value.valuation {
            color: var(--success);
        }

        .terminal {
            background: #0b0f17;
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 1rem;
            font-family: var(--font-code);
            font-size: 0.85rem;
            line-height: 1.5;
            color: #10b981;
            min-height: 160px;
            display: flex;
            flex-direction: column;
        }

        .terminal-header {
            display: flex;
            gap: 6px;
            margin-bottom: 0.75rem;
            border-bottom: 1px solid var(--border-muted);
            padding-bottom: 0.5rem;
        }

        .terminal-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
        }

        .dot-red { background: var(--danger); }
        .dot-yellow { background: #eab308; }
        .dot-green { background: var(--success); }

        .terminal-body {
            flex-grow: 1;
            white-space: pre-wrap;
        }

        .terminal-prompt {
            color: var(--primary);
            margin-right: 0.5rem;
        }

        .api-section {
            grid-column: 1 / -1;
            margin-top: 1rem;
            width: 100%;
        }

        .tab-buttons {
            display: flex;
            gap: 0.25rem;
            margin-bottom: 1rem;
            border-bottom: 1px solid var(--border-muted);
            padding-bottom: 0.5rem;
        }

        .tab-btn {
            background: transparent;
            border: none;
            color: var(--text-muted);
            padding: 0.4rem 1rem;
            font-size: 0.85rem;
            font-weight: 500;
            cursor: pointer;
            border-radius: 4px;
            transition: all 0.15s ease;
        }

        .tab-btn.active {
            color: var(--text-main);
            background: #1f2937;
        }

        .code-block {
            background: #0b0f17;
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 1.25rem;
            font-family: var(--font-code);
            font-size: 0.8rem;
            line-height: 1.5;
            color: var(--text-main);
            overflow-x: auto;
            position: relative;
        }

        .btn-copy {
            position: absolute;
            top: 0.75rem;
            right: 0.75rem;
            background: #1f2937;
            border: 1px solid var(--border);
            color: var(--text-muted);
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.7rem;
            cursor: pointer;
        }

        .btn-copy:hover {
            color: var(--text-main);
            background: #374151;
        }

        .footer {
            margin-top: 3rem;
            color: var(--text-muted);
            font-size: 0.8rem;
            text-align: center;
            width: 100%;
            border-top: 1px solid var(--border-muted);
            padding-top: 1.5rem;
        }

        .footer a {
            color: var(--primary);
            text-decoration: none;
        }

        .spinner {
            border: 2px solid rgba(255,255,255,0.2);
            border-radius: 50%;
            border-top: 2px solid white;
            width: 16px;
            height: 16px;
            animation: spin 0.8s linear infinite;
            display: inline-block;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .interop-badge {
            background: rgba(59, 130, 246, 0.05);
            border: 1px solid rgba(59, 130, 246, 0.2);
            color: var(--primary);
            border-radius: 6px;
            padding: 0.75rem 1rem;
            margin-top: 1rem;
            font-size: 0.8rem;
            display: none;
            line-height: 1.5;
        }
    </style>
</head>
<body>

    <header>
        <span class="badge">Valuation Terminal</span>
        <h1>HypeEngine Valuation Terminal</h1>
        <p class="subtitle">VC Valuation and Satirical Startup Pitch Engine. Distributed Multi-Language Architecture (TS Gateway + Python Inference + Central State KV Store).</p>
    </header>

    <div class="container">
        <!-- Input Panel -->
        <div class="panel">
            <div class="panel-title">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                Pitch Configuration
            </div>

            <div class="form-group">
                <label for="startup-idea">What's your startup idea?</label>
                <input type="text" id="startup-idea" placeholder="e.g. A simple to-do list app, but for cats" value="A simple lists app">
            </div>

            <div class="form-group">
                <label>Add Satirical Buzzwords (Select to inflate valuation)</label>
                <div class="buzzwords-grid">
                    <div class="buzz-tag" data-word="ai">
                        <span class="tag-icon">🤖</span>
                        <span class="tag-name">AI</span>
                    </div>
                    <div class="buzz-tag" data-word="blockchain">
                        <span class="tag-icon">⛓️</span>
                        <span class="tag-name">Blockchain</span>
                    </div>
                    <div class="buzz-tag" data-word="web3">
                        <span class="tag-icon">🌐</span>
                        <span class="tag-name">Web3</span>
                    </div>
                    <div class="buzz-tag" data-word="quantum">
                        <span class="tag-icon">⚛️</span>
                        <span class="tag-name">Quantum</span>
                    </div>
                    <div class="buzz-tag" data-word="agentic">
                        <span class="tag-icon">🧠</span>
                        <span class="tag-name">Agentic</span>
                    </div>
                    <div class="buzz-tag" data-word="synergy">
                        <span class="tag-icon">⚡</span>
                        <span class="tag-name">Synergy</span>
                    </div>
                    <div class="buzz-tag" data-word="disruptive">
                        <span class="tag-icon">💥</span>
                        <span class="tag-name">Disruptive</span>
                    </div>
                    <div class="buzz-tag" data-word="scale">
                        <span class="tag-icon">📈</span>
                        <span class="tag-name">Scale</span>
                    </div>
                    <div class="buzz-tag" data-word="serverless">
                        <span class="tag-icon">☁️</span>
                        <span class="tag-name">Serverless</span>
                    </div>
                    <div class="buzz-tag" data-word="saas">
                        <span class="tag-icon">💳</span>
                        <span class="tag-name">SaaS</span>
                    </div>
                </div>
            </div>

            <div class="multiplier-bar">
                <span class="multiplier-label">Valuation Multiplier:</span>
                <span class="multiplier-value" id="val-multiplier">1.0x</span>
            </div>

            <button class="btn-launch" id="btn-pitch">
                <span id="btn-text">Calculate Valuation & Pitch</span>
                <div class="spinner" id="btn-spinner" style="display: none;"></div>
            </button>
        </div>

        <!-- Output Panel -->
        <div class="panel">
            <div class="panel-title">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                Valuation & Capital Metrics
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-label">Estimated Valuation</div>
                    <div class="stat-value valuation" id="val-estimated">$10M</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Global VC Capital Burned</div>
                    <div class="stat-value burn" id="val-burned">$0</div>
                </div>
            </div>

            <div class="form-group">
                <label>Generated Board Pitch</label>
                <div class="terminal">
                    <div class="terminal-header">
                        <span class="terminal-dot dot-red"></span>
                        <span class="terminal-dot dot-yellow"></span>
                        <span class="terminal-dot dot-green"></span>
                    </div>
                    <div class="terminal-body" id="pitch-output"><span class="terminal-prompt">></span>Awaiting startup submission... Select some buzzwords and hit the button to calculate valuation.</div>
                </div>
            </div>

            <div class="interop-badge" id="interop-note"></div>
        </div>

        <!-- API Sandbox Section -->
        <div class="panel api-section">
            <div class="panel-title">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 16 4-4-4-4M6 8l-4 4 4 4M14.5 4l-5 16"/></svg>
                API Playground
            </div>

            <div class="tab-buttons">
                <button class="tab-btn active" onclick="switchTab('curl')">cURL Request</button>
                <button class="tab-btn" onclick="switchTab('schema')">JSON Schemas</button>
                <button class="tab-btn" onclick="switchTab('response')">Last Raw API Response</button>
            </div>

            <!-- CURL Block -->
            <div class="tab-content" id="tab-curl">
                <div class="code-block">
                    <button class="btn-copy" onclick="copyCode('curl-code')">Copy</button>
                    <pre id="curl-code">curl -X POST http://35.239.123.59:3111/startup/pitch \\
  -H 'Content-Type: application/json' \\
  -d '{
    "idea": "A simple list app",
    "buzzwords": ["AI", "blockchain", "agentic"]
  }'</pre>
                </div>
            </div>

            <!-- Schema Block -->
            <div class="tab-content" id="tab-schema" style="display: none;">
                <div class="code-block">
                    <pre>{
  "request": {
    "type": "object",
    "properties": {
      "idea": { "type": "string", "description": "The base startup idea" },
      "buzzwords": { "type": "array", "items": { "type": "string" }, "description": "Selected hype words" }
    },
    "required": ["idea", "buzzwords"]
  },
  "response": {
    "type": "object",
    "properties": {
      "idea": { "type": "string" },
      "buzzwords_detected": { "type": "array" },
      "satirical_pitch": { "type": "string" },
      "estimated_valuation_usd": { "type": "number" },
      "global_vc_capital_burned_usd": { "type": "number" },
      "success": { "type": "string" }
    }
  }
}</pre>
                </div>
            </div>

            <!-- Raw Response Block -->
            <div class="tab-content" id="tab-response" style="display: none;">
                <div class="code-block">
                    <pre id="raw-response-json">// Press button above to fetch real live payload response...</pre>
                </div>
            </div>
        </div>
    </div>

    <footer class="footer">
        <p>Valuation Terminal • Part of the Alchemyst DevOps Assignment • Built with <a href="https://iii.dev" target="_blank">iii.dev</a></p>
    </footer>

    <script>
        const tags = document.querySelectorAll('.buzz-tag');
        const multiplierEl = document.getElementById('val-multiplier');
        const ideaInput = document.getElementById('startup-idea');
        const btnPitch = document.getElementById('btn-pitch');
        const btnText = document.getElementById('btn-text');
        const btnSpinner = document.getElementById('btn-spinner');
        const valEstimated = document.getElementById('val-estimated');
        const valBurned = document.getElementById('val-burned');
        const pitchOutput = document.getElementById('pitch-output');
        const interopNote = document.getElementById('interop-note');
        const rawResponseJson = document.getElementById('raw-response-json');
        const curlCode = document.getElementById('curl-code');

        let selectedBuzzwords = [];

        // Interactive tag click
        tags.forEach(tag => {
            tag.addEventListener('click', () => {
                tag.classList.toggle('active');
                const word = tag.getAttribute('data-word');
                if (tag.classList.contains('active')) {
                    selectedBuzzwords.push(word);
                } else {
                    selectedBuzzwords = selectedBuzzwords.filter(w => w !== word);
                }
                updateMultiplier();
                updateCurlSnippet();
            });
        });

        // Update multiplier text
        function updateMultiplier() {
            let mult = 1.0;
            selectedBuzzwords.forEach(() => {
                mult *= 1.5;
            });
            multiplierEl.textContent = mult.toFixed(1) + 'x';
        }

        // Keep Curl Snippet Synchronized
        function updateCurlSnippet() {
            const host = window.location.host || '35.239.123.59:3111';
            const idea = ideaInput.value.replace(/"/g, '\\"');
            const wordsStr = selectedBuzzwords.map(w => \`"\${w}"\`).join(', ');
            
            curlCode.innerHTML = \`curl -X POST http://\${host}/startup/pitch \\\\
  -H 'Content-Type: application/json' \\\\
  -d '{
    "idea": "\${idea}",
    "buzzwords": [\${wordsStr}]
  }'\`;
        }

        ideaInput.addEventListener('input', updateCurlSnippet);

        // Copy button behavior
        function copyCode(id) {
            const text = document.getElementById(id).textContent;
            navigator.clipboard.writeText(text).then(() => {
                const btn = document.querySelector('.btn-copy');
                btn.textContent = 'Copied!';
                setTimeout(() => btn.textContent = 'Copy', 2000);
            });
        }

        // Tab switcher
        function switchTab(tabId) {
            document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            
            document.getElementById('tab-' + tabId).style.display = 'block';
            event.target.classList.add('active');
        }

        // Post Pitch to backend
        btnPitch.addEventListener('click', async () => {
            const idea = ideaInput.value.trim() || 'A simple lists app';
            
            btnPitch.disabled = true;
            btnText.style.display = 'none';
            btnSpinner.style.display = 'inline-block';
            
            pitchOutput.innerHTML = '<span class="terminal-prompt">></span>Sending payload over local worker network... Please hold while VCs allocate funds.';
            interopNote.style.display = 'none';

            try {
                const response = await fetch('/startup/pitch', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        idea: idea,
                        buzzwords: selectedBuzzwords
                    })
                });

                const data = await response.json();
                
                // Write Raw Response
                rawResponseJson.textContent = JSON.stringify(data, null, 2);

                // Typewriter effect for Pitch
                animateText(data.satirical_pitch);

                // Format money nicely
                valEstimated.textContent = '$' + (data.estimated_valuation_usd / 1_000_000).toFixed(1) + 'M';
                
                // Dynamic counter for global capital burned
                animateCounter(data.global_vc_capital_burned_usd);

                // Interoperability Note
                if (data.interoperability_note) {
                    interopNote.innerHTML = '<strong>🌐 Multi-Language RPC Workflow:</strong> ' + data.interoperability_note;
                    interopNote.style.display = 'block';
                }

            } catch (err) {
                pitchOutput.innerHTML = '<span class="terminal-prompt">></span><span style="color: #ef4444;">Error triggering distributed workers. Make sure the TS and Python systemd services are active!</span>\\n' + err;
            } finally {
                btnPitch.disabled = false;
                btnText.style.display = 'inline-block';
                btnSpinner.style.display = 'none';
            }
        });

        // Monospace Typewriter effect
        function animateText(text) {
            pitchOutput.innerHTML = '<span class="terminal-prompt">></span>';
            let index = 0;
            
            function type() {
                if (index < text.length) {
                    pitchOutput.innerHTML += text.charAt(index);
                    index++;
                    setTimeout(type, 15);
                }
            }
            type();
        }

        // Count up animation
        function animateCounter(targetValue) {
            const start = 0;
            const duration = 1200;
            const startTime = performance.now();

            function update(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Ease out expo
                const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                const currentVal = Math.floor(start + (targetValue - start) * ease);
                
                valBurned.textContent = '$' + (currentVal / 1_000_000).toFixed(1) + 'M';

                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    valBurned.textContent = '$' + (targetValue / 1_000_000).toFixed(1) + 'M';
                }
            }
            requestAnimationFrame(update);
        }

        // Initial setup for host
        window.addEventListener('DOMContentLoaded', () => {
            updateCurlSnippet();
        });
    </script>
</body>
</html>
`;
