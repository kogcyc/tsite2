(() => {
const metals = [
  { name: '4130 steel', modulus: 205, density: 7.85 },
  { name: '6061-T6 aluminum', modulus: 68.9, density: 2.7 },
  { name: 'Ti-3Al-2.5V', modulus: 100, density: 4.48 }
];
const calculator = document.getElementById('compact-tube-calculator');
const get = id => calculator.querySelector('#' + id);
function update() {
  const [diameter, wall, length, load] = ['diameter', 'wall', 'length', 'load'].map(id => get(id).valueAsNumber);
  const reference = Number(get('material').value);
  const support = Number(get('support').value);
  const error = get('error');
  const results = get('results');
  const status = get('status');
  error.hidden = [diameter, wall, length, load].every(Number.isFinite)
    && diameter > 0 && wall > 0 && wall < diameter / 2 && length > 0 && load >= 0;
  if (!error.hidden) {
    error.textContent = 'Enter positive dimensions, a wall thinner than half the diameter, and a nonnegative load.';
    results.innerHTML = '';
    status.textContent = '';
    return;
  }
  const outerFourth = diameter ** 4;
  const inertia = Math.PI * (outerFourth - (diameter - 2 * wall) ** 4) / 64;
  const stiffness = metals[reference].modulus * 1000 * inertia;
  const deflection = load * length ** 3 / (support * stiffness);
  results.innerHTML = metals.map((metal, index) => {
    const isReference = index === reference;
    const innerFourth = outerFourth - 64 * stiffness / (Math.PI * metal.modulus * 1000);
    if (!isReference && innerFourth <= 0) {
      return '<tr><th scope="row">' + metal.name + '</th><td colspan="3">Cannot match at this diameter</td></tr>';
    }
    const thickness = isReference ? wall : (diameter - Math.sqrt(Math.sqrt(innerFourth))) / 2;
    const bore = diameter - 2 * thickness;
    const area = Math.PI * (diameter ** 2 - bore ** 2) / 4;
    const mass = metal.density * area * length / 1000;
    return '<tr><th scope="row">' + metal.name + (isReference ? '<span class="reference">Reference</span>' : '')
      + '</th><td>' + thickness.toFixed(1) + '</td><td>' + mass.toFixed(0)
      + '</td><td>' + deflection.toFixed(3) + '</td></tr>';
  }).join('');
  status.textContent = deflection > length / 20
    ? 'Deflection exceeds 5% of span. The small-deflection model is outside its useful range.'
    : 'Deflection matches automatically. Displayed values are rounded.';
}
calculator.querySelectorAll('input, select').forEach(field => field.addEventListener('input', update));
update();
})();
