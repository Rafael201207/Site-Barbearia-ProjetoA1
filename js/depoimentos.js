var depoimentos = [
    { nome: 'Carlos Menezes', nota: 5, texto: 'Melhor barba da região!' },
    { nome: 'André Silva', nota: 5, texto: 'Degradê impecável. Voltarei sempre.' },
    { nome: 'Marcos Pereira', nota: 4, texto: 'Ambiente top, agende com antecedência.' }
];

var form = document.getElementById('formDep');

function mostrarDepoimentos() {
    var lista = document.getElementById('lista');
    lista.innerHTML = '';

    for (var i = 0; i < depoimentos.length; i++) {
        var d = depoimentos[i];
        lista.innerHTML += '<article class="dep">' +
            '<strong>' + d.nome + '</strong> - ' + d.nota + ' estrelas' +
            '<p>' + d.texto + '</p>' +
            '<button class="btn btn-sm btn-danger" onclick="remover(' + i + ')">Remover</button>' +
            '</article>';
    }
}

function remover(i) {
    depoimentos.splice(i, 1);
    mostrarDepoimentos();
}

form.addEventListener('submit', function (e) {
    e.preventDefault();

    var novo = {
        nome: document.getElementById('nome').value,
        nota: document.getElementById('nota').value,
        texto: document.getElementById('texto').value
    };

    depoimentos.push(novo);
    mostrarDepoimentos();
    form.reset();
});

mostrarDepoimentos();
