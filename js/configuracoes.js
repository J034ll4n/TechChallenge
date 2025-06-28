let bgEscolhido = null;

// Clique nas imagens prontas
document.querySelectorAll('.bg-option').forEach(img => {
  img.addEventListener('click', () => {
    bgEscolhido = img.dataset.bg;
    document.getElementById('preview-uploaded-bg').style.display = 'none';
  });
});

// Upload personalizado
document.getElementById('inputUpload').addEventListener('change', function() {
  const file = this.files[0];
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = function(e) {
      bgEscolhido = e.target.result;
      const preview = document.getElementById('preview-uploaded-bg');
      preview.src = bgEscolhido;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
});

// Salvar plano de fundo
document.getElementById('btnSalvarBg').addEventListener('click', () => {
  if (!bgEscolhido) {
    alert('Escolha ou envie uma imagem antes de salvar.');
    return;
  }
  localStorage.setItem('planoFundoAluno', bgEscolhido);
  alert('Plano de fundo salvo com sucesso!');
});
