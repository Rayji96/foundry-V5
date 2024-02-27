/* global ChatMessage, renderTemplate, game */

export async function _damageWillpower (actor, willpowerDamage) {
  // Get the actor's willpower and define it for convenience
  const actorWillpower = actor.system.willpower
  const maxWillpower = actorWillpower.max
  let aggrWillpower = actorWillpower.aggravated
  let superWillpower = actorWillpower.superficial

  // Loop to handle willpower damage tick by tick
  for (let i = 0; i < willpowerDamage; i++) {
    if ((superWillpower + aggrWillpower) < maxWillpower) {
      // If the superficial willpower ticket isn't completely full, then add a point
      superWillpower++
    } else if (aggrWillpower < maxWillpower) {
      // If there aren't any superficial boxes left, add an aggravated one
      // Define the new number of aggravated willpower damage
      // and subtract one from superficial
      superWillpower--
      aggrWillpower++
    } else {
      // If the willpower boxes are fully ticked with aggravated damage
      // then tell the chat and don't increase any values.

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

      // End the function here
      return
    }

    // Update the actor sheet
    await actor.update({
      'system.willpower': {
        superficial: superWillpower,
        aggravated: aggrWillpower
      }
    })
  }

  renderTemplate('systems/vtm5e/templates/chat/willpower-damage.hbs', {
    name: game.i18n.localize('WOD5E.Chat.WillpowerDamage'),
    img: 'systems/vtm5e/assets/icons/dice/vampire/bestial-failure.png',
    description: `${game.i18n.format('WOD5E.Chat.HasReceivedWillpowerDamage', {
      actor: actor.name,
      willpowerDamage
    })}`
  }).then(html => {
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: html
    })
  })
}
