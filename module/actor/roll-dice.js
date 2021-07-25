
/* global ChatMessage, Roll, game */

// Function to roll dice
export function rollDice (numDice, actor, label = '', difficulty = 0, useHunger = true) {
  let hungerDice
  if (useHunger) {
    hungerDice = Math.min(actor.data.data.hunger.value, numDice)
  } else {
    hungerDice = 0
  }
  const dice = numDice - hungerDice
  const roll = new Roll(dice + 'dvcs>5 + ' + hungerDice + 'dhcs>5', actor.data.data)
  const rollResult = roll.evaluate()

  let difficultyResult = '<span></span>'
  let success = 0
  let hungerSuccess = 0
  let critSuccess = 0
  let hungerCritSuccess = 0
  let fail = 0
  let hungerFail = 0
  let hungerCritFail = 0

  rollResult.terms[0].results.forEach((dice) => {
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

  rollResult.terms[2].results.forEach((dice) => {
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

  let totalCritSuccess = 0
  totalCritSuccess = Math.floor((critSuccess + hungerCritSuccess) / 2)
  const totalSuccess = (totalCritSuccess * 2) + success + hungerSuccess + critSuccess + hungerCritSuccess
  let successRoll = false
  if (difficulty !== 0) {
    successRoll = totalSuccess >= difficulty
    difficultyResult = `( <span class="danger">${game.i18n.localize('VTM5E.Fail')}</span> )`
    if (successRoll) {
      difficultyResult = `( <span class="success">${game.i18n.localize('VTM5E.Success')}</span> )`
    }
  }

  label = `<p class="roll-label uppercase">${label}</p>`

  if (hungerCritSuccess && totalCritSuccess) {
    label = label + `<p class="roll-content result-critical result-messy">${game.i18n.localize('VTM5E.MessyCritical')}</p>`
  } else if (totalCritSuccess) {
    label = label + `<p class="roll-content result-critical">${game.i18n.localize('VTM5E.CriticalSuccess')}</p>`
  }
  if (hungerCritFail && !successRoll && difficulty > 0) {
    label = label + `<p class="roll-content result-bestial">${game.i18n.localize('VTM5E.BestialFailure')}</p>`
  }
  if (hungerCritFail && !successRoll && difficulty === 0) {
    label = label + `<p class="roll-content result-bestial result-possible">${game.i18n.localize('VTM5E.PossibleBestialFailure')}</p>`
  }

  label = label + `<p class="roll-label result-success">${game.i18n.localize('VTM5E.Successes')}: ${totalSuccess} ${difficultyResult}</p>`

  for (let i = 0, j = critSuccess; i < j; i++) {
    label = label + '<img src="systems/vtm5e/assets/images/normal-crit.png" alt="Normal Crit" class="roll-img normal-dice" />'
  }
  for (let i = 0, j = success; i < j; i++) {
    label = label + '<img src="systems/vtm5e/assets/images/normal-success.png" alt="Normal Success" class="roll-img normal-dice" />'
  }
  for (let i = 0, j = fail; i < j; i++) {
    label = label + '<img src="systems/vtm5e/assets/images/normal-fail.png" alt="Normal Fail" class="roll-img normal-dice" />'
  }

  label = label + '<br>'

  for (let i = 0, j = hungerCritSuccess; i < j; i++) {
    label = label + '<img src="systems/vtm5e/assets/images/red-crit.png" alt="Hunger Crit" class="roll-img hunger-dice" />'
  }
  for (let i = 0, j = hungerSuccess; i < j; i++) {
    label = label + '<img src="systems/vtm5e/assets/images/red-success.png" alt="Hunger Success" class="roll-img hunger-dice" />'
  }
  for (let i = 0, j = hungerCritFail; i < j; i++) {
    label = label + '<img src="systems/vtm5e/assets/images/bestial-fail.png" alt="Bestial Fail" class="roll-img hunger-dice" />'
  }
  for (let i = 0, j = hungerFail; i < j; i++) {
    label = label + '<img src="systems/vtm5e/assets/images/red-fail.png" alt="Hunger Fail" class="roll-img hunger-dice" />'
  }

  ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: actor }),
    content: label
  })
}
