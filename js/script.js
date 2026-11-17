function escaparHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

function lerStorage(chave) {
    try {
        const salvo = localStorage.getItem(chave);
        return salvo ? JSON.parse(salvo) : [];
    } catch (erro) {
        return [];
    }
}

let ultimoScroll = 0;
const header = document.querySelector('header');

if (header) {
    window.addEventListener('scroll', function () {
        const scrollAtual = window.scrollY;

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

const formAgenda = document.getElementById('formAgenda');

if (formAgenda) {
    let agendamentos = lerStorage('agendamentos');
    let posicaoEditando = -1;
    let barbeiroManual = false;

    const especialistaDoServico = {
        'Corte Clássico': 'Rodrigo',
        'Barba Completa': 'Rodrigo',
        'Corte + Barba': 'Thiago',
        'Degradê': 'Thiago',
        'Pigmentação': 'Felipe',
        'Sobrancelha': 'Felipe'
    };

    const duracaoDoServico = {
        'Corte Clássico': 40,
        'Barba Completa': 30,
        'Corte + Barba': 70,
        'Degradê': 45,
        'Pigmentação': 50,
        'Sobrancelha': 15,
        'Hidratação': 30
    };

    const fechamentoSabado = 18 * 60;
    const fechamentoSemana = 20 * 60;

    function guardar() {
        localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
    }

    function hoje() {
        const d = new Date();
        return d.getFullYear() + '-' +
            String(d.getMonth() + 1).padStart(2, '0') + '-' +
            String(d.getDate()).padStart(2, '0');
    }

    function horaAgora() {
        const d = new Date();
        return String(d.getHours()).padStart(2, '0') + ':' +
            String(d.getMinutes()).padStart(2, '0');
    }

    function diaDaSemana(dataIso) {
        const partes = dataIso.split('-');
        return new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2])).getDay();
    }

    function minutosDaHora(hora) {
        const partes = hora.split(':');
        return Number(partes[0]) * 60 + Number(partes[1]);
    }

    function verificarFuncionamento(novo) {
        const dia = diaDaSemana(novo.data);

        if (dia === 0) {
            return 'A barbearia fecha aos domingos. Escolha outro dia.';
        }

        const fechamento = dia === 6 ? fechamentoSabado : fechamentoSemana;
        const fim = minutosDaHora(novo.hora) + (duracaoDoServico[novo.servico] || 0);

        if (fim > fechamento) {
            const textoFechamento = dia === 6 ? '18h (sábado)' : '20h (segunda a sexta)';
            return 'Esse serviço (' + duracaoDoServico[novo.servico] + ' min) terminaria depois do fechamento, às ' +
                textoFechamento + '. Escolha um horário mais cedo.';
        }

        return '';
    }

    function existeConflito(novo) {
        for (let i = 0; i < agendamentos.length; i++) {
            if (i === posicaoEditando) continue;
            const a = agendamentos[i];
            if (a.barbeiro === novo.barbeiro && a.data === novo.data && a.hora === novo.hora) {
                return true;
            }
        }
        return false;
    }

    function restaurarMin() {
        document.getElementById('data').min = hoje();
    }
    restaurarMin();

    const dica = document.getElementById('dicaBarbeiro');

    function atualizarDica(servico) {
        const esp = especialistaDoServico[servico];
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
        barbeiroManual = this.value !== '';
    });

    formAgenda.addEventListener('reset', function () {
        barbeiroManual = false;
        dica.textContent = '';
        restaurarMin();
    });

    function mostrarLista() {
        const tabela = document.getElementById('lista');
        let html = '';

        document.getElementById('semRegistros').style.display =
            agendamentos.length === 0 ? 'block' : 'none';

        for (let i = 0; i < agendamentos.length; i++) {
            const a = agendamentos[i];

            const partes = a.data.split('-');
            const dataBr = partes[2] + '/' + partes[1] + '/' + partes[0];

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
        const a = agendamentos[i];
        document.getElementById('nome').value = a.nome;
        document.getElementById('telefone').value = a.telefone;
        document.getElementById('servico').value = a.servico;
        document.getElementById('barbeiro').value = a.barbeiro;
        document.getElementById('data').value = a.data;
        document.getElementById('hora').value = a.hora;

        document.getElementById('data').min = a.data < hoje() ? a.data : hoje();
        barbeiroManual = true;
        atualizarDica(a.servico);

        posicaoEditando = i;
        document.getElementById('btnSalvar').textContent = 'Atualizar';
    }

    function excluir(i) {
        if (confirm('Excluir este agendamento?')) {
            agendamentos.splice(i, 1);

            if (posicaoEditando === i) {
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

        const novo = {
            nome: document.getElementById('nome').value.trim(),
            telefone: document.getElementById('telefone').value,
            servico: document.getElementById('servico').value,
            barbeiro: document.getElementById('barbeiro').value,
            data: document.getElementById('data').value,
            hora: document.getElementById('hora').value
        };

        const original = posicaoEditando === -1 ? null : agendamentos[posicaoEditando];
        const mudouHorario = !original || original.data !== novo.data || original.hora !== novo.hora;

        if (mudouHorario && (novo.data < hoje() || (novo.data === hoje() && novo.hora <= horaAgora()))) {
            alert('Esse horário já passou. Escolha uma data e hora futuras.');
            return;
        }

        const avisoFuncionamento = verificarFuncionamento(novo);
        if (avisoFuncionamento !== '') {
            alert(avisoFuncionamento);
            return;
        }

        if (existeConflito(novo)) {
            alert('Já existe um agendamento com ' + novo.barbeiro +
                  ' nesse dia e horário. Escolha outro horário ou outro barbeiro.');
            return;
        }

        if (posicaoEditando === -1) {
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
        const botao = e.target.closest('button[data-acao]');
        if (!botao) return;

        const i = Number(botao.dataset.i);
        if (botao.dataset.acao === 'editar') editar(i);
        else if (botao.dataset.acao === 'excluir') excluir(i);
    });

    mostrarLista();
}

const formContato = document.getElementById('formContato');

if (formContato) {
    formContato.addEventListener('submit', function (e) {
        e.preventDefault();
        const nome = document.getElementById('nome').value;
        alert('Obrigado, ' + nome + '! Mensagem enviada.');
        formContato.reset();
    });
}

const formDep = document.getElementById('formDep');

if (formDep) {
    const depoimentosPadrao = [
        { nome: 'Carlos Menezes', nota: 5, texto: 'Melhor barba da região!' },
        { nome: 'André Silva', nota: 5, texto: 'Degradê impecável. Voltarei sempre.' },
        { nome: 'Marcos Pereira', nota: 4, texto: 'Ambiente top, agende com antecedência.' }
    ];

    const depoimentos = localStorage.getItem('depoimentos') === null
        ? depoimentosPadrao
        : lerStorage('depoimentos');

    function guardarDep() {
        localStorage.setItem('depoimentos', JSON.stringify(depoimentos));
    }

    function mostrarDepoimentos() {
        const lista = document.getElementById('lista');
        let html = '';

        for (let i = 0; i < depoimentos.length; i++) {
            const d = depoimentos[i];
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

        const novo = {
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
        const botao = e.target.closest('button[data-i]');
        if (botao) remover(Number(botao.dataset.i));
    });

    mostrarDepoimentos();
}

const botaoMenu = document.querySelector('.botao-menu');

if (botaoMenu) {
    botaoMenu.addEventListener('click', function () {
        const menu = document.getElementById('menu');
        const aberto = menu.classList.toggle('aberto');
        botaoMenu.setAttribute('aria-expanded', aberto);
    });
}
