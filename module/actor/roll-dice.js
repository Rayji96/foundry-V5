
/* global ChatMessage, Roll, game */

// Function to roll dice
// numDice = Number of dice the function will roll
// actor = Actor's data
// label = Text that appears at the head of the ChatMessage
// difficulty = The amount of successes required for a given roll
// useHunger = Will roll hunger dice, if true
// increaseHunger = Will increase the actor's hunger if no successes are rolled, if true
// subtractWillpower = Subtracts a point of willpower, always, if true
export async function rollDice (numDice, actor, label = '', difficulty = 0, useHunger = true, increaseHunger = false, subtractWillpower = false) {
  // Define the actor's current hunger
  let hungerDice
  if (useHunger) {
    hungerDice = Math.min(actor.data.data.hunger.value, numDice)
  } else {
    hungerDice = 0
  }

  // Roll defining and evaluating
  const dice = numDice - hungerDice
  const roll = new Roll(dice + 'dvcs>5 + ' + hungerDice + 'dhcs>5', actor.data.data)
  await roll.evaluate()

  // Variable defining
  let difficultyResult = '<span></span>'
  let success = 0
  let hungerSuccess = 0
  let critSuccess = 0
  let hungerCritSuccess = 0
  let fail = 0
  let hungerFail = 0
  let hungerCritFail = 0

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
    }
  })

  // Success canculating
  let totalCritSuccess = 0
  totalCritSuccess = Math.floor((critSuccess + hungerCritSuccess) / 2)
  const totalSuccess = (totalCritSuccess * 2) + success + hungerSuccess + critSuccess + hungerCritSuccess
  let successRoll = false

  // Get the difficulty result
  if (difficulty !== 0) {
    successRoll = totalSuccess >= difficulty
    difficultyResult = `( <span class="danger">${game.i18n.localize('VTM5E.Fail')}</span> )`
    if (successRoll) {
      difficultyResult = `( <span class="success">${game.i18n.localize('VTM5E.Success')}</span> )`
    }
  }

  // Define the contents of the ChatMessage
  let chatMessage = `<p class="roll-label uppercase">${label}</p>`

  // Special critical/bestial failure messages
  if (hungerCritSuccess && totalCritSuccess) {
    chatMessage = chatMessage + `<p class="roll-content result-critical result-messy">${game.i18n.localize('VTM5E.MessyCritical')}</p>`
  } else if (totalCritSuccess) {
    chatMessage = chatMessage + `<p class="roll-content result-critical">${game.i18n.localize('VTM5E.CriticalSuccess')}</p>`
  }
  if (hungerCritFail && !successRoll && difficulty > 0) {
    chatMessage = chatMessage + `<p class="roll-content result-bestial">${game.i18n.localize('VTM5E.BestialFailure')}</p>`
  }
  if (hungerCritFail && !successRoll && difficulty === 0) {
    chatMessage = chatMessage + `<p class="roll-content result-bestial result-possible">${game.i18n.localize('VTM5E.PossibleBestialFailure')}</p>`
  }

  // Total number of successes
  chatMessage = chatMessage + `<p class="roll-label result-success">${game.i18n.localize('VTM5E.Successes')}: ${totalSuccess} ${difficultyResult}</p>`

  // Run through displaying the normal dice
  for (let i = 0, j = critSuccess; i < j; i++) {
    chatMessage = chatMessage + '<img src="systems/vtm5e/assets/images/normal-crit.png" alt="Normal Crit" class="roll-img normal-dice" />'
  }
  for (let i = 0, j = success; i < j; i++) {
    chatMessage = chatMessage + '<img src="systems/vtm5e/assets/images/normal-success.png" alt="Normal Success" class="roll-img normal-dice" />'
  }
  for (let i = 0, j = fail; i < j; i++) {
    chatMessage = chatMessage + '<img src="systems/vtm5e/assets/images/normal-fail.png" alt="Normal Fail" class="roll-img normal-dice" />'
  }

  // Separator
  chatMessage = chatMessage + '<br>'

  // Run through displaying hunger dice
  for (let i = 0, j = hungerCritSuccess; i < j; i++) {
    chatMessage = chatMessage + '<img src="systems/vtm5e/assets/images/red-crit.png" alt="Hunger Crit" class="roll-img hunger-dice" />'
  }
  for (let i = 0, j = hungerSuccess; i < j; i++) {
    chatMessage = chatMessage + '<img src="systems/vtm5e/assets/images/red-success.png" alt="Hunger Success" class="roll-img hunger-dice" />'
  }
  for (let i = 0, j = hungerCritFail; i < j; i++) {
    chatMessage = chatMessage + '<img src="systems/vtm5e/assets/images/bestial-fail.png" alt="Bestial Fail" class="roll-img hunger-dice" />'
  }
  for (let i = 0, j = hungerFail; i < j; i++) {
    chatMessage = chatMessage + '<img src="systems/vtm5e/assets/images/red-fail.png" alt="Hunger Fail" class="roll-img hunger-dice" />'
  }

  // Post the message to the chat
  roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor: actor }),
    content: chatMessage
  })

  // Automatically add hunger to the actor on a failure (for rouse checks)
  if (increaseHunger && game.settings.get('vtm5e', 'automatedRouse')) {
    // Check if the roll failed (matters for discipline
    // power-based rouse checks that roll 2 dice instead of 1)
    if ((difficulty === 0 && totalSuccess === 0) || (totalSuccess < difficulty)) {
      const actorHunger = actor.data.data.hunger.value

      // If hunger is greater than 4 (5, or somehow higher)
      // then display that in the chat and don't increase hunger
      if (actorHunger > 4) {
        roll.toMessage({
          speaker: ChatMessage.getSpeaker({ actor: actor }),
          content: game.i18n.localize('VTM5E.HungerFull')
        })
      } else {
        // Define the new number of hunger points
        const newHunger = actor.data.data.hunger.value + 1

        // Push it to the actor's sheet
        actor.update({ 'data.hunger.value': newHunger })
      }
    }
  }

  // Automatically track willpower damage as a result of willpower rerolls
  if (subtractWillpower && game.settings.get('vtm5e', 'automatedWillpower')) {
    // Get the actor's willpower and define it for convenience
    const actorWillpower = actor.data.data.willpower
    const maxWillpower = actorWillpower.max
    const aggrWillpower = actorWillpower.aggravated
    const superWillpower = actorWillpower.superficial

    // If the willpower boxes are fully ticked with aggravated damage
    // then tell the chat and don't increase any values.
    if (aggrWillpower >= maxWillpower) {
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        content: game.i18n.localize('VTM5E.WillpowerFull')
      })
    } else {
      // If the superficial willpower ticket isn't completely full, then add a point
      if ((superWillpower + aggrWillpower) < maxWillpower) {
        // If there are still superficial willpower boxes to tick, add it here

        // Define the new number of superficial willpower damage
        const newWillpower = superWillpower + 1

        // Update the actor sheet
        actor.update({ 'data.willpower.superficial': newWillpower })
      } else {
        // If there aren't any superficial boxes left, add an aggravated one

        // Define the new number of aggravated willpower damage
        // Superficial damage needs to be subtracted by 1 each time
        // a point of aggravated is added
        const newSuperWillpower = superWillpower - 1
        const newAggrWillpower = aggrWillpower + 1

        // Update the actor sheet
        actor.update({ 'data.willpower.superficial': newSuperWillpower })
        actor.update({ 'data.willpower.aggravated': newAggrWillpower })
      }
    }
  }
}
