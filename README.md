# JogaBonitoTuga ⚽

Landing page estática e responsiva para encontrar e organizar jogos de **futebol, futsal, basquetebol e padel**. HTML, CSS e JavaScript puro — compatível com **GitHub Pages** e com integração preparada para **n8n**.

## Conteúdo

- `index.html` — estrutura do site, secções, chat e formulário.
- `styles.css` — layout e estilos adaptativos.
- `app.js` — filtros, cartões, modais, pedidos HTTP e chat.
- `config.js` — URLs públicos dos webhooks (inicialmente vazios).
- `.nojekyll` — evita processamento por Jekyll no GitHub Pages.

## 1. Publicar no GitHub Pages

1. Cria um repositório no GitHub, por exemplo `jogabonitotuga`.
2. Envia **os ficheiros desta pasta para a raiz** do repositório (não a pasta por fora).
3. Vai a **Settings → Pages → Build and deployment**.
4. Em **Source**, escolhe **Deploy from a branch**; seleciona **main** e **/(root)**, e guarda.
5. Após a publicação, o endereço típico será `https://TEU-UTILIZADOR.github.io/jogabonitotuga/`.

É possível testar localmente abrindo `index.html`, mas é recomendável um pequeno servidor local (`python3 -m http.server 8000`) para simular melhor o alojamento web.

> Este projeto está **pronto para publicação**, mas não foi publicado automaticamente. É preciso acesso à tua conta/repositório GitHub para efetuar o deploy.

## 2. Integrar com n8n

No ficheiro `config.js`, preenche apenas os **URLs públicos** dos webhooks de produção:

```js
window.JBT_CONFIG = {
  webhooks: {
    chat: 'https://SEU-N8N/webhook/jbt-chat',
    booking: 'https://SEU-N8N/webhook/jbt-booking',
    createGame: 'https://SEU-N8N/webhook/jbt-create-game',
    games: 'https://SEU-N8N/webhook/jbt-games'
  }
};
```

Deixa os URLs vazios para testar em modo demonstração. Usa os endpoints **Production URL** do n8n e mantém os workflows **ativos**. O n8n deve estar servido por **HTTPS** e permitir requisições **CORS** da origem do GitHub Pages (incluindo respostas e preflight `OPTIONS` quando aplicável). Podes usar um reverse proxy ou outro backend para tratar CORS e segurança se necessário.

### Endpoints esperados

| Função | Método | Corpo / resposta |
|---|---|---|
| Chat | `POST` | Recebe `{ action: "chat", source, sessionId, message, timestamp }`. Devolve `{ "reply": "Olá!" }` (ou `output`, `message`, `text`, `response`). |
| Inscrição | `POST` | Recebe `{ action: "booking", source, timestamp, name, email, phone, gameId, game }`. Devolve `{ "success": true }`. |
| Criar jogo | `POST` | Recebe `{ action: "create_game", source, timestamp, name, email, phone, sport, city, venue, date, time, capacity, price }`. Devolve `{ "success": true }`. |
| Lista de jogos | `GET` | Devolve `{ "games": [ ... ] }` ou um array direto. |

### Exemplo de resposta do endpoint de jogos

```json
{
  "games": [
    {
      "id": "jogo-001",
      "title": "Futsal às quartas",
      "sport": "Futsal",
      "city": "Porto",
      "venue": "Pavilhão Central",
      "date": "2026-12-02",
      "time": "20:30",
      "spots": 4,
      "price": 5
    }
  ]
}
```

### Fluxos sugeridos no n8n

**Chat:** Webhook (POST) → agente de IA / lógica de suporte → Respond to Webhook com JSON `{ "reply": "..." }`.

**Inscrição:** Webhook (POST) → validação de campos e vagas (no servidor) → base de dados → notificação / email → Respond to Webhook `{ "success": true }`.

**Criar jogo:** Webhook (POST) → validação / moderação → base de dados → Respond to Webhook `{ "success": true }`.

**Listar jogos:** Webhook (GET) → consulta a base de dados → Respond to Webhook `{ "games": [...] }`.

### Segurança e limites a ter em conta

- O GitHub Pages só serve ficheiros estáticos; **não é um backend**. Inscrições, inventário de vagas e criação de jogos dependem de workflows e armazenamento externo.
- Nunca coloques chaves secretas, tokens privados ou credenciais no HTML/JS. O `config.js` é público.
- Valida tudo novamente no n8n/backend, aplica *rate limiting*, proteção anti-spam e, se necessário, autenticação. O cliente não garante que as vagas ainda existam.
- Os dados pessoais (nome, email, telefone) devem ter tratamento e retenção adequados ao RGPD. Adiciona política de privacidade e informação do responsável pelo tratamento antes de lançar ao público.
- Os jogos mostrados sem webhook são **exemplos fictícios**, para testar a interface, e os formulários não enviam nada enquanto não houver endpoint configurado.
- As fotografias são carregadas a partir do Unsplash e os tipos de letra a partir do Google Fonts; estas partes dependem de serviços externos.

## 3. Personalizar

Altera textos e secções em `index.html`; cores e imagens em `styles.css` (`--green`, `--dark` e URLs de fundos). Para personalizar o formato das mensagens, edita as funções de envio em `app.js`.
