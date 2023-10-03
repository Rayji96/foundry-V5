
/* global ChatMessage, Roll, game */

// Function to roll dice
// numDice = Number of dice the function will roll
// actor = Actor's data
// label = Text that appears at the head of the ChatMessage
// difficulty = The amount of successes required for a given roll
// rageDice = Additional rage dice for the roll
// subtractWillpower = Subtracts a point of willpower, always, if true
export async function rollWerewolfDice (numDice, actor, label = '', difficulty = 0, rageDice = 0, subtractWillpower = false) {

  // Roll defining and evaluating
  const rageDiceTotal = Math.min(numDice, rageDice)
  const dice = Math.max(numDice - rageDiceTotal, 0)
  const roll = new Roll(dice + 'dwcs>5 + ' + rageDiceTotal + 'drcs>5', actor.system)
  await roll.evaluate({ async: true })

  // Variable defining
  let difficultyResult = '<span></span>'
  let success = 0
  let critSuccess = 0
  let fail = 0
  let rageSuccess = 0
  let rageCritSuccess = 0
  let rageFail = 0
  let brutalOutcome = 0

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

  // Track number of rage diceroll results
  roll.terms[2].results.forEach((dice) => {
    if (dice.success) {
      if (dice.result === 10) {
        rageCritSuccess++
      } else {
        rageSuccess++
      }
    } else {
      // Brutal dice are on a 1 or a 2 in Werewolf v5
      if (dice.result === 1 || dice.result === 2) {
        brutalOutcome++
      } else {
        rageFail++
      }
    }
  })

  // Success canculating
  let totalCritSuccess = 0
  totalCritSuccess = Math.floor((critSuccess + rageCritSuccess) / 2)
  const totalSuccess = (totalCritSuccess * 2) + success + rageSuccess + critSuccess + rageCritSuccess
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

  // Special critical/rage failure messages
  if (totalCritSuccess && successRoll) {
    chatMessage = chatMessage + `<p class="roll-content result-critical">${game.i18n.localize('VTM5E.CriticalSuccess')}</p>`
  }
  // No successes at all is a total failure
  if (totalSuccess === 0) {
    chatMessage = chatMessage + `<p class="roll-content result-rage result-desperation">${game.i18n.localize('VTM5E.TotalFailure')}</p>`
  }
  // Greater than 1, a brutal outcome is possible
  if (brutalOutcome > 1) {
    chatMessage = chatMessage + `<p class="roll-content result-rage result-possible">${game.i18n.localize('VTM5E.PossibleRageFailure')}</p>`
  }

  // Total number of successes
  chatMessage = chatMessage + `<p class="roll-label result-success">${game.i18n.localize('VTM5E.Successes')}: ${totalSuccess} ${difficultyResult}</p>`

  // Run through displaying the normal dice
  for (let i = 0, j = critSuccess; i < j; i++) {
    chatMessage = chatMessage + '<img src="systems/vtm5e/assets/images/hunter-normal-crit.png" alt="Normal Crit" class="roll-img normal-dice" />'
  }
  for (let i = 0, j = success; i < j; i++) {
    chatMessage = chatMessage + '<img src="systems/vtm5e/assets/images/hunter-normal-success.png" alt="Normal Success" class="roll-img normal-dice" />'
  }
  for (let i = 0, j = fail; i < j; i++) {
    chatMessage = chatMessage + '<img src="systems/vtm5e/assets/images/normal-fail.png" alt="Normal Fail" class="roll-img normal-dice" />'
  }

  // Separator
  chatMessage = chatMessage + '<br>'

  // Run through displaying rage dice
  for (let i = 0, j = rageCritSuccess; i < j; i++) {
    chatMessage = chatMessage + '<img src="systems/vtm5e/assets/images/hunter-orange-crit.png" alt="Rage Crit" class="roll-img rage-dice" />'
  }
  for (let i = 0, j = rageSuccess; i < j; i++) {
    chatMessage = chatMessage + '<img src="systems/vtm5e/assets/images/hunter-orange-success.png" alt="Rage Success" class="roll-img rage-dice" />'
  }
  for (let i = 0, j = brutalOutcome; i < j; i++) {
    chatMessage = chatMessage + '<img src="systems/vtm5e/assets/images/bestial-fail.png" alt="Rage Critical Fail" class="roll-img rage-dice" />'
  }
  for (let i = 0, j = rageFail; i < j; i++) {
    chatMessage = chatMessage + '<img src="systems/vtm5e/assets/images/red-fail.png" alt="Rage Fail" class="roll-img rage-dice" />'
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
        content: game.i18n.localize('VTM5E.WillpowerFull')
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
