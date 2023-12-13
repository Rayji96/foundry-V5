/* global ChatMessage, Roll, game, renderTemplate */

// Function to roll dice
// numDice = Number of dice the function will roll
// actor = Actor's data
// label = Text that appears at the head of the ChatMessage
// difficulty = The amount of successes required for a given roll
// hungerDice = Will roll hunger dice, if value is greater than 0
// increaseHunger = Will increase the actor's hunger if no successes are rolled, if true
// subtractWillpower = Subtracts a point of willpower, always, if true
// rerollHunger = If the roll needs to have hunger dice rerolled on a failure, if true
export async function rollDice (numDice, actor, label = '', difficulty = 0, hungerDice = 0, increaseHunger = false, subtractWillpower = false, rerollHunger = false) {
  // Roll defining and evaluating

  // Ensure that the number of hunger dice doesn't exceed the
  // total number of dice, unless it's a rouse check that needs
  // rerolls, which requires twice the number of normal hunger
  // dice and only the highest will be kept.
  const hungerRoll = rerollHunger ? hungerDice * 2 : Math.min(numDice, hungerDice)

  // Calculate the number of normal dice to roll by subtracting
  // the number of hunger dice from them.
  const dice = Math.max(numDice - hungerRoll, 0)

  // Compose the roll string.
  // First, rolling vampire dice (dv) and count successes (cs>5)
  // Then, roll hunger dice (dg) and count successes (cs>5) as well as
  // rerolling those hunger dice to keep the highest (kh)
  const rouseReroll = rerollHunger ? `kh${hungerDice}` : ''
  const roll = new Roll(
    `${dice}dvcs>5 + ${hungerRoll}dgcs>5${rouseReroll}`,
    actor.system
  )

  // Send the roll to Foundry
  await roll.evaluate({ async: true })

  // Variable defining
  let difficultyResult = '<span></span>'
  let success = 0
  let hungerSuccess = 0
  let critSuccess = 0
  let hungerCritSuccess = 0
  let fail = 0
  let hungerFail = 0
  let hungerCritFail = 0
  let totalHungerFail = 0
  let hungerCritSuccessRerolled = 0
  let hungerSuccessRerolled = 0
  let hungerCritFailRerolled = 0
  let hungerFailRerolled = 0

  // Define images
  const diceLocation = "/systems/vtm5e/assets/icons/dice/vampire/"
  const normalDiceFaces = {
    "success": "success.png",
    "failure": "failure.png",
    "critical": "critical.png",
  }

  const hungerDiceFaces = {
    "success": "hunger-success.png",
    "failure": "hunger-failure.png",
    "critical": "hunger-critical.png",
    "bestial": "bestial-failure.png"
  }

  // Defines the normal diceroll results
  roll.terms[0].results.forEach((dice) => {
    if (dice.success) {
      if (dice.result === 10) {
        critSuccess++
      } else {
        success++
      }
    } else {
      fail++
    }
  })

  // Track number of hunger diceroll results
  roll.terms[2].results.forEach((dice) => {
    // Rerolled dice
    if (dice.discarded) {
      if (dice.success) {
        if (dice.result === 10) {
          hungerCritSuccessRerolled++
        } else {
          hungerSuccessRerolled++
        }
      } else {
        if (dice.result === 1) {
          hungerCritFailRerolled++
        } else {
          hungerFailRerolled++
        }
      }
    } else {
      // Actually used results
      if (dice.success) {
        if (dice.result === 10) {
          hungerCritSuccess++
        } else {
          hungerSuccess++
        }
      } else {
        if (dice.result === 1) {
          hungerCritFail++
        } else {
          hungerFail++
        }
        totalHungerFail++
      }
    }
  })

  // Automatically add hunger to the actor on a failure (for rouse checks)
  if (increaseHunger && game.settings.get('vtm5e', 'automatedRouse')) {
    const currentHunger = actor.system.hunger.value
    const newHungerAmount = Math.min(currentHunger + totalHungerFail, 5)

    // If the roll would push the actor's hunger above 4 when their hunger was previously
    // below 5, send a message in the chat to warn them.
    if (newHungerAmount > 4 && currentHunger < 5) {
      renderTemplate('systems/vtm5e/templates/actor/parts/chat-message.html', {
        name: game.i18n.localize('WOD5E.HungerFull1'),
        img: 'systems/vtm5e/assets/icons/bestial-fail.png',
        description: game.i18n.localize('WOD5E.HungerFull2')
      }).then(html => {
        ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: actor }),
          content: html
        })
      })
    }

    // Update the actor with the new amount of rage
    actor.update({ 'system.hunger.value': newHungerAmount })
  }

  // Success canculating
  let totalCritSuccess = 0
  totalCritSuccess = Math.floor((critSuccess + hungerCritSuccess) / 2)
  const totalSuccess = (totalCritSuccess * 2) + success + hungerSuccess + critSuccess + hungerCritSuccess
  let successRoll = false

  // Get the difficulty result
  if (difficulty !== 0) {
    successRoll = totalSuccess >= difficulty
    difficultyResult = `( <span class="danger">${game.i18n.localize('WOD5E.Fail')}</span> )`
    if (successRoll) {
      difficultyResult = `( <span class="success">${game.i18n.localize('WOD5E.Success')}</span> )`
    }
  }

  // Define the contents of the ChatMessage
  let chatMessage = `<p class="roll-label uppercase">${label}</p>`

  // Special critical/bestial failure messages
  if (hungerCritSuccess && totalCritSuccess) {
    chatMessage = chatMessage + `<p class="roll-content result-critical result-messy">${game.i18n.localize('WOD5E.MessyCritical')}</p>`
  } else if (totalCritSuccess) {
    chatMessage = chatMessage + `<p class="roll-content result-critical">${game.i18n.localize('WOD5E.CriticalSuccess')}</p>`
  }
  if (hungerCritFail && !successRoll && difficulty > 0) {
    chatMessage = chatMessage + `<p class="roll-content result-bestial">${game.i18n.localize('WOD5E.BestialFailure')}</p>`
  }
  if (hungerCritFail && !successRoll && difficulty === 0) {
    chatMessage = chatMessage + `<p class="roll-content result-bestial result-possible">${game.i18n.localize('WOD5E.PossibleBestialFailure')}</p>`
  }

  // Total number of successes
  chatMessage = chatMessage + `<p class="roll-label result-success">${game.i18n.localize('WOD5E.Successes')}: ${totalSuccess} ${difficultyResult}</p>`

  // Run through displaying the normal dice
  for (let i = 0, j = critSuccess; i < j; i++) {
    chatMessage = chatMessage + '<img src="' + diceLocation + normalDiceFaces.critical + '" alt="Normal Crit" class="roll-img normal-dice rerollable" />'
  }
  for (let i = 0, j = success; i < j; i++) {
    chatMessage = chatMessage + '<img src="' + diceLocation + normalDiceFaces.success + '" alt="Normal Success" class="roll-img normal-dice rerollable" />'
  }
  for (let i = 0, j = fail; i < j; i++) {
    chatMessage = chatMessage + '<img src="' + diceLocation + normalDiceFaces.failure + '" alt="Normal Fail" class="roll-img normal-dice rerollable" />'
  }

  // Separator
  chatMessage = chatMessage + '<br>'

  // Run through displaying hunger dice
  for (let i = 0, j = hungerCritSuccess; i < j; i++) {
    chatMessage = chatMessage + '<img src="' + diceLocation + hungerDiceFaces.critical + '" alt="Hunger Crit" class="roll-img hunger-dice" />'
  }
  for (let i = 0, j = hungerSuccess; i < j; i++) {
    chatMessage = chatMessage + '<img src="' + diceLocation + hungerDiceFaces.success + '" alt="Hunger Success" class="roll-img hunger-dice" />'
  }
  for (let i = 0, j = hungerCritFail; i < j; i++) {
    chatMessage = chatMessage + '<img src="' + diceLocation + hungerDiceFaces.bestial + '" alt="Bestial Fail" class="roll-img hunger-dice" />'
  }
  for (let i = 0, j = hungerFail; i < j; i++) {
    chatMessage = chatMessage + '<img src="' + diceLocation + hungerDiceFaces.failure + '" alt="Hunger Fail" class="roll-img hunger-dice" />'
  }

  // Run through displaying rerolled dice
  for (let i = 0, j = hungerCritSuccessRerolled; i < j; i++) {
    chatMessage = chatMessage + '<img src="' + diceLocation + hungerDiceFaces.critical + '" alt="Hunger Crit Rerolled" class="roll-img hunger-dice rerolled" />'
  }
  for (let i = 0, j = hungerSuccessRerolled; i < j; i++) {
    chatMessage = chatMessage + '<img src="' + diceLocation + hungerDiceFaces.success + '" alt="Hunger Success Rerolled" class="roll-img hunger-dice rerolled" />'
  }
  for (let i = 0, j = hungerCritFailRerolled; i < j; i++) {
    chatMessage = chatMessage + '<img src="' + diceLocation + hungerDiceFaces.failure + '" alt="Bestial Fail Rerolled" class="roll-img hunger-dice rerolled" />'
  }
  for (let i = 0, j = hungerFailRerolled; i < j; i++) {
    chatMessage = chatMessage + '<img src="' + diceLocation + hungerDiceFaces.bestial + '" alt="Hunger Fail Rerolled" class="roll-img hunger-dice rerolled" />'
  }

  // Post the message to the chat
  roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor: actor }),
    content: chatMessage
  })

  // Automatically track willpower damage as a result of willpower rerolls
  if (subtractWillpower && game.settings.get('vtm5e', 'automatedWillpower')) {
    // Get the actor's willpower and define it for convenience
    const actorWillpower = actor.system.willpower
    const maxWillpower = actorWillpower.max
    const aggrWillpower = actorWillpower.aggravated
    const superWillpower = actorWillpower.superficial

    // If the willpower boxes are fully ticked with aggravated damage
    // then tell the chat and don't increase any values.
    if (aggrWillpower >= maxWillpower) {
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        content: game.i18n.localize('WOD5E.WillpowerFull')
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
}
