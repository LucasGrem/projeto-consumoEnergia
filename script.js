/* ==========================================================
   Simulador de Consumo de Energia Residencial
   Vanilla JS • sem dependências • atualização em tempo real
   Fórmula: kWh = (Watts × Horas/dia × Dias no mês) / 1000
   ========================================================== */
(() => {
  'use strict';

  /* ---------- Constantes ---------- */
  const DIAS_MES = 30;
  const TARIFA_PADRAO = 0.75; // R$/kWh (referência SP, com impostos e bandeira verde)
  const MAX_QTD = 99;
  const MAX_WATTS = 20000;

  const APARELHOS = [
    { id: 'chuveiro',   nome: 'Chuveiro Elétrico', icone: '🚿', watts: 5500, qtd: 1, uso: 30, unidade: 'min',
      dica: 'Reduza o banho em alguns minutos e use a posição "verão" sempre que o clima permitir.' },
    { id: 'geladeira',  nome: 'Geladeira Simples', icone: '🧊', watts: 40,   qtd: 1, uso: 24, unidade: 'h',
      dica: 'Confira a borracha de vedação e nunca guarde alimentos quentes lá dentro.' },
    { id: 'ar',         nome: 'Ar-Condicionado',   icone: '❄️', watts: 1000, qtd: 1, uso: 4,  unidade: 'h',
      dica: 'Mantenha entre 23 °C e 24 °C, feche portas e janelas e limpe os filtros todo mês.' },
    { id: 'ventilador', nome: 'Ventilador',        icone: '🌀', watts: 80,   qtd: 1, uso: 6,  unidade: 'h',
      dica: 'Desligue ao sair do ambiente: o ventilador refresca pessoas, não o ar do cômodo.' },
    { id: 'led',        nome: 'Lâmpada LED',       icone: '💡', watts: 10,   qtd: 5, uso: 5,  unidade: 'h',
      dica: 'Aproveite a luz natural e apague as luzes ao sair do cômodo.' },
    { id: 'tv',         nome: 'Televisão',         icone: '📺', watts: 90,   qtd: 1, uso: 4,  unidade: 'h',
      dica: 'Desligue da tomada (ou use régua com interruptor) para evitar o stand-by.' },
    { id: 'maquina',    nome: 'Máquina de Lavar',  icone: '🧺', watts: 500,  qtd: 1, uso: 30, unidade: 'min',
      dica: 'Lave sempre com a capacidade máxima e evite ciclos extras.' },
    { id: 'ferro',      nome: 'Ferro de Passar',   icone: '👔', watts: 1000, qtd: 1, uso: 30, unidade: 'min',
      dica: 'Junte as roupas e passe tudo de uma vez; desligue um pouco antes do fim para aproveitar o calor residual.' }
  ];

  /* ---------- Elementos ---------- */
  const $ = (id) => document.getElementById(id);
  const el = {
    grade: $('aparelhos'),
    tarifa: $('tarifa'),
    resetTarifa: $('resetTarifa'),
    limpar: $('limpar'),
    totalKwh: $('totalKwh'),
    totalCusto: $('totalCusto'),
    detalhe: $('detalheCusto'),
    viloes: $('viloes'),
    vazio: $('vazio'),
    dica: $('dicaVilao'),
    resultados: $('resultados'),
    barra: $('barra'),
    barraValor: $('barraValor')
  };

  /* ---------- Formatadores ---------- */
  const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const num1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const inteiro = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });

  /* ---------- Estado ---------- */
  let estado = {};
  let tarifa = TARIFA_PADRAO;
  let custoTotal = 0;
  let resultadosVisiveis = false;

  /* ---------- Utilitários ---------- */
  const numero = (v) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  };
  const limitar = (n, min, max) => Math.min(max, Math.max(min, n));
  const maxUso = (unidade) => (unidade === 'min' ? 1440 : 24);
  const passoUso = (unidade) => (unidade === 'min' ? 5 : 0.5);

  function estadoInicial() {
    estado = {};
    APARELHOS.forEach((a) => {
      estado[a.id] = { ativo: false, watts: a.watts, qtd: a.qtd, uso: a.uso, unidade: a.unidade };
    });
  }

  /* ---------- Cálculo ---------- */
  // kWh/mês = (Watts × quantidade × horas/dia × dias no mês) / 1000
  function consumoMensal(s) {
    const horas = s.unidade === 'min'
      ? limitar(s.uso, 0, 1440) / 60
      : limitar(s.uso, 0, 24);
    const watts = limitar(s.watts, 0, MAX_WATTS);
    const qtd = limitar(s.qtd, 0, MAX_QTD);
    return (watts * qtd * horas * DIAS_MES) / 1000;
  }

  /* ---------- Renderização dos cartões ---------- */
  function cardHTML(a) {
    const max = maxUso(a.unidade);
    const passo = passoUso(a.unidade);
    return `
      <article class="card" data-id="${a.id}">
        <label class="card-head">
          <span class="card-icon" aria-hidden="true">${a.icone}</span>
          <span class="card-title">
            <strong>${a.nome}</strong>
            <small>${inteiro.format(a.watts)} W de potência</small>
          </span>
          <input type="checkbox" class="pick" data-campo="ativo" aria-label="Incluir ${a.nome} na simulação">
          <span class="switch" aria-hidden="true"></span>
        </label>
        <div class="card-body" hidden>
          <div class="field">
            <span class="field-label">Quantidade na casa</span>
            <div class="stepper">
              <button type="button" data-passo="-1" aria-label="Diminuir quantidade de ${a.nome}">−</button>
              <input type="number" inputmode="numeric" min="1" max="${MAX_QTD}" step="1" value="${a.qtd}"
                     data-campo="qtd" aria-label="Quantidade de ${a.nome}">
              <button type="button" data-passo="1" aria-label="Aumentar quantidade de ${a.nome}">+</button>
            </div>
          </div>
          <div class="field">
            <label for="${a.id}-uso">Uso diário</label>
            <div class="usage">
              <input id="${a.id}-uso" type="number" inputmode="decimal" min="0" max="${max}" step="${passo}"
                     value="${a.uso}" data-campo="uso">
              <select data-campo="unidade" aria-label="Unidade de tempo de ${a.nome}">
                <option value="h" ${a.unidade === 'h' ? 'selected' : ''}>horas</option>
                <option value="min" ${a.unidade === 'min' ? 'selected' : ''}>minutos</option>
              </select>
            </div>
          </div>
          <div class="field">
            <label for="${a.id}-watts">Potência (W)</label>
            <input id="${a.id}-watts" type="number" inputmode="numeric" min="1" max="${MAX_WATTS}" step="10"
                   value="${a.watts}" data-campo="watts">
          </div>
          <p class="card-result" data-resultado></p>
        </div>
      </article>`;
  }

  function montarGrade() {
    el.grade.innerHTML = APARELHOS.map(cardHTML).join('');
  }

  /* ---------- Atualização do painel ---------- */
  function atualizar() {
    const itens = APARELHOS
      .filter((a) => estado[a.id].ativo)
      .map((a) => ({ a, kwh: consumoMensal(estado[a.id]) }));

    const totalKwh = itens.reduce((soma, i) => soma + i.kwh, 0);
    custoTotal = totalKwh * tarifa;

    // Resultado individual de cada cartão ativo
    itens.forEach(({ a, kwh }) => {
      const alvo = el.grade.querySelector(`[data-id="${a.id}"] [data-resultado]`);
      if (alvo) alvo.textContent = `≈ ${num1.format(kwh)} kWh/mês · ${moeda.format(kwh * tarifa)}`;
    });

    // Totais
    el.totalKwh.textContent = num1.format(totalKwh);
    el.totalCusto.textContent = moeda.format(custoTotal);
    el.detalhe.textContent = custoTotal > 0
      ? `≈ ${moeda.format(custoTotal / DIAS_MES)} por dia · ${moeda.format(custoTotal * 12)} por ano`
      : '';

    renderViloes(itens, totalKwh);
    atualizarBarra();
  }

  function renderViloes(itens, totalKwh) {
    const ranking = itens.filter((i) => i.kwh > 0).sort((x, y) => y.kwh - x.kwh);

    el.vazio.hidden = ranking.length > 0;
    el.dica.hidden = ranking.length === 0;

    el.viloes.innerHTML = ranking.map((i, idx) => {
      const pct = (i.kwh / totalKwh) * 100;
      const rotulo = pct < 1 ? '&lt;1%' : `${inteiro.format(pct)}%`;
      return `
        <li class="villain">
          <span class="rank" aria-hidden="true">${idx + 1}</span>
          <div class="villain-main">
            <div class="villain-top">
              <strong>${i.a.icone} ${i.a.nome}</strong>
              <span>${moeda.format(i.kwh * tarifa)} · ${rotulo}</span>
            </div>
            <div class="bar" aria-hidden="true"><span style="--pct:${pct.toFixed(1)}"></span></div>
          </div>
        </li>`;
    }).join('');

    if (ranking.length) {
      const topo = ranking[0];
      const pct = (topo.kwh / totalKwh) * 100;
      el.dica.innerHTML =
        `<strong>${topo.a.icone} ${topo.a.nome}</strong> é o maior vilão da sua conta ` +
        `(${inteiro.format(pct)}% do total). ${topo.a.dica}`;
    }
  }

  function atualizarBarra() {
    el.barraValor.textContent = `${moeda.format(custoTotal)}/mês`;
    el.barra.hidden = !(custoTotal > 0) || resultadosVisiveis;
  }

  /* ---------- Interações nos cartões ---------- */
  function trocarUnidade(card, s, nova) {
    if (nova === s.unidade) return;
    const atual = limitar(s.uso, 0, maxUso(s.unidade));
    s.uso = nova === 'min' ? Math.round(atual * 60) : Math.round((atual / 60) * 100) / 100;
    s.unidade = nova;
    const campo = card.querySelector('[data-campo="uso"]');
    campo.max = maxUso(nova);
    campo.step = passoUso(nova);
    campo.value = s.uso;
  }

  function normalizar(input, s, campo) {
    if (campo === 'qtd') s.qtd = limitar(Math.round(numero(input.value)), 1, MAX_QTD);
    if (campo === 'watts') s.watts = limitar(Math.round(numero(input.value)), 1, MAX_WATTS);
    if (campo === 'uso') s.uso = limitar(numero(input.value), 0, maxUso(s.unidade));
    input.value = s[campo];
  }

  // Digitação: atualiza em tempo real sem reescrever o campo
  el.grade.addEventListener('input', (e) => {
    const campo = e.target.dataset.campo;
    if (!campo || campo === 'ativo' || campo === 'unidade') return;
    const card = e.target.closest('.card');
    estado[card.dataset.id][campo] = numero(e.target.value);
    atualizar();
  });

  // Alternar aparelho, trocar unidade ou finalizar edição (normaliza valores)
  el.grade.addEventListener('change', (e) => {
    const alvo = e.target;
    const campo = alvo.dataset.campo;
    if (!campo) return;
    const card = alvo.closest('.card');
    const s = estado[card.dataset.id];

    if (campo === 'ativo') {
      s.ativo = alvo.checked;
      card.classList.toggle('is-on', s.ativo);
      card.querySelector('.card-body').hidden = !s.ativo;
    } else if (campo === 'unidade') {
      trocarUnidade(card, s, alvo.value);
    } else {
      normalizar(alvo, s, campo);
    }
    atualizar();
  });

  // Botões − / + da quantidade
  el.grade.addEventListener('click', (e) => {
    const botao = e.target.closest('[data-passo]');
    if (!botao) return;
    const card = botao.closest('.card');
    const s = estado[card.dataset.id];
    const input = card.querySelector('[data-campo="qtd"]');
    s.qtd = limitar(Math.round(numero(input.value)) + Number(botao.dataset.passo), 1, MAX_QTD);
    input.value = s.qtd;
    atualizar();
  });

  /* ---------- Tarifa ---------- */
  el.tarifa.addEventListener('input', () => {
    tarifa = Math.max(0, numero(el.tarifa.value));
    atualizar();
  });

  el.tarifa.addEventListener('change', () => {
    if (el.tarifa.value === '' || numero(el.tarifa.value) <= 0) {
      tarifa = TARIFA_PADRAO;
      el.tarifa.value = TARIFA_PADRAO.toFixed(2);
      atualizar();
    }
  });

  el.resetTarifa.addEventListener('click', () => {
    tarifa = TARIFA_PADRAO;
    el.tarifa.value = TARIFA_PADRAO.toFixed(2);
    atualizar();
  });

  /* ---------- Limpar seleção ---------- */
  el.limpar.addEventListener('click', () => {
    estadoInicial();
    montarGrade();
    atualizar();
  });

  /* ---------- Barra fixa: some quando os resultados estão visíveis ---------- */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entrada]) => {
      resultadosVisiveis = entrada.isIntersecting;
      atualizarBarra();
    }, { threshold: 0.15 }).observe(el.resultados);
  }

  /* ---------- Início ---------- */
  estadoInicial();
  montarGrade();
  atualizar();
})();
