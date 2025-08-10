document.getElementById('toggleDetails').addEventListener('click', () => {
  const detailsSection = document.getElementById('details');
  const isHidden = getComputedStyle(detailsSection).display === 'none';
  detailsSection.style.display = isHidden ? 'block' : 'none';
  document.getElementById('toggleDetails').textContent = isHidden
    ? 'Hide Detailed Topics'
    : 'Show Detailed Topics';
});
