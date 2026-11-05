---
title: Specific Modulus
desc: Compare tube weight and stiffness across steel, aluminum, and titanium.
image: /static/specific.png
template: template_page.html
---
<div id="compact-tube-calculator">
<h2>Tube comparison</h2>
<div class="controls">
<label>Reference material<select id="material"><option value="0">4130 steel</option><option value="1">6061-T6 aluminum</option><option value="2">Ti-3Al-2.5V</option></select></label>
<label>Outside diameter · mm<input id="diameter" type="number" inputmode="decimal" min="0.1" step="0.1" value="28.6"></label>
<label>Reference wall · mm<input id="wall" type="number" inputmode="decimal" min="0.1" step="0.1" value="0.7"></label>
<label>Length / span · mm<input id="length" type="number" inputmode="decimal" min="1" step="any" value="600"></label>
<label>Load · N<input id="load" type="number" inputmode="decimal" min="0" step="any" value="100"></label>
<label>Bending test<select id="support"><option value="48">Supported · center load</option><option value="3">Cantilever · tip load</option></select></label>
</div>
<p id="error" role="alert" hidden></p>
<table><thead><tr><th>Material</th><th>Wall<br>mm</th><th>Weight<br>g</th><th>Deflection<br>mm</th></tr></thead><tbody id="results" aria-live="polite"></tbody></table>
<p id="status"></p>
</div>
<script src="/static/compact-tube-calculator.js" defer></script>
