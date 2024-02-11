/* global ChatMessage, renderTemplate, game */

export async function _damageWillpower (actor) {
  // Get the actor's willpower and define it for convenience
  const actorWillpower = actor.system.willpower
  const maxWillpower = actorWillpower.max
  const aggrWillpower = actorWillpower.aggravated
  const superWillpower = actorWillpower.superficial

  // If the willpower boxes are fully ticked with aggravated damage
  // then tell the chat and don't increase any values.
  if (aggrWillpower >= maxWillpower) {
    renderTemplate('systems/vtm5e/templates/chat/chat-message.hbs', {
      name: game.i18n.localize('WOD5E.Chat.WillpowerFullTitle'),
      img: 'systems/vtm5e/assets/icons/dice/vampire/bestial-failure.png',
      description: game.i18n.localize('WOD5E.Chat.WillpowerFull')
    }).then(html => {
      ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: html
      })
    })
  } else {
    // If the superficial willpower ticket isn't completely full, then add a point
    if ((superWillpower + aggrWillpower) < maxWillpower) {
      // If there are still superficial willpower boxes to tick, add it here

      // Define the new number of superficial willpower damage
      const newWillpower = superWillpower + 1

      // Update the actor sheet
      actor.update({ 'system.willpower.superficial': newWillpower })
    } else {
      // If there aren't any superficial boxes left, add an aggravated one

      // Define the new number of aggravated willpower damage
      // Superficial damage needs to be subtracted by 1 each time
      // a point of aggravated is added
      const newSuperWillpower = superWillpower - 1
      const newAggrWillpower = aggrWillpower + 1

      // Update the actor sheet
      actor.update({ 'system.willpower.superficial': newSuperWillpower })
      actor.update({ 'system.willpower.aggravated': newAggrWillpower })
    }
  }
}
