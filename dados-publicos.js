const api = 'https://financeiro-ong.onrender.com/api/site-publico';
const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const percentual = new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 1 });
const statusGastos = document.querySelector('[data-status-gastos]');
const resumo = document.querySelector('[data-resumo]');
const chave = document.querySelector('[data-chave-pix]');
const copiar = document.querySelector('[data-copiar-pix]');
const retorno = document.querySelector('[data-retorno-pix]');
let chavePublicada = '';

function mostrarResumo(publicacao) {
    const status = resumo.querySelector('[data-status]');
    const valor = publicacao?.totalGastos;
    if (!publicacao?.disponivel || typeof valor !== 'number' || !Number.isFinite(valor)) {
        status.textContent = 'Aguardando publicação';
        return;
    }
    resumo.querySelector('[data-periodo]').textContent = publicacao.periodoFormatado;
    resumo.querySelector('[data-gastos]').textContent = moeda.format(valor);
    status.textContent = publicacao.statusAtualizacao || 'Publicado';
    status.dataset.atualizado = String(status.textContent.toLowerCase() === 'atualizado');
}

function mostrarGastos(publicacao, gastos) {
    if (!statusGastos) return;
    if (!publicacao?.disponivel) {
        statusGastos.textContent = 'Aguardando publicação.';
        return;
    }
    if (!Array.isArray(gastos) || gastos.length === 0) {
        statusGastos.textContent = 'Nenhum detalhamento por categoria disponível para esta publicação.';
        return;
    }
    const linhas = document.querySelector('[data-linhas-gastos]');
    for (const gasto of gastos) {
        const linha = linhas.insertRow();
        linha.insertCell().textContent = gasto.categoria;
        linha.insertCell().textContent = gasto.descricao || 'Despesas agrupadas nesta categoria.';
        linha.insertCell().textContent = moeda.format(gasto.total);
        linha.insertCell().textContent = publicacao.totalGastos > 0
            ? percentual.format(gasto.total / publicacao.totalGastos)
            : '—';
    }
    document.querySelector('[data-tabela-gastos]').hidden = false;
    statusGastos.textContent = `Gastos pagos no período de ${publicacao.periodoFormatado}.`;
}

function mostrarImagem(url) {
    const figura = document.querySelector('[data-imagem-publicacao]');
    if (!figura || typeof url !== 'string' || !url.startsWith('https://')) return;
    const imagem = figura.querySelector('img');
    imagem.addEventListener('load', () => { figura.hidden = false; }, { once: true });
    imagem.src = url;
}

copiar?.addEventListener('click', async () => {
    if (!chavePublicada) return;
    try {
        await navigator.clipboard.writeText(chavePublicada);
        retorno.textContent = 'Chave Pix copiada.';
    } catch {
        retorno.textContent = 'Selecione e copie a chave Pix acima manualmente.';
    }
});

async function carregarDados() {
    try {
        const resposta = await fetch(api, { credentials: 'omit', signal: AbortSignal.timeout(90000) });
        if (!resposta.ok) throw new Error('Dados públicos indisponíveis');
        const dados = await resposta.json();
        mostrarResumo(dados.publicacao);
        mostrarGastos(dados.publicacao, dados.gastosPorCategoria);
        mostrarImagem(dados.imagemUrl);
        if (chave) {
            if (dados.pixTemporariamenteIndisponivel === true) {
                chavePublicada = '';
                chave.textContent = 'Temporariamente indisponível';
            } else {
                chavePublicada = typeof dados.chavePix === 'string' ? dados.chavePix.trim() : '';
                chave.textContent = chavePublicada || 'Chave Pix ainda não publicada.';
            }
            copiar.disabled = !chavePublicada;
        }
    } catch {
        resumo.querySelector('[data-status]').textContent = 'Indisponível no momento';
        if (statusGastos) statusGastos.textContent = 'Detalhamento indisponível no momento.';
        if (chave) chave.textContent = 'Chave Pix indisponível. Tente novamente mais tarde.';
    }
}

carregarDados();
