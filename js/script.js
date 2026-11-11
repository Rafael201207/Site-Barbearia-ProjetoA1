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

    var especialistaDoServico = {
        'Corte Clássico': 'Rodrigo',
        'Barba Completa': 'Rodrigo',
        'Corte + Barba': 'Thiago',
        'Degradê': 'Thiago',
        'Pigmentação': 'Felipe',
        'Sobrancelha': 'Felipe'
    };

    var barbeiroManual = false;

    function guardar() {
        localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
    }

    function hoje() {
        var d = new Date();
        return d.getFullYear() + '-' +
            String(d.getMonth() + 1).padStart(2, '0') + '-' +
            String(d.getDate()).padStart(2, '0');
    }

    function horaAgora() {
        var d = new Date();
        return String(d.getHours()).padStart(2, '0') + ':' +
            String(d.getMinutes()).padStart(2, '0');
    }

    function existeConflito(novo) {
        for (var i = 0; i < agendamentos.length; i++) {
            if (i == posicaoEditando) continue;
            var a = agendamentos[i];
            if (a.barbeiro == novo.barbeiro && a.data == novo.data && a.hora == novo.hora) {
                return true;
            }
        }
        return false;
    }

    function restaurarMin() {
        document.getElementById('data').min = hoje();
    }
    restaurarMin();

    var dica = document.getElementById('dicaBarbeiro');

    function atualizarDica(servico) {
        var esp = especialistaDoServico[servico];
        dica.textContent = esp
            ? 'Especialista neste serviço: ' + esp + ' (você pode escolher outro barbeiro).'
            : '';
    }

    document.getElementById('servico').addEventListener('change', function () {
        if (!barbeiroManual) {
            document.getElementById('barbeiro').value = especialistaDoServico[this.value] || '';
        }
        atualizarDica(this.value);
    });

    document.getElementById('barbeiro').addEventListener('change', function () {
        barbeiroManual = this.value != '';
    });

    formAgenda.addEventListener('reset', function () {
        barbeiroManual = false;
        dica.textContent = '';
        restaurarMin();
    });

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
                    '<button class="btn btn-sm btn-warning" data-acao="editar" data-i="' + i + '">Editar</button> ' +
                    '<button class="btn btn-sm btn-danger" data-acao="excluir" data-i="' + i + '">Excluir</button>' +
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

        // Se o agendamento for antigo, o calendário precisa aceitar a data original
        document.getElementById('data').min = a.data < hoje() ? a.data : hoje();
        barbeiroManual = true;
        atualizarDica(a.servico);

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

        var original = posicaoEditando == -1 ? null : agendamentos[posicaoEditando];
        var mudouHorario = !original || original.data != novo.data || original.hora != novo.hora;

        if (mudouHorario && (novo.data < hoje() || (novo.data == hoje() && novo.hora <= horaAgora()))) {
            alert('Esse horário já passou. Escolha uma data e hora futuras.');
            return;
        }

        if (existeConflito(novo)) {
            alert('Já existe um agendamento com ' + novo.barbeiro +
                  ' nesse dia e horário. Escolha outro horário ou outro barbeiro.');
            return;
        }

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

    document.getElementById('lista').addEventListener('click', function (e) {
        var botao = e.target.closest('button[data-acao]');
        if (!botao) return;

        var i = Number(botao.dataset.i);
        if (botao.dataset.acao == 'editar') editar(i);
        else if (botao.dataset.acao == 'excluir') excluir(i);
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
    var depoimentosPadrao = [
        { nome: 'Carlos Menezes', nota: 5, texto: 'Melhor barba da região!' },
        { nome: 'André Silva', nota: 5, texto: 'Degradê impecável. Voltarei sempre.' },
        { nome: 'Marcos Pereira', nota: 4, texto: 'Ambiente top, agende com antecedência.' }
    ];

    var depoimentos = localStorage.getItem('depoimentos') === null
        ? depoimentosPadrao
        : lerStorage('depoimentos');

    function guardarDep() {
        localStorage.setItem('depoimentos', JSON.stringify(depoimentos));
    }

    function mostrarDepoimentos() {
        var lista = document.getElementById('lista');
        var html = '';

        for (var i = 0; i < depoimentos.length; i++) {
            var d = depoimentos[i];
            html += '<article class="dep">' +
                '<strong>' + escaparHtml(d.nome) + '</strong> - ' + d.nota + ' estrelas' +
                '<p>' + escaparHtml(d.texto) + '</p>' +
                '<button class="btn btn-sm btn-danger" data-i="' + i + '">Remover</button>' +
                '</article>';
        }

        lista.innerHTML = html;
    }

    function remover(i) {
        depoimentos.splice(i, 1);
        guardarDep();
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
        guardarDep();
        mostrarDepoimentos();
        formDep.reset();
    });

    document.getElementById('lista').addEventListener('click', function (e) {
        var botao = e.target.closest('button[data-i]');
        if (botao) remover(Number(botao.dataset.i));
    });

    mostrarDepoimentos();
}
