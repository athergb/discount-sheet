// Lock Edit Panel
const lockBtn = document.getElementById('lockBtn');
const controlsSection = document.querySelector('.controls');

let isLocked = false;

lockBtn.addEventListener('click', () => {
  isLocked = !isLocked;

  // Disable all inputs, selects, and Save button in the controls section
  controlsSection.querySelectorAll('input, select, button').forEach(el => {
    if (el.id !== 'lockBtn') el.disabled = isLocked;
  });

  lockBtn.textContent = isLocked ? '🔓 Unlock Edit Panel' : '🔒 Lock Edit Panel';
});

// Example saveAirline function placeholder
function saveAirline() {
  alert("Airline data saved! ✅");
}

// Example save as image function
function saveAsImage() {
  html2canvas(document.getElementById('sheet')).then(canvas => {
    const link = document.createElement('a');
    link.download = 'discount-sheet.jpg';
    link.href = canvas.toDataURL();
    link.click();
  });
}
