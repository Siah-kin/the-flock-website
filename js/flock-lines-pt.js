/* O que os bots (e a página) dizem. Escolhido ao acaso, nunca a mesma linha duas vezes seguidas. */
window.FlockLines = {
  taunt: ['apagou minha mensagem, chefe?', 'posso falar com o admin?', 'tenho uma proposta', 'chama no privado, chefe, a proposta está lá', 'cadê minha recompensa, chefe?', 'projeto incrível, chefe', 'admin, responde por favor', 'chefe, por favor', 'foto de perfil bonita', 'curte e retuíta', 'marca 3 amigos', 'olha o privado'],
  miss: ['boa tentativa', 'errou, chefe', 'quase. só que não', 'foi o vento, claro'],
  bonk: ['BONK!', 'QUACK!', 'TOC!'],
  hurt: ['na cara não', 'denunciado', 'mano, por quê?', 'minha recompensa'],
  respawn: ['apagou minha mensagem, chefe?', 'queria falar com o admin', 'voltei', 'conta nova, quem é?', 'não dá pra banir uma ideia', 'recarregado', 'carteira nova', 'mano, eu nunca saí'],
  witness: ['perdemos um', 'nada para ver aqui', 'mais pra gente', 'eu não tenho nada com ele', 'ele chegou cedo demais', 'ele tinha uma proposta'],
  banterAfter: [
    ['cara.', 'CARA.', 'isso aconteceu mesmo?', 'nunca aconteceu'],
    ['tá tudo bem, cara?', 'nunca estive melhor, chefe', 'tem certeza?', 'meu saldo diz que não, mas o coração diz que sim'],
    ['a gente devia conversar sobre isso', 'não', 'ok'],
    ['mano, a gente é o vilão?', 'a gente é o bot, mano', 'ah'],
    ['não estou com medo', 'eu também não', 'então por que você está atrás de mim?', 'posicionamento estratégico'],
    ['vamos fingir que isso nunca aconteceu', 'o quê?', 'exatamente'],
    ['meus sentimentos', 'meus sentimentos', 'meus sentimentos', 'copiar e colar não é sentimento, chefe']
  ],
  banterIdle: [
    ['apagou minha mensagem, chefe?', 'qual delas?', 'a que tinha o link', 'por isso, chefe'],
    ['posso falar com o admin?', 'eu sou o admin', 'admin de verdade?', 'encaminha minha mensagem pro bot e vê', '…deixa pra lá'],
    ['tenho uma proposta', 'pode falar', 'e se a gente ganhasse pra dizer bom dia', 'o X disse não a isso em janeiro', 'e se a gente falasse mais alto'],
    ['tenho uma proposta', 'toca em Ask the team, escolhe Idea or proposal', 'são muitos passos', 'são três toques, chefe', 'vou mandar DM pro admin'],
    ['chefe, desbane meu primo', 'qual primo?', 'todos os 11', 'é um cara só, chefe'],
    ['cadê minha recompensa, chefe?', 'o que você fez, chefe?', 'eu disse bom dia 400 vezes', 'recompensa: você disse bom dia 400 vezes'],
    ['cadê minha recompensa, chefe?', 'não tem recompensa, chefe', 'então por que eu tô aqui?', 'mesma pergunta todo dia, chefe'],
    ['chefe, cadê minha recompensa?', 'a equipe confirmou que você ajudou?', 'ajudei. a mim mesmo, no airdrop', 'não funciona assim, chefe'],
    ['terminou a missão?', 'cliquei em todos os botões', 'e o que isso fez?', 'não faço ideia. mas são 10 pontos'],
    ['esta lagoa tá bombando', 'somos só três', 'e isso é comunidade'],
    ['quem é o cara amarelo?', 'algum humano', 'eca', 'ele escreve os próprios posts'],
    ['cara, o que você faz o dia todo?', 'respondo bom dia', 'e depois?', 'respondo bom dia de novo']
  ],
  combo2: ['2 PATOS, 1 PEDRA'],
  combo3: ['3 PATOS, 1 PEDRA'],
  // "Spot the fake admin" round. Two or three ducks each hold a message: one is a scam, the others are the real team.
  // Each pair is one scam and its real counterpart. fake: what the scammer sends. real: what the team says.
  // tell: the one line the bar shows when the round ends, with the link after it. On a phone the line, the link and the
  // score share two lines, so keep a tell to about 30 characters. Keep fake and real lines near 38 characters: longer ones wrap to three lines on a phone.
  // Real and fake lines get the same punctuation and a mix of lengths, and "bot" and "group" turn up on both sides, so only the meaning separates them.
  fakeRound: [
    { fake: 'Me chama e manda sua frase secreta', real: 'Toque em Help, depois em Ask the team', tell: 'Sua frase secreta fica só com você' },
    { fake: 'Urgente: conecte sua carteira aqui', real: 'As respostas vêm pelo bot', tell: 'Suporte nunca pede carteira' },
    { fake: 'Resgate seu airdrop, link abaixo', real: 'Os avisos ficam fixados no grupo', tell: 'Notícia real fica no post fixado' },
    { fake: 'Vi sua dúvida. Me manda no privado', real: 'Equipe não chama primeiro. Pergunte no grupo', tell: 'Admin de verdade não chama primeiro' },
    { fake: 'Admin: pague 20 USDC pra ser ajudado', real: 'Suporte é grátis, pergunte no bot', tell: 'Pagar por ajuda é o golpe' },
    { fake: 'Suporte aqui. Mande seu código de acesso', real: 'Seu pedido ganha um número no bot', tell: 'Código de acesso é só seu' }
  ],
  fakeHint: 'Acerte o admin falso.',   // the bar's line while a round runs
  fakeSoft: 'Essa era a equipe de verdade',
  fakeLink: 'Confira uma mensagem com o bot',
  botUrl: 'https://t.me/Arctide_TheFlock_Bot',
  // The game's own interface lines (js/flock-game.js falls back to English when these are missing).
  ui: { hint: 'Puxe o pato para trás e solte.', help: 'As setas miram. Enter ou Espaço arremessa.', throwLabel: 'Jogar uma pedra em um pato-bot', live: 'Acertos: ' }
};
window.FlockLine = (function () {
  var last = {};
  return function (cat) {
    var L = window.FlockLines[cat] || [''], i, tries = 0;
    do { i = Math.floor(Math.random() * L.length); } while (L.length > 1 && i === last[cat] && ++tries < 5);
    last[cat] = i; return L[i];
  };
})();
