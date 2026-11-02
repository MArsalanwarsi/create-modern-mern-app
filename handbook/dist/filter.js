const input = document.querySelector('#search');
input.addEventListener('input', () => {
  const query = input.value.trim().toLowerCase();
  for (const link of document.querySelectorAll('.navlink')) {
    link.hidden = !link.textContent.toLowerCase().includes(query);
  }
});
