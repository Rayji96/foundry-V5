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
 */
export async function generateRollMessage ({
  roll,
  system = "mortal",
  actor,
  data,
  title,
  flavor = ""
}) {
  let basicDice, advancedDice

  if (roll.terms[0]) {
    basicDice = await generateBasicDiceDisplay(system, roll.terms[0])
  }
  if (roll.terms[2]) {
    advancedDice = await generateAdvancedDiceDisplay(system, roll.terms[2])
  }

  const chatTemplate = `systems/vtm5e/templates/chat/roll-message.html`
  const chatData = {
    fullFormula: roll._formula,
    basicDice,
    advancedDice,
    system,
    title,
    flavor
  }

  const chatMessage = await renderTemplate(chatTemplate, chatData)

  return chatMessage

  // Function to help with rendering a display for each basic die
  async function generateBasicDiceDisplay(system, rollData) {
    const basicDice = rollData.results

    basicDice.forEach((die, index) => {
      // Determine the result of the die
      let dieResult, dieImg, dieAltText, dieFace
      let dieClasses = ['roll-img', 'rerollable']

      if (die.result === 10) {
        dieResult = 'critical'
      } else if (die.result < 10 && die.result > 5) {
        dieResult = 'success'
      } else {
        dieResult = 'failure'
      }

      // Use the result in order to plug in the proper dice face needed
      dieFace = normalDiceFaces[dieResult]

      // Use switch-cases to get the proper dice locations and classes
      // Then add them to the die object
      switch (system) {
        case 'werewolf':
          dieImg = `${werewolfDiceLocation}${dieFace}`
          dieClasses.push(['werewolf-dice'])
          break
        case 'vampire':
          dieImg = `${vampireDiceLocation}${dieFace}`
          dieClasses.push(['vampire-dice'])
          break
        case 'hunter':
          dieImg = `${hunterDiceLocation}${dieFace}`
          dieClasses.push(['hunter-dice'])
          break
        default:
          dieImg = `${mortalDiceLocation}${dieFace}`
          dieClasses.push(['mortal-dice'])
          break
      }

      rollData.results[index]['img'] = dieImg
      rollData.results[index]['classes'] = dieClasses.join(" ")
      rollData.results[index]['altText'] = dieAltText
    })

    return rollData
  }

  // Function to help with rendering a display for each advanced die
  async function generateAdvancedDiceDisplay(system, rollData) {
    const advancedDice = rollData.results

    advancedDice.forEach((die, index) => {
      // Determine the result of the die
      let dieResult, dieImg, dieAltText, dieFace
      let dieClasses = ['roll-img']

      // Use switch-cases to get the proper dice locations and classes
      // Then add them to the die object
      switch (system) {
        case 'werewolf':
          if (die.result === 10) {
            dieResult = 'critical'
            dieClasses.push(['rerollable'])
          } else if (die.result < 10 && die.result > 5) {
            dieResult = 'success'
            dieClasses.push(['rerollable'])
          } else if (die.result < 6 && die.result > 2) {
            dieResult = 'failure'
            dieClasses.push(['rerollable'])
          } else {
            dieResult = 'brutal'
          }
    
          // Use the result in order to plug in the proper dice face needed
          dieFace = rageDiceFaces[dieResult]

          dieImg = `${werewolfDiceLocation}${dieFace}`
          dieClasses.push(['rage-dice'])

          break
        case 'vampire':
          if (die.result === 10) {
            dieResult = 'critical'
          } else if (die.result < 10 && die.result > 5) {
            dieResult = 'success'
          } else if (die.result < 6 && die.result > 1) {
            dieResult = 'failure'
          } else {
            dieResult = 'bestial'
          }

          dieFace = hungerDiceFaces[dieResult]

          dieImg = `${vampireDiceLocation}${dieFace}`
          dieClasses.push(['hunger-dice'])

          break
        case 'hunter':
          if (die.result === 10) {
            dieResult = 'critical'
          } else if (die.result < 10 && die.result > 5) {
            dieResult = 'success'
          } else if (die.result < 6 && die.result > 1) {
            dieResult = 'failure'
          } else {
            dieResult = 'criticalFailure'
          }

          dieFace = desperationDiceFaces[dieResult]

          dieImg = `${hunterDiceLocation}${dieFace}`
          dieClasses.push(['desperation-dice'])
          break
      }

      rollData.results[index]['img'] = dieImg
      rollData.results[index]['classes'] = dieClasses.join(" ")
      rollData.results[index]['altText'] = dieAltText
    })

    return rollData
  }
}