let ultimoScroll = 0;
const header = document.querySelector("header");

window.addEventListener("scroll", () => {
    const scrollAtual = window.scrollY;

    if (scrollAtual <= 0) {
        header.classList.remove("header-hidden");
        return;
    }

    if (scrollAtual > ultimoScroll && scrollAtual > header.offsetHeight) {
        header.classList.add("header-hidden");
    } 
    else if (scrollAtual < ultimoScroll) {
        header.classList.remove("header-hidden");
    }

    ultimoScroll = scrollAtual;
});

var agendamentos = [];
var salvos = localStorage.getItem('agendamentos');
if (salvos != null) {
    agendamentos = JSON.parse(salvos);
}

var posicaoEditando = -1;
var form = document.getElementById('formAgenda');

function guardar() {
    localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
}

function mostrarLista() {
    var tabela = document.getElementById('lista');
    tabela.innerHTML = '';

    if (agendamentos.length == 0) {
        document.getElementById('semRegistros').style.display = 'block';
    } else {
        document.getElementById('semRegistros').style.display = 'none';
    }

    for (var i = 0; i < agendamentos.length; i++) {
        var a = agendamentos[i];

        // a data vem como 2026-11-08, aqui vira 08/11/2026
        var partes = a.data.split('-');
        var dataBr = partes[2] + '/' + partes[1] + '/' + partes[0];

        tabela.innerHTML += '<tr>' +
            '<td>' + a.nome + '</td>' +
            '<td>' + a.telefone + '</td>' +
            '<td>' + a.servico + '</td>' +
            '<td>' + a.barbeiro + '</td>' +
            '<td>' + dataBr + '</td>' +
            '<td>' + a.hora + '</td>' +
            '<td>' +
                '<button class="btn btn-sm btn-warning" onclick="editar(' + i + ')">Editar</button> ' +
                '<button class="btn btn-sm btn-danger" onclick="excluir(' + i + ')">Excluir</button>' +
            '</td>' +
            '</tr>';
    }
}

function editar(i) {
    var a = agendamentos[i];
    document.getElementById('nome').value = a.nome;
    document.getElementById('telefone').value = a.telefone;
    document.getElementById('servico').value = a.servico;
    document.getElementById('barbeiro').value = a.barbeiro;
    document.getElementById('data').value = a.data;
    document.getElementById('hora').value = a.hora;

    posicaoEditando = i;
    document.getElementById('btnSalvar').textContent = 'Atualizar';
}

function excluir(i) {
    if (confirm('Excluir este agendamento?')) {
        agendamentos.splice(i, 1);
        guardar();
        mostrarLista();
    }
}

form.addEventListener('submit', function (e) {
    e.preventDefault();

    var novo = {
        nome: document.getElementById('nome').value,
        telefone: document.getElementById('telefone').value,
        servico: document.getElementById('servico').value,
        barbeiro: document.getElementById('barbeiro').value,
        data: document.getElementById('data').value,
        hora: document.getElementById('hora').value
    };

    if (posicaoEditando == -1) {
        agendamentos.push(novo);
        alert('Agendamento salvo!');
    } else {
        agendamentos[posicaoEditando] = novo;
        posicaoEditando = -1;
        document.getElementById('btnSalvar').textContent = 'Salvar';
        alert('Agendamento atualizado!');
    }

    guardar();
    mostrarLista();
    form.reset();
});

document.getElementById('btnLimpar').addEventListener('click', function () {
    if (confirm('Apagar todos os agendamentos?')) {
        agendamentos = [];
        guardar();
        mostrarLista();
    }
});

mostrarLista();

var form = document.getElementById('formContato');

form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nome = document.getElementById('nome').value;
    alert('Obrigado, ' + nome + '! Mensagem enviada.');
    form.reset();
});

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