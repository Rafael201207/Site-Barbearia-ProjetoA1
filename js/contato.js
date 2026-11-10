var form = document.getElementById('formContato');

form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nome = document.getElementById('nome').value;
    alert('Obrigado, ' + nome + '! Mensagem enviada.');
    form.reset();
});
