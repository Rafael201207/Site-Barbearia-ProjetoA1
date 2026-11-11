function escaparHtml(texto) {
    var div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

function lerStorage(chave) {
    try {
        var salvo = localStorage.getItem(chave);
        return salvo ? JSON.parse(salvo) : [];
    } catch (erro) {
        return [];
    }
}

var ultimoScroll = 0;
var header = document.querySelector('header');

if (header) {
    window.addEventListener('scroll', function () {
        var scrollAtual = window.scrollY;

        if (scrollAtual <= 0) {
            header.classList.remove('header-hidden');
            return;
        }

        if (scrollAtual > ultimoScroll && scrollAtual > header.offsetHeight) {
            header.classList.add('header-hidden');
        } else if (scrollAtual < ultimoScroll) {
            header.classList.remove('header-hidden');
        }

        ultimoScroll = scrollAtual;
    });
}

var formAgenda = document.getElementById('formAgenda');

if (formAgenda) {
    var agendamentos = lerStorage('agendamentos');
    var posicaoEditando = -1;

    function guardar() {
        localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
    }

    function mostrarLista() {
        var tabela = document.getElementById('lista');
        var html = '';

        document.getElementById('semRegistros').style.display =
            agendamentos.length == 0 ? 'block' : 'none';

        for (var i = 0; i < agendamentos.length; i++) {
            var a = agendamentos[i];

            var partes = a.data.split('-');
            var dataBr = partes[2] + '/' + partes[1] + '/' + partes[0];

            html += '<tr>' +
                '<td>' + escaparHtml(a.nome) + '</td>' +
                '<td>' + escaparHtml(a.telefone) + '</td>' +
                '<td>' + escaparHtml(a.servico) + '</td>' +
                '<td>' + escaparHtml(a.barbeiro) + '</td>' +
                '<td>' + dataBr + '</td>' +
                '<td>' + escaparHtml(a.hora) + '</td>' +
                '<td>' +
                    '<button class="btn btn-sm btn-warning" onclick="editar(' + i + ')">Editar</button> ' +
                    '<button class="btn btn-sm btn-danger" onclick="excluir(' + i + ')">Excluir</button>' +
                '</td>' +
                '</tr>';
        }

        tabela.innerHTML = html;
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

            if (posicaoEditando == i) {
                posicaoEditando = -1;
                document.getElementById('btnSalvar').textContent = 'Salvar';
                formAgenda.reset();
            } else if (posicaoEditando > i) {
                posicaoEditando--;
            }

            guardar();
            mostrarLista();
        }
    }

    formAgenda.addEventListener('submit', function (e) {
        e.preventDefault();

        var novo = {
            nome: document.getElementById('nome').value.trim(),
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
        formAgenda.reset();
    });

    document.getElementById('btnLimpar').addEventListener('click', function () {
        if (confirm('Apagar todos os agendamentos?')) {
            agendamentos = [];
            posicaoEditando = -1;
            document.getElementById('btnSalvar').textContent = 'Salvar';
            formAgenda.reset();
            guardar();
            mostrarLista();
        }
    });

    mostrarLista();
}

var formContato = document.getElementById('formContato');

if (formContato) {
    formContato.addEventListener('submit', function (e) {
        e.preventDefault();
        var nome = document.getElementById('nome').value;
        alert('Obrigado, ' + nome + '! Mensagem enviada.');
        formContato.reset();
    });
}

var formDep = document.getElementById('formDep');

if (formDep) {
    var depoimentos = [
        { nome: 'Carlos Menezes', nota: 5, texto: 'Melhor barba da região!' },
        { nome: 'André Silva', nota: 5, texto: 'Degradê impecável. Voltarei sempre.' },
        { nome: 'Marcos Pereira', nota: 4, texto: 'Ambiente top, agende com antecedência.' }
    ];

    function mostrarDepoimentos() {
        var lista = document.getElementById('lista');
        var html = '';

        for (var i = 0; i < depoimentos.length; i++) {
            var d = depoimentos[i];
            html += '<article class="dep">' +
                '<strong>' + escaparHtml(d.nome) + '</strong> - ' + d.nota + ' estrelas' +
                '<p>' + escaparHtml(d.texto) + '</p>' +
                '<button class="btn btn-sm btn-danger" onclick="remover(' + i + ')">Remover</button>' +
                '</article>';
        }

        lista.innerHTML = html;
    }

    function remover(i) {
        depoimentos.splice(i, 1);
        mostrarDepoimentos();
    }

    formDep.addEventListener('submit', function (e) {
        e.preventDefault();

        var novo = {
            nome: document.getElementById('nome').value.trim(),
            nota: Number(document.getElementById('nota').value),
            texto: document.getElementById('texto').value.trim()
        };

        depoimentos.push(novo);
        mostrarDepoimentos();
        formDep.reset();
    });

    mostrarDepoimentos();
}