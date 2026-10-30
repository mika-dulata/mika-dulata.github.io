/* Erlang B recurrence avoids factorial overflow; B converts to Erlang C. */
function estimateStaffing(volume, ahtMinutes, targetPercent, answerSeconds, shrinkagePercent) {
  const values = [volume, ahtMinutes, targetPercent, answerSeconds, shrinkagePercent];
  if (!values.every(Number.isFinite) || volume <= 0 || ahtMinutes <= 0 || targetPercent <= 0 || targetPercent >= 100 || answerSeconds <= 0 || shrinkagePercent < 0 || shrinkagePercent >= 100) throw new Error('Enter valid positive values. Target must be below 100%.');
  const load = volume * ahtMinutes / 60;
  if (load > 20000) throw new Error('This estimate supports an offered load up to 20,000 Erlangs.');
  let erlangB = 1;
  for (let n = 1; n <= Math.ceil(load) + 10000; n++) {
    erlangB = load * erlangB / (n + load * erlangB);
    if (n <= load) continue;
    const rho = load / n;
    const probabilityWait = erlangB / (1 - rho + rho * erlangB);
    const service = 1 - probabilityWait * Math.exp(-(n - load) * answerSeconds / (ahtMinutes * 60));
    if (service >= targetPercent / 100) return {agents:n, scheduled:Math.ceil(n / (1 - shrinkagePercent / 100)), service, occupancy:rho, wait:probabilityWait * ahtMinutes * 60 / (n - load), load};
  }
  throw new Error('No estimate found for these inputs.');
}
if (typeof document !== 'undefined') {
  const form = document.getElementById('staffing');
  function update() {
    const error = document.getElementById('error');
    try {
      if (!form.checkValidity()) throw new Error('Check the input ranges above.');
      const result = estimateStaffing(...['volume','aht','target','seconds','shrinkage'].map(name => Number(form.elements[name].value)));
      for (const id of ['agents','scheduled']) document.getElementById(id).textContent = result[id];
      for (const id of ['service','occupancy']) document.getElementById(id).textContent = (result[id] * 100).toFixed(1) + '%';
      document.getElementById('wait').textContent = result.wait.toFixed(1) + ' sec';
      document.getElementById('load').textContent = result.load.toFixed(2) + ' Erlangs';
      error.textContent = '';
    } catch (e) {
      for (const id of ['agents','scheduled','service','occupancy','wait','load']) document.getElementById(id).textContent = '—';
      error.textContent = e.message;
    }
  }
  form.addEventListener('input', update);
  form.addEventListener('submit', event => event.preventDefault());
  update();
}
if (typeof module !== 'undefined') module.exports = {estimateStaffing};
