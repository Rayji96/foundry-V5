/* global game, renderTemplate, TextEditor */

// Import dice face-related variables for icon paths
import { mortalDiceLocation, vampireDiceLocation, werewolfDiceLocation, hunterDiceLocation, normalDiceFaces, hungerDiceFaces, rageDiceFaces, desperationDiceFaces } from '../../dice/icons.js'

/**
 * Function to help generate the chat message after a roll is made
 *
 * @param roll                      The roll after being handled by Foundry
 * @param system                    (Optional, default "mortal") The gamesystem the roll is coming from
 * @param title                     Title of the roll for the chat message
 * @param flavor                    (Optional, default "") Text that appears in the description of the roll
 * @param difficulty                (Optional, default 0) The number of successes needed to pass the check
 */
export async function generateRollMessage ({
  roll,
  system = 'mortal',
  title,
  flavor = '',
  difficulty = 0,
  activeModifiers
}) {
  // Variables to be defined later
  let basicDice, advancedDice

  // Make super sure that difficulty is an int
  difficulty = parseInt(difficulty)

  if (roll.terms[0]) {
    basicDice = await generateBasicDiceDisplay(roll.terms[0])
  }
  if (roll.terms[2]) {
    advancedDice = await generateAdvancedDiceDisplay(roll.terms[2])
  }

  const { totalResult, resultLabel } = await generateResult(basicDice, advancedDice)

  const chatTemplate = 'systems/vtm5e/templates/chat/roll-message.hbs'
  const chatData = {
    fullFormula: roll._formula,
    basicDice,
    advancedDice,
    system,
    title,
    enrichedFlavor: await TextEditor.enrichHTML(flavor),
    difficulty,
    totalResult,
    margin: totalResult > difficulty ? totalResult - difficulty : 0,
    enrichedResultLabel: await TextEditor.enrichHTML(resultLabel),
    activeModifiers
  }

  const chatMessage = await renderTemplate(chatTemplate, chatData)

  return chatMessage

  // Function to help with rendering of basic dice
  async function generateBasicDiceDisplay (rollData) {
    const basicDice = rollData.results
    let criticals = 0

    basicDice.forEach((die, index) => {
      // Variables
      let dieResult, dieImg, dieAltText
      const dieClasses = ['roll-img', 'rerollable']

      // Mark any die that were rerolled / not used
      if (die.discarded) dieClasses.push(['rerolled'])

      // Basic die results
      if (die.result === 10) dieResult = 'critical' // Critical successes
      else if (die.result < 10 && die.result > 5) dieResult = 'success' // Successes
      else dieResult = 'failure' // Failures

      // Define the face of the die based on the above conditionals
      const dieFace = normalDiceFaces[dieResult]

      // Use switch-cases to adjust splat-specific dice locations/faces
      switch (system) {
        case 'werewolf':
          // Werewolf data
          dieImg = `${werewolfDiceLocation}${dieFace}`
          dieClasses.push(['werewolf-dice'])
          break
        case 'vampire':
          // Vampire data
          dieImg = `${vampireDiceLocation}${dieFace}`
          dieClasses.push(['vampire-dice'])
          break
        case 'hunter':
          // Hunter data
          dieImg = `${hunterDiceLocation}${dieFace}`
          dieClasses.push(['hunter-dice'])
          break
        default:
          // Mortal data
          dieImg = `${mortalDiceLocation}${dieFace}`
          dieClasses.push(['mortal-dice'])
          break
      }

      // Add any necessary data to the dice object
      rollData.results[index].img = dieImg
      rollData.results[index].classes = dieClasses.join(' ')
      rollData.results[index].altText = dieAltText

      // Increase the number of criticals collected across the dice
      if (dieResult === 'critical' && !die.discarded) criticals++

      die.index = index
    })

    // Add in critical data as its own property
    rollData.criticals = criticals

    return rollData
  }

  // Function to help the rendering of advanced dice
  async function generateAdvancedDiceDisplay (rollData) {
    const advancedDice = rollData.results
    let criticals = 0
    let critFails = 0

    advancedDice.forEach((die, index) => {
      // Variables
      let dieResult, dieImg, dieAltText, dieFace
      const dieClasses = ['roll-img']

      // Mark any die that were rerolled / not used
      if (die.discarded) dieClasses.push(['rerolled'])

      // Use switch-cases to adjust splat-specific dice locations/faces
      switch (system) {
        case 'werewolf':
          // Werewolf die results
          if (die.result === 10) { // Handle critical successes
            dieResult = 'critical'
            dieClasses.push(['rerollable'])
          } else if (die.result < 10 && die.result > 5) { // Successes
            dieResult = 'success'
            dieClasses.push(['rerollable'])
          } else if (die.result < 6 && die.result > 2) { // Failures
            dieResult = 'failure'
            dieClasses.push(['rerollable'])
          } else dieResult = 'brutal' // Brutal failures

          // Werewolf data
          dieFace = rageDiceFaces[dieResult]
          dieImg = `${werewolfDiceLocation}${dieFace}`
          dieClasses.push(['rage-dice'])
          break
        case 'vampire':
          // Vampire die results
          if (die.result === 10) dieResult = 'critical' // Critical successes
          else if (die.result < 10 && die.result > 5) dieResult = 'success' // Successes
          else if (die.result < 6 && die.result > 1) dieResult = 'failure' // Failures
          else dieResult = 'bestial' // Bestial failures

          // Vampire data
          dieFace = hungerDiceFaces[dieResult]
          dieImg = `${vampireDiceLocation}${dieFace}`
          dieClasses.push(['hunger-dice'])
          break
        case 'hunter':
          // Hunter die results
          if (die.result === 10) dieResult = 'critical' // Critical successes
          else if (die.result < 10 && die.result > 5) dieResult = 'success' // Successes
          else if (die.result < 6 && die.result > 1) dieResult = 'failure' // Failures
          else dieResult = 'criticalFailure' // Critical failures

          // Hunter data
          dieFace = desperationDiceFaces[dieResult]
          dieImg = `${hunterDiceLocation}${dieFace}`
          dieClasses.push(['desperation-dice'])
          break
      }

      // Add any necessary data to the dice object
      rollData.results[index].img = dieImg
      rollData.results[index].classes = dieClasses.join(' ')
      rollData.results[index].altText = dieAltText

      // Increase the number of criticals collected across the dice
      if (dieResult === 'critical' && !die.discarded) criticals++
      if ((dieResult === 'criticalFailure' || dieResult === 'bestial' || dieResult === 'brutal') && !die.discarded) critFails++

      die.index = index
    })

    // Add in critical data as its own properties
    rollData.criticals = criticals
    rollData.critFails = critFails

    return rollData
  }

  async function generateResult (basicDice, advancedDice) {
    // Useful variables
    let resultLabel = ''

    // Calculate the totals across the basic and advanced dice
    const basicTotal = basicDice ? basicDice.total : 0
    const advancedTotal = advancedDice ? advancedDice.total : 0

    // Grab the totals of crits across basic and advanced dice
    const basicCrits = basicDice ? basicDice.criticals : 0
    const advancedCrits = advancedDice ? advancedDice.criticals : 0
    // Sum up the total criticals across both sets of dice
    const totalCriticals = basicCrits + advancedCrits
    // Define the total to add to the roll as a result of the criticals
    // (every 2 critical results adds an additional 2 successes)
    const critTotal = Math.floor(totalCriticals / 2) * 2

    // Calculate the total result when factoring in criticals
    const totalResult = basicTotal + advancedTotal + critTotal

    // Append additional data to the original roll
    roll.system = system
    roll.difficulty = difficulty
    roll.totalResult = totalResult
    roll.rollSuccessful = (totalResult >= difficulty) || (totalResult > 0 && difficulty === 0)

    // Construct the markup for total and difficulty display
    let totalAndDifficulty = `<div class="total-and-difficulty">
      <div class="roll-total">
        <span class="total-title">
          ${game.i18n.localize('WOD5E.RollList.Total')}
        </span>
        <span class="total-contents">
          ${totalResult}
        </span>
      </div>`
    if (difficulty > 0) {
      totalAndDifficulty += `<div class="roll-difficulty">
        <span class="difficulty-title">
          ${game.i18n.localize('WOD5E.RollList.Difficulty')}
        </span>
        <span class="difficulty-contents">
          ${difficulty}
        </span>
      </div>`
    }
    totalAndDifficulty += '</div>'

    // Generate the result label depending on the splat and difficulty
    if (totalResult < difficulty || difficulty === 0) { // Handle failures...
      if (system === 'vampire' && advancedDice.critFails > 0) { // Handle bestial failures
        resultLabel += totalAndDifficulty + `<div class="roll-result-label bestial-failure">${game.i18n.localize('WOD5E.VTM.PossibleBestialFailure')}</div>`
      } else if (system === 'werewolf' && advancedDice.critFails > 1) { // Handle brutal outcomes
        resultLabel += totalAndDifficulty + `<div class="roll-result-label rage-failure">${game.i18n.localize('WOD5E.WTA.PossibleRageFailure')}</div>`
      } else if (system === 'hunter' && advancedDice.critFails > 0) { // Handle desperation failures
        resultLabel += totalAndDifficulty + `<div class="roll-result-label desperation-failure">${game.i18n.localize('WOD5E.HTR.PossibleDesperationFailure')}</div>`
      } else {
        if (totalResult === 0 || difficulty > 0) { // Handle failures
          resultLabel = totalAndDifficulty + `<div class="roll-result-label failure">${game.i18n.localize('WOD5E.RollList.Fail')}</div>`
        } else { // Show the number of successes
          // Handle pluralizing based on the number of successes
          const successText = totalResult > 1 ? 'WOD5E.RollList.Successes' : 'WOD5E.RollList.Success'

          if (system === 'vampire' && (advancedDice.criticals > 1 || (basicDice.criticals > 0 && advancedDice.criticals > 0))) { // Handle messy criticals if no difficulty is set
            resultLabel = `<div class="roll-result-label messy-critical">${game.i18n.localize('WOD5E.VTM.MessyCritical')}</div>
            <div class="roll-result-label">${totalResult} ${game.i18n.localize(successText)}</div>`
          } else {
            resultLabel = `<div class="roll-result-label">${totalResult} ${game.i18n.localize(successText)}</div>`
          }
        }
      }
    } else {
      if (totalResult >= difficulty) { // If the difficulty is matched or exceeded...
        if (system === 'werewolf' && advancedDice.critFails > 1) { // Handle brutal outcomes
          resultLabel += totalAndDifficulty + `<div class="roll-result-label rage-failure">${game.i18n.localize('WOD5E.WTA.PossibleRageFailure')}</div>`
        } else if (critTotal > 0) { // If there's at least one set of critical dice...
          if (system === 'vampire' && (advancedDice.criticals > 1 || (basicDice.criticals > 0 && advancedDice.criticals > 0))) { // Handle messy criticals
            resultLabel = totalAndDifficulty + `<div class="roll-result-label messy-critical">${game.i18n.localize('WOD5E.VTM.MessyCritical')}</div>`
          } else { // Everything else is just a normal critical success
            resultLabel = totalAndDifficulty + `<div class="roll-result-label critical-success">${game.i18n.localize('WOD5E.RollList.CriticalSuccess')}</div>`
          }
        } else { // Normal success
          resultLabel = totalAndDifficulty + `<div class="roll-result-label success">${game.i18n.localize('WOD5E.RollList.Success')}</div>`
        }
      }
    }

    return { totalResult, resultLabel }
  }
}
