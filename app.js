(() => {
  'use strict';
  const cfg = window.JBT_CONFIG?.webhooks || {};
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const now = new Date();
  $('#year').textContent = String(now.getFullYear());
  const day = (offset) => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + offset); return d.toISOString().slice(0, 10); };
  const localeDate = (value) => new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short' }).format(new Date(value + 'T12:00:00'));
  const sampleGames = [
    { id:'demo-01', title:'Bola ao fim da tarde', sport:'Futebol', city:'Porto', venue:'Parque Desportivo de Ramalde', date:day(1), time:'19:30', spots:3, price:5 },
    { id:'demo-02', title:'Futsal sem desculpas', sport:'Futsal', city:'Lisboa', venue:'Pavilhão de Alvalade', date:day(2), time:'21:00', spots:2, price:4 },
    { id:'demo-03', title:'Ponto de encontro', sport:'Padel', city:'Porto', venue:'Clube de Padel', date:day(3), time:'18:00', spots:1, price:8 },
    { id:'demo-04', title:'Cestos e boa energia', sport:'Basquetebol', city:'Braga', venue:'Pavilhão Municipal', date:day(4), time:'20:00', spots:4, price:3 },
    { id:'demo-05', title:'Derby de amigos', sport:'Futebol', city:'Coimbra', venue:'Campo Universitário', date:day(5), time:'18:30', spots:5, price:6 },
    { id:'demo-06', title:'Duplas em campo', sport:'Padel', city:'Lisboa', venue:'Centro Desportivo', date:day(6), time:'10:00', spots:0, price:10 }
  ];
  let games = sampleGames;
  let selectedGame = null;
  let modalMode = 'booking';
  const menuToggle = $('#menuToggle');
  menuToggle.addEventListener('click', () => { const open = $('#navLinks').classList.toggle('open'); menuToggle.setAttribute('aria-expanded', String(open)); });
  $$('#navLinks a').forEach(a => a.addEventListener('click', () => { $('#navLinks').classList.remove('open'); menuToggle.setAttribute('aria-expanded', 'false'); }));
  function element(tag, className, content) { const node = document.createElement(tag); if (className) node.className = className; if (content !== undefined) node.textContent = String(content); return node; }
  function renderGames() {
    const sport = $('#sportFilter').value;
    const city = $('#cityFilter').value;
    const dateFilter = $('#dateFilter').value;
    const today = day(0), tomorrow = day(1), week = day(7);
    const filtered = games.filter(g => (!sport || g.sport === sport) && (!city || g.city === city) && (!dateFilter || (dateFilter === 'today' && g.date === today) || (dateFilter === 'tomorrow' && g.date === tomorrow) || (dateFilter === 'week' && g.date >= today && g.date <= week)));
    const list = $('#gamesList'); list.replaceChildren();
    $('#gamesCount').textContent = `${filtered.length} ${filtered.length === 1 ? 'jogo encontrado' : 'jogos encontrados'}`;
    if (!filtered.length) { list.append(element('div', 'empty-state', 'Ainda não há jogos com estes filtros. Experimenta outra modalidade ou cria o teu próprio jogo.')); return; }
    filtered.forEach(game => {
      const card = element('article', 'game-card');
      const top = element('div', 'game-card-top');
      top.append(element('span', 'sport-pill', ({ Futebol:'⚽', Futsal:'🥅', Basquetebol:'🏀', Padel:'🎾' })[game.sport] + ' ' + game.sport));
      top.append(element('span', 'spots-pill' + (game.spots === 0 ? ' full' : ''), game.spots ? `${game.spots} ${game.spots === 1 ? 'vaga' : 'vagas'} disponíveis` : 'Lotado'));
      card.append(top, element('h3', '', game.title));
      const details = element('div', 'game-details');
      details.append(element('span', '', `⌖ ${game.venue}, ${game.city}`), element('span', '', `◷ ${localeDate(game.date)} · ${game.time}`)); card.append(details);
      const foot = element('div', 'game-card-foot');
      const price = element('div', 'price', `${Number(game.price).toLocaleString('pt-PT',{style:'currency',currency:'EUR'})}`);
      price.append(element('small', '', 'por pessoa'));
      const button = element('button', 'join-btn', game.spots ? 'Quero jogar ↗' : 'Sem vagas'); button.type = 'button'; button.disabled = !game.spots;
      button.addEventListener('click', () => openModal('booking', game)); foot.append(price, button); card.append(foot); list.append(card);
    });
  }
  $('#applyFilters').addEventListener('click', renderGames);
  $$('.sport-card').forEach(card => card.addEventListener('click', () => { $('#sportFilter').value = card.dataset.sport; renderGames(); $('#jogos').scrollIntoView({ behavior:'smooth' }); }));
  function setFeedback(text, kind = '') { const target = $('#formFeedback'); target.textContent = text; target.className = 'form-feedback ' + kind; }
  function openModal(mode, game = null) {
    modalMode = mode; selectedGame = game;
    $('#actionForm').reset(); setFeedback('');
    const create = mode === 'create'; $('#createFields').hidden = !create;
    $$('#createFields input, #createFields select').forEach(input => { input.disabled = !create; input.required = create && input.id !== 'createPrice'; });
    $('#gameId').value = game?.id || '';
    $('#modalTitle').textContent = create ? 'Organiza o teu jogo' : 'Reserva o teu lugar';
    $('#modalKicker').textContent = create ? 'TU ÉS O ORGANIZADOR' : 'ESTÁS QUASE EM CAMPO';
    $('#modalSubtitle').textContent = create ? 'Diz-nos onde e quando. O pedido será enviado ao teu workflow.' : `${game?.sport || 'Jogo'} · ${game?.title || ''} · ${game?.city || ''}`;
    $('#formSubmit').textContent = create ? 'Criar jogo ↗' : 'Pedir inscrição ↗';
    $('#createDate').min = day(0); $('#createDate').value = day(1);
    $('#modalBackdrop').hidden = false; document.body.style.overflow = 'hidden'; $('#personName').focus();
  }
  function closeModal() { $('#modalBackdrop').hidden = true; document.body.style.overflow = ''; }
  $('#closeModal').addEventListener('click', closeModal);
  $('#modalBackdrop').addEventListener('click', e => { if (e.target.id === 'modalBackdrop') closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeChat(); } });
  ['openCreate','openCreateBottom','openCreateCta'].forEach(id => $('#' + id).addEventListener('click', () => openModal('create')));
  async function request(url, payload, method = 'POST') {
    const response = await fetch(url, { method, mode: 'cors', headers: { 'Content-Type': 'application/json' }, ...(method === 'POST' ? { body: JSON.stringify(payload) } : {}), signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const contentType = response.headers.get('content-type') || '';
    return contentType.includes('application/json') ? response.json() : response.text();
  }
  $('#actionForm').addEventListener('submit', async e => {
    e.preventDefault();
    const endpoint = modalMode === 'create' ? cfg.createGame : cfg.booking;
    if (!endpoint) { setFeedback('Modo de demonstração: configura o webhook em config.js para enviar pedidos reais.', 'error'); return; }
    const data = new FormData(e.currentTarget);
    const payload = { action:modalMode === 'create' ? 'create_game' : 'booking', source:'JogaBonitoTuga', timestamp:new Date().toISOString(), name:String(data.get('name') || '').trim(), email:String(data.get('email') || '').trim(), phone:String(data.get('phone') || '').trim() };
    if (modalMode === 'create') Object.assign(payload, { sport:data.get('sport'), city:data.get('city'), venue:data.get('venue'), date:data.get('date'), time:data.get('time'), capacity:Number(data.get('capacity')), price:Number(data.get('price')) });
    else Object.assign(payload, { gameId:selectedGame?.id, game:selectedGame });
    const button = $('#formSubmit'); button.disabled = true; button.textContent = 'A enviar…';
    try {
      const result = await request(endpoint, payload);
      if (typeof result === 'object' && result?.success === false) throw new Error(result.message || 'Pedido recusado');
      setFeedback((typeof result === 'object' && result?.message) || 'Pedido recebido. Aguarda a confirmação da organização.', 'success'); e.currentTarget.reset();
    } catch (err) { setFeedback('Não foi possível enviar. Verifica a ligação, a configuração do n8n e as permissões CORS.', 'error'); console.error('JBT webhook error:', err); }
    finally { button.disabled = false; button.textContent = modalMode === 'create' ? 'Criar jogo ↗' : 'Pedir inscrição ↗'; }
  });
  const chatLauncher = $('#chatLauncher'); const chatPanel = $('#chatPanel');
  function openChat() { chatPanel.hidden = false; chatLauncher.setAttribute('aria-expanded', 'true'); $('#chatInput').focus(); }
  function closeChat() { chatPanel.hidden = true; chatLauncher.setAttribute('aria-expanded', 'false'); }
  chatLauncher.addEventListener('click', () => chatPanel.hidden ? openChat() : closeChat());
  $('#closeChat').addEventListener('click', closeChat);
  $$('[data-open-chat]').forEach(b => b.addEventListener('click', openChat));
  function addMessage(message, from) { const node = element('div', 'chat-bubble ' + from, message); $('#chatMessages').append(node); $('#chatMessages').scrollTop = $('#chatMessages').scrollHeight; return node; }
  const sessionKey = 'jbt_chat_session';
  let sessionId;
  try { sessionId = sessionStorage.getItem(sessionKey) || (globalThis.crypto?.randomUUID?.() || `session-${Date.now()}`); sessionStorage.setItem(sessionKey, sessionId); }
  catch { sessionId = `session-${Date.now()}`; }
  async function sendChat(message) {
    if (!message.trim()) return;
    addMessage(message.trim(), 'user'); $('#chatInput').value = '';
    if (!cfg.chat) { addMessage('O chat está em modo de demonstração. Para ativar respostas automáticas, adiciona o URL do webhook de chat do n8n no ficheiro config.js.', 'bot'); return; }
    const send = $('#chatSend'); send.disabled = true;
    const thinking = addMessage('A escrever…', 'bot');
    try {
      const result = await request(cfg.chat, { action:'chat', source:'JogaBonitoTuga', sessionId, message:message.trim(), timestamp:new Date().toISOString() });
      const content = typeof result === 'string' ? result : (result?.reply || result?.output || result?.message || result?.text || result?.response || (Array.isArray(result) && result[0]?.output) || 'Recebi a tua mensagem, mas o workflow não devolveu uma resposta de texto.');
      thinking.textContent = String(content);
    } catch (err) { thinking.textContent = 'O suporte está temporariamente indisponível. Volta a tentar mais tarde.'; console.error('JBT chat webhook error:', err); }
    finally { send.disabled = false; $('#chatMessages').scrollTop = $('#chatMessages').scrollHeight; }
  }
  $('#chatForm').addEventListener('submit', e => { e.preventDefault(); sendChat($('#chatInput').value); });
  $$('[data-chat-suggestion]').forEach(b => b.addEventListener('click', () => { openChat(); sendChat(b.dataset.chatSuggestion); }));
  async function loadGames() {
    if (!cfg.games) { renderGames(); return; }
    try {
      const result = await request(cfg.games, undefined, 'GET');
      const items = Array.isArray(result) ? result : result?.games;
      if (!Array.isArray(items)) throw new Error('Formato de jogos inválido');
      games = items.filter(g => g && typeof g.id === 'string' && typeof g.title === 'string' && typeof g.sport === 'string' && typeof g.city === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(g.date) && /^\d{2}:\d{2}$/.test(g.time)).map(g => ({ id:g.id, title:g.title, sport:g.sport, city:g.city, venue:String(g.venue || 'Local a confirmar'), date:g.date, time:g.time, spots:Math.max(0,Number(g.spots)||0), price:Math.max(0,Number(g.price)||0) }));
      $('.demo-notice').textContent = 'Jogos carregados através do n8n';
    } catch (err) { $('.demo-notice').textContent = 'Não foi possível carregar os jogos reais · a mostrar demonstração'; console.error('JBT games webhook error:', err); }
    renderGames();
  }
  loadGames();
})();
