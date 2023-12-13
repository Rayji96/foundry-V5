/* global ChatMessage, Roll, game */

// Import dice face-related variables for icon paths
import { werewolfDiceLocation, normalDiceFaces, rageDiceFaces } from '../icons.js'

// Function to roll dice
// numDice = Number of dice the function will roll
// actor = Actor's data
// label = Text that appears at the head of the ChatMessage
// difficulty = The amount of successes required for a given roll
// rageDice = Additional rage dice for the roll
// subtractWillpower = Subtracts a point of willpower, always, if true
// consumeRage = Whether the roll is an ability that has the potential to reduce the actor's rage
// callback = A callback function in case there's things that rely on the outcome of the roll (such as shifting forms)
export async function rollWerewolfDice (numDice, actor, label = '', difficulty = 0, rageDice = 0, subtractWillpower = false, consumeRage = false, callback) {
  // Roll defining and evaluating

  // Ensure that the number of rage dice doesn't exceed the
  // total number of dice
  const rageRoll = Math.min(numDice, rageDice)

  // Calculate the number of normal dice to roll by subtracting
  // the number of rage dice from them.
  const dice = Math.max(numDice - rageRoll, 0)

  // Send the roll to Foundry
  const roll = new Roll(dice + 'dwcs>5 + ' + rageRoll + 'drcs>5', actor.system)
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
  let totalRageFail = 0

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
      totalRageFail++
    }
  })

  // Reduce rage for each failure on a rage dice if this is a power that consumes it
  if (consumeRage && game.settings.get('vtm5e', 'automatedRage')) {
    const currentRage = actor.system.rage.value
    const newRageAmount = Math.max(currentRage - totalRageFail, 0)

    if (newRageAmount === 0 && currentRage > 0) {
      const chatMessage = `<p class="roll-label uppercase">Lost The Wolf</p>
      <p class="roll-content result-rage result-possible">This actor has 0 rage and has lost the wolf.</p>`

      // Post the message to the chat
      ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: chatMessage
      })
    }

    // Update the actor with the new amount of rage
    actor.update({ 'system.rage.value': newRageAmount })

    // Send back the actor's new rage value
    if (callback) {
      callback(newRageAmount)
    }
  }

  // Success canculating
  let totalCritSuccess = 0
  totalCritSuccess = Math.floor((critSuccess + rageCritSuccess) / 2)
  const totalSuccess = (totalCritSuccess * 2) + success + rageSuccess + critSuccess + rageCritSuccess
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

  // Special critical/rage failure messages
  if (totalCritSuccess && successRoll) {
    chatMessage = chatMessage + `<p class="roll-content result-critical">${game.i18n.localize('WOD5E.CriticalSuccess')}</p>`
  }
  // No successes at all is a total failure
  if (totalSuccess === 0) {
    chatMessage = chatMessage + `<p class="roll-content result-rage result-desperation">${game.i18n.localize('WOD5E.TotalFailure')}</p>`
  }
  // Greater than 1, a brutal outcome is possible
  if (brutalOutcome > 1) {
    chatMessage = chatMessage + `<p class="roll-content result-rage result-possible">${game.i18n.localize('WOD5E.PossibleRageFailure')}</p>`
  }

  // Total number of successes
  chatMessage = chatMessage + `<p class="roll-label result-success">${game.i18n.localize('WOD5E.Successes')}: ${totalSuccess} ${difficultyResult}</p>`

  // Run through displaying the normal dice
  for (let i = 0, j = critSuccess; i < j; i++) {
    chatMessage = chatMessage + '<img src="' + werewolfDiceLocation + normalDiceFaces.critical + '" alt="Normal Crit" class="roll-img werewolf-dice rerollable" />'
  }
  for (let i = 0, j = success; i < j; i++) {
    chatMessage = chatMessage + '<img src="' + werewolfDiceLocation + normalDiceFaces.success + '" alt="Normal Success" class="roll-img werewolf-dice rerollable" />'
  }
  for (let i = 0, j = fail; i < j; i++) {
    chatMessage = chatMessage + '<img src="' + werewolfDiceLocation + normalDiceFaces.failure + '" alt="Normal Fail" class="roll-img werewolf-dice rerollable" />'
  }

  // Separator
  chatMessage = chatMessage + '<br>'

  // Run through displaying rage dice
  for (let i = 0, j = rageCritSuccess; i < j; i++) {
    chatMessage = chatMessage + '<img src="' + werewolfDiceLocation + rageDiceFaces.critical + '" alt="Rage Crit" class="roll-img rage-dice rerollable" />'
  }
  for (let i = 0, j = rageSuccess; i < j; i++) {
    chatMessage = chatMessage + '<img src="' + werewolfDiceLocation + rageDiceFaces.success + '" alt="Rage Success" class="roll-img rage-dice rerollable" />'
  }
  for (let i = 0, j = brutalOutcome; i < j; i++) {
    chatMessage = chatMessage + '<img src="' + werewolfDiceLocation + rageDiceFaces.brutal + '" alt="Rage Critical Fail" class="roll-img rage-dice" />'
  }
  for (let i = 0, j = rageFail; i < j; i++) {
    chatMessage = chatMessage + '<img src="' + werewolfDiceLocation + rageDiceFaces.failure + '" alt="Rage Fail" class="roll-img rage-dice rerollable" />'
  }

  // Post the message to the chat
  roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
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
        speaker: ChatMessage.getSpeaker({ actor }),
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
