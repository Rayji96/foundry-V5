/* global ChatMessage, Roll, game, renderTemplate, CONFIG */

// Import various helper functions
import { generateRollFormula } from './rolls/roll-formula.js'
import { generateRollMessage } from './rolls/roll-message.js'
import { _damageWillpower } from './rolls/willpower-damage.js'
import { _increaseHunger } from './rolls/increase-hunger.js'
import { _decreaseRage } from './rolls/decrease-rage.js'

class WOD5eDice {
  /**
   * Class that handles all WOD5e rolls.
   *
   * @param basicDice                 (Optional, default 0) The number of 'basic' dice to roll, such as v, w, and h
   * @param advancedDice              (Optional, default 0) The number of 'advanced' dice to roll, such as g, r and s
   * @param actor                     The actor that the roll is coming from
   * @param data                      Actor or item data to pass along with the roll
   * @param title                     Title of the roll for the dialog/chat message
   * @param disableBasicDice          (Optional, default false) Whether to disable basic dice on this roll
   * @param disableAdvancedDice       (Optional, default false) Whether to disable advanced dice on this roll
   * @param speaker                   (Optional) Speaker that the message should be sent as
   * @param damageWillpower           (Optional, default false) Whether to damage willpower after the roll is complete
   * @param increaseHunger            (Optional, default false) Whether to increase hunger on failures
   * @param decreaseRage              (Optional, default false) Whether to reduce rage on failures
   * @param difficulty                (Optional, default 0) The number that the roll must succeed to count as a success
   * @param flavor                    (Optional, default "") Text that appears in the description of the roll
   * @param callback                  (Optional) A callable function for determining the chat message flavor given parts and data
   * @param quickRoll                 (Optional, default false) Whether the roll was called to bypass the roll dialog or not
   * @param rollMode                  (Optional, default FVTT's current roll mode) Which roll mode the message should default as
   * @param rerollHunger              (Optional, default false) Whether to reroll failed hunger dice
   * 
   */
  static async Roll({
    basicDice = 0,
    advancedDice = 0,
    actor,
    data,
    title,
    disableBasicDice,
    disableAdvancedDice,
    speaker,
    damageWillpower = false,
    increaseHunger = false,
    decreaseRage = false,
    difficulty = 0,
    flavor = "",
    callback,
    quickRoll = false,
    rollMode = game.settings.get("core", "rollMode"),
    rerollHunger = false
  }) {
    // Define the actor's gamesystem, defaulting to "mortal" if it's not in the systemsList
    const systemsList = ["vampire", "werewolf", "hunter", "mortal"]
    const system = systemsList.indexOf(actor.system.gamesystem) > -1 ? actor.system.gamesystem : 'mortal'

    // Inner roll function
    const _roll = async (inputBasicDice, inputAdvancedDice, $form) => {
      // Construct the proper roll formula by sending it to the generateRollFormula function
      const rollFormula = await generateRollFormula({
        basicDice: inputBasicDice,
        advancedDice: inputAdvancedDice,
        system,
        actor,
        data,
        rerollHunger
      })

      // Send the roll to chat
      const roll = await new Roll(rollFormula, data).roll({
        async: true
      })

      // Handle failures for werewolves and vampires
      handleFailure(system, roll.terms[2].results)

      // Construct the proper message content from the generateRollMessage function
      const content = await generateRollMessage({
        system,
        roll,
        actor,
        data,
        title,
        flavor
      })

      roll.toMessage({
          speaker: speaker ? speaker : ChatMessage.getSpeaker({ actor }),
          content
        },
        {
          rollMode: $form ? $form.find("[name=rollMode]").val() : rollMode
        }
      )
      return roll
    }

    // Check if the user wants to bypass the roll dialog
    if (!quickRoll) {
      // Situational modifiers
      let situationalModifiers = []

      // Roll dialog template
      const template = `systems/vtm5e/templates/ui/${system}-roll-dialog.html`
      // Data that the dialog template needs
      const dialogData = {
        system,
        basicDice,
        advancedDice,
        disableBasicDice,
        disableAdvancedDice,
        difficulty,
        rollMode,
        rollModes: CONFIG.Dice.rollModes,
        situationalModifiers
      }
      // Render the dialog
      const content = await renderTemplate(template, dialogData)

      // Promise to handle the roll after the dialog window is closed
      // as well as any callbacks or other functions with the roll
      let roll
      return new Promise(resolve => {
        new Dialog(
          {
            title,
            content,
            buttons: {
              roll: {
                icon: '<i class="fas fa-dice"></i>',
                label: game.i18n.localize("WOD5E.Roll"),
                callback: async html => {
                  // Assign basic and advanced inputs to variables that default to 0 if not found
                  const inputBasicDice = html.find('#inputBasicDice').val() ? html.find('#inputBasicDice').val() : 0
                  const inputAdvancedDice = html.find('#inputAdvancedDice').val() ? html.find('#inputAdvancedDice').val() : 0

                  // Send the roll to the _roll function
                  roll = await _roll(inputBasicDice, inputAdvancedDice, html)
                }
              },
              cancel: {
                icon: '<i class="fas fa-times"></i>',
                label: game.i18n.localize('WOD5E.Cancel')
              }
            },
            default: game.i18n.localize("WOD5E.Roll"),
            close: html => {
              if (callback) callback(html, rollFormula, data)
              if (damageWillpower && game.settings.get('vtm5e', 'automatedWillpower')) _damageWillpower(actor)
              resolve(roll)
            }
          },
          {
            classes: ['wod5e', `${system}-dialog`, `${system}-sheet`]
          }
        ).render(true)
      })
    } else {
      return _roll(basicDice, advancedDice)
    }

    // Function to help with handling additional functions as a result
    // of failures
    function handleFailure(system, diceResults) {
      if (system === 'vampire') {
        diceResults.forEach((dice) => {
          if (!dice.success && increaseHunger && game.settings.get('vtm5e', 'automatedRouse')) _increaseHunger(actor)
        })
      } else if (system === 'werewolf') {
        diceResults.forEach((dice) => {
          if (!dice.success && decreaseRage && game.settings.get('vtm5e', 'automatedRage')) _decreaseRage(actor)
        })
      }
    }
  }
}

export { WOD5eDice }