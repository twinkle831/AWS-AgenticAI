const API_BASE = '';

async function checkHealth() {
  const el = document.getElementById('api-status');
  try {
    const r = await fetch(`${API_BASE}/health`);
    const data = await r.json();
    el.textContent = 'API OK';
    el.classList.add('ok');
    el.classList.remove('err');
    document.getElementById('run-crew').disabled = false;
  } catch (e) {
    el.textContent = 'API offline';
    el.classList.add('err');
    el.classList.remove('ok');
  }
}

async function runCrew() {
  const btn = document.getElementById('run-crew');
  const panel = document.getElementById('crew-output');
  const meta = document.getElementById('crew-meta');
  btn.classList.add('loading');
  panel.classList.remove('success', 'error');
  panel.innerHTML = '<p>Running crew (inventory → pricing → maintenance → customer service → logistics)…</p>';
  meta.textContent = '';

  try {
    const r = await fetch(`${API_BASE}/run-crew`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ store_id: 'store-001', trigger: 'demo' }),
    });
    const data = await r.json();
    if (data.success) {
      panel.classList.add('success');
      panel.textContent = data.output || data.message;
      meta.textContent = 'Completed successfully.';
    } else {
      panel.classList.add('error');
      panel.textContent = data.message || 'Run failed.';
      meta.textContent = 'Check OPENAI_API_KEY in .env and try again.';
    }
  } catch (e) {
    panel.classList.add('error');
    panel.textContent = e.message || 'Request failed. Is the server running?';
    meta.textContent = '';
  } finally {
    btn.classList.remove('loading');
  }
}

async function startWorkflow() {
  const btn = document.getElementById('start-workflow');
  const out = document.getElementById('workflow-out');
  btn.classList.add('loading');
  out.innerHTML = '';

  try {
    const r = await fetch(`${API_BASE}/workflow/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ store_id: 'store-001', trigger: 'demo' }),
    });
    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      throw new Error(err.detail || r.statusText);
    }
    const data = await r.json();
    out.innerHTML = `
      <p><strong>Started</strong></p>
      <ul>
        <li>Execution ARN: <code>${data.execution_arn || '—'}</code></li>
      </ul>
      <p><small>Use workflow/status?execution_arn=... to check status.</small></p>
    `;
  } catch (e) {
    out.innerHTML = `<p class="empty">${e.message}</p>`;
  } finally {
    btn.classList.remove('loading');
  }
}

async function refreshLowStock() {
  const btn = document.getElementById('refresh-low-stock');
  const list = document.getElementById('low-stock-list');
  btn.classList.add('loading');

  try {
    const r = await fetch(`${API_BASE}/inventory/low-stock`);
    const data = await r.json();
    const items = data.items || [];
    if (items.length === 0) {
      list.innerHTML = '<p class="empty">No low-stock items. Run deploy with --seed and run crew to create orders.</p>';
    } else {
      list.innerHTML = '<ul>' + items.map(i =>
        `<li>${i.sku} — ${i.name || '—'}: ${i.quantity} (threshold ${i.reorder_threshold})</li>`
      ).join('') + '</ul>';
    }
  } catch (e) {
    list.innerHTML = `<p class="empty">${e.message}</p>`;
  } finally {
    btn.classList.remove('loading');
  }
}

document.getElementById('run-crew').addEventListener('click', runCrew);
document.getElementById('start-workflow').addEventListener('click', startWorkflow);
document.getElementById('refresh-low-stock').addEventListener('click', refreshLowStock);

checkHealth();
refreshLowStock();
