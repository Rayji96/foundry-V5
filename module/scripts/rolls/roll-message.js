/* global ChatMessage, renderTemplate */

// Import dice face-related variables for icon paths
import { mortalDiceLocation, vampireDiceLocation, werewolfDiceLocation, hunterDiceLocation, normalDiceFaces, hungerDiceFaces, rageDiceFaces, desperationDiceFaces } from '../../dice/icons.js'

/**
 * Function to help generate the chat message after a roll is made
 *
 * @param roll                      The roll after being handled by Foundry
 * @param system                    (Optional, default "mortal") The gamesystem the roll is coming from
 * @param actor                     The actor that the roll is coming from
 * @param data                      Actor or item data to pass along with the roll
 * @param title                     Title of the roll for the chat message
 * @param flavor                    (Optional, default "") Text that appears in the description of the roll
 * @param difficulty                (Optional, default 0) The number of successes needed to pass the check
 */
export async function generateRollMessage ({
  roll,
  system = "mortal",
  actor,
  data,
  title,
  flavor = "",
  difficulty = 0,
  activeModifiers
}) {
  let basicDice, advancedDice

  if (roll.terms[0]) {
    basicDice = await generateBasicDiceDisplay(roll.terms[0])
  }
  if (roll.terms[2]) {
    advancedDice = await generateAdvancedDiceDisplay(roll.terms[2])
  }

  const { totalResult, resultLabel } = await generateResult(basicDice, advancedDice)

  const chatTemplate = `systems/vtm5e/templates/chat/roll-message.hbs`
  const chatData = {
    fullFormula: roll._formula,
    basicDice,
    advancedDice,
    system,
    title,
    flavor,
    difficulty,
    totalResult,
    margin: totalResult > difficulty ? totalResult - difficulty : 0,
    resultLabel,
    activeModifiers
  }

  const chatMessage = await renderTemplate(chatTemplate, chatData)

  return chatMessage

  // Function to help with rendering of basic dice
  async function generateBasicDiceDisplay(rollData) {
    const basicDice = rollData.results

    basicDice.forEach((die, index) => {
      // Variables
      let dieResult, dieImg, dieAltText, dieFace
      let dieClasses = ['roll-img', 'rerollable']

      // Basic die results
      if (die.result === 10) dieResult = 'critical'
      else if (die.result < 10 && die.result > 5) dieResult = 'success'
      else dieResult = 'failure'

      // Define the face of the die based on the above conditionals
      dieFace = normalDiceFaces[dieResult]

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
      rollData.results[index].classes = dieClasses.join(" ")
      rollData.results[index].altText = dieAltText
    })

    return rollData
  }
  
  // Function to help the rendering of advanced dice
  async function generateAdvancedDiceDisplay(rollData) {
    const advancedDice = rollData.results

    advancedDice.forEach((die, index) => {
      // Variables
      let dieResult, dieImg, dieAltText, dieFace
      let dieClasses = ['roll-img']

      // Use switch-cases to adjust splat-specific dice locations/faces
      switch (system) {
        case 'werewolf':
          // Werewolf die results
          if (die.result === 10 || (die.result < 10 && die.result > 5)) {
            dieResult = 'critical'
            dieClasses.push(['rerollable'])
          } else if (die.result < 6 && die.result > 2) {
            dieResult = 'failure'
            dieClasses.push(['rerollable'])
          } else dieResult = 'brutal'

          // Werewolf data
          dieFace = rageDiceFaces[dieResult]
          dieImg = `${werewolfDiceLocation}${dieFace}`
          dieClasses.push(['rage-dice'])
          break
        case 'vampire':
          // Vampire die results
          if (die.result === 10) dieResult = 'critical'
          else if (die.result < 10 && die.result > 5) dieResult = 'success'
          else if (die.result < 6 && die.result > 1) dieResult = 'failure'
          else dieResult = 'bestial'

          // Vampire data
          dieFace = hungerDiceFaces[dieResult]
          dieImg = `${vampireDiceLocation}${dieFace}`
          dieClasses.push(['hunger-dice'])
          break
        case 'hunter':
          // Hunter die results
          if (die.result === 10) dieResult = 'critical'
          else if (die.result < 10 && die.result > 5) dieResult = 'success'
          else if (die.result < 6 && die.result > 1) dieResult = 'failure'
          else dieResult = 'criticalFailure'

          // Hunter data
          dieFace = desperationDiceFaces[dieResult]
          dieImg = `${hunterDiceLocation}${dieFace}`
          dieClasses.push(['desperation-dice'])
          break
      }
  
      // Add any necessary data to the dice object
      rollData.results[index].img = dieImg
      rollData.results[index].classes = dieClasses.join(" ")
      rollData.results[index].altText = dieAltText
    })
  
    return rollData
  }

  async function generateResult(basicDice, advancedDice) {
    let totalResult = 0, criticals = 0
    let resultLabel

    let basicTotal = basicDice.total ? basicDice.total : 0
    let advancedTotal = advancedDice.total ? advancedDice.total : 0

    totalResult = basicTotal + advancedTotal

    if (difficulty > 0) {
      if (totalResult >= difficulty) {
        resultLabel = "Success"
      } else {
        resultLabel = "Failure"
      }
    }

    return { totalResult, resultLabel }
  }
}