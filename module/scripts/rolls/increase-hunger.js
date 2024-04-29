/* global ChatMessage, renderTemplate, game */

export async function _increaseHunger (actor, amount) {
  // Automatically add hunger to the actor on a failure (for rouse checks)
  const currentHunger = actor.system.hunger.value
  const newHungerAmount = Math.min(currentHunger + amount, 5)

  // If the roll would push the actor's hunger above 4 when their hunger was previously
  // below 5, send a message in the chat to warn them.
  if (newHungerAmount > 4 && currentHunger < 5) {
    renderTemplate('systems/vtm5e/templates/chat/chat-message.hbs', {
      name: game.i18n.localize('WOD5E.VTM.HungerFull1'),
      img: 'systems/vtm5e/assets/icons/dice/vampire/bestial-failure.png',
      description: game.i18n.localize('WOD5E.VTM.HungerFull2')
    }).then(html => {
      ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: html
      })
    })
  }

  // Update the actor with the new amount of rage
  actor.update({ 'system.hunger.value': newHungerAmount })
}
