/* What the bots (and the page) say. Picked at random, never the same line twice in a row. */
window.FlockLines = {
  taunt: ['you delete my msg sir?', 'can i talk to the admin?', 'i have a proposal', 'check DM sir, proposal inside', 'where is my reward sir?', 'great project sir', 'admin pls reply', 'sir pls', 'nice pfp', 'like and retweet', 'tag 3 friends', 'check DMs'],
  miss: ['nice try', 'missed sir', 'close. not really', 'the wind did it, sure'],
  bonk: ['BONK!', 'QUACK!', 'THWACK!'],
  hurt: ['not the face', 'reported', 'ser why', 'my reward'],
  respawn: ['you delete my msg sir?', 'i would like to speak to the admin', 'i\'m back', 'new account, who dis', 'u cannot ban an idea', 'reloaded', 'fresh wallet', 'ser i was never gone'],
  witness: ['we lost one', 'nothing to see here', 'more for us', 'i\'m not with him', 'he was early', 'he had a proposal'],
  banterAfter: [
    ['bro.', 'BRO.', 'did that just happen', 'never happened'],
    ['you ok bro?', 'never better sir', 'you sure?', 'my portfolio says no but my heart says yes'],
    ['should we talk about it', 'no', 'ok'],
    ['ser, are we the baddies?', 'we are the bots, ser', 'oh'],
    ['i\'m not scared', 'me neither', 'why are you behind me then', 'strategic positioning'],
    ['let\'s never speak of this', 'speak of what', 'exactly'],
    ['thoughts and prayers', 'thoughts and prayers', 'thoughts and prayers', 'copy paste is not a thought, sir']
  ],
  banterIdle: [
    ['you delete my msg sir?', 'which one', 'the one with the link', 'that\'s why sir'],
    ['can i talk to the admin?', 'i am the admin', 'real admin?', 'forward my message to the bot and see', '…nvm'],
    ['i have a proposal', 'go on', 'what if we get paid to say gm', 'X said no to that in january', 'what if we say it louder'],
    ['i have a proposal', 'tap Ask the team, pick Idea or proposal', 'that\'s a lot of steps', 'it\'s three taps sir', 'i\'ll just DM the admin'],
    ['sir pls unban my cousin', 'which cousin', 'all 11 of them', 'that\'s one guy sir'],
    ['where is my reward sir?', 'what did you do sir?', 'i said gm 400 times', 'reward: you said gm 400 times'],
    ['where is my reward sir?', 'there is no reward sir', 'then why am i here', 'same question every day sir'],
    ['sir, where is my reward?', 'did the team confirm you helped?', 'i helped myself to the airdrop', 'that is not how it works sir'],
    ['did you finish the quest?', 'clicked all the buttons', 'what did it do?', 'no idea. 10 points though'],
    ['this pond is so active', 'it\'s just us three', 'and that\'s community'],
    ['who\'s the yellow guy', 'some human', 'ew', 'he writes his own posts'],
    ['bro what do you do all day', 'reply gm', 'and then?', 'reply gm again']
  ],
  combo2: ['2 DUCKS, 1 ROCK'],
  combo3: ['3 DUCKS, 1 ROCK']
};
window.FlockLine = (function () {
  var last = {};
  return function (cat) {
    var L = window.FlockLines[cat] || [''], i, tries = 0;
    do { i = Math.floor(Math.random() * L.length); } while (L.length > 1 && i === last[cat] && ++tries < 5);
    last[cat] = i; return L[i];
  };
})();
