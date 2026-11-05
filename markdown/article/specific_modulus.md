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

Specific modulus is Young’s modulus divided by density (E/ρ). It tells you how much elastic stiffness a material provides relative to its mass. Steel is roughly three times as stiff as aluminum for the same tube dimensions, but it’s also roughly three times as dense, so their specific moduli are close. Titanium is in the same ballpark. For thin-walled tubes of the same outside diameter, similar specific moduli tend to give similar weights at equal bending stiffness. As the walls get thicker, that approximation becomes less exact because more of the material sits closer to the center, where it contributes less to bending stiffness.

The calculator starts with a 4130 steel tube, 28.6 mm in outside diameter with a 0.7 mm wall. Choose a reference material and wall thickness, and it predicts how far that tube bends under the selected load. It then calculates how thick the walls of the other two materials need to be to bend the same amount, keeping the outside diameter, span, load, and support setup fixed. The table shows the resulting wall thicknesses and tube weights, so you can compare what each material weighs when all three tubes bend equally.
