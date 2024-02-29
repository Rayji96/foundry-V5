/* global ChatMessage, Roll, game, renderTemplate, CONFIG, Dialog, WOD5E */

// Import various helper functions
import { generateRollFormula } from './rolls/roll-formula.js'
import { generateRollMessage } from './rolls/roll-message.js'
import { getSituationalModifiers } from './rolls/situational-modifiers.js'
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
   * @param willpowerDamage           (Optional, default 0) How much to damage willpower after the roll is complete
   * @param increaseHunger            (Optional, default false) Whether to increase hunger on failures
   * @param decreaseRage              (Optional, default false) Whether to reduce rage on failures
   * @param difficulty                (Optional, default 0) The number that the roll must succeed to count as a success
   * @param flavor                    (Optional, default '') Text that appears in the description of the roll
   * @param callback                  (Optional) A callable function for determining the chat message flavor given parts and data
   * @param quickRoll                 (Optional, default false) Whether the roll was called to bypass the roll dialog or not
   * @param rollMode                  (Optional, default FVTT's current roll mode) Which roll mode the message should default as
   * @param rerollHunger              (Optional, default false) Whether to reroll failed hunger dice
   * @param selectors                 (Optional, default []) Any selectors to use when compiling situational modifiers
   * @param macro                     (Optional, default '') A macro to run after the roll has been made
   * @param disableMessageOutput      (optional, default false) Whether to display the message output of a roll
   *
   */
  static async Roll ({
    basicDice = 0,
    advancedDice = 0,
    actor,
    data,
    title,
    disableBasicDice,
    disableAdvancedDice,
    willpowerDamage = 0,
    increaseHunger = false,
    decreaseRage = false,
    difficulty = 0,
    flavor = '',
    callback,
    quickRoll = false,
    rollMode = game.settings.get('core', 'rollMode'),
    rerollHunger = false,
    selectors = [],
    macro = '',
    disableMessageOutput = false
  }) {
    // Define the actor's gamesystem, defaulting to 'mortal' if it's not in the systems list
    const system = WOD5E.Systems.getList().find(obj => actor.system.gamesystem in obj) ? actor.system.gamesystem : 'mortal'

    // Handle getting any situational modifiers
    const situationalModifiers = await getSituationalModifiers({
      actor,
      selectors
    })

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

      // Determine any active modifiers
      const activeModifiers = []
      if ($form) {
        const modifiersList = $form.find('.mod-checkbox')
        if (modifiersList.length > 0) {
          modifiersList.each(function () {
            const isChecked = $(this).prop('checked')

            if (isChecked) {
              // Get the dataset values
              const label = this.dataset.label
              const value = this.dataset.value

              // Add a plus sign if the value is positive
              const valueWithSign = (value > 0 ? '+' : '') + value

              // Push the object to the activeModifiers array
              activeModifiers.push({
                label,
                value: valueWithSign
              })
            }
          })
        }

        const customModifiersList = $form.find('.custom-modifier')
        if (customModifiersList.length > 0) {
          // Go through each custom modifier and add it to the array
          customModifiersList.each(function () {
            // Get the label and value from the current .custom-modifier element
            const label = $(this).find('.mod-name').val()
            const value = $(this).find('.mod-value').val()

            // Add a plus sign if the value is positive
            const valueWithSign = (value > 0 ? '+' : '') + value

            // Create an object with label and value fields
            const modifierObject = {
              label,
              value: valueWithSign
            }

            // Add the object to the activeModifiers array
            activeModifiers.push(modifierObject)
          })
        }
      }

      // Send the roll to chat
      const roll = await new Roll(rollFormula, data).roll({
        async: true
      })

      // Handle failures for werewolves and vampires
      if (roll.terms[2]) await handleFailure(system, roll.terms[2].results)

      // Handle willpower damage
      if (willpowerDamage > 0 && game.settings.get('vtm5e', 'automatedWillpower')) _damageWillpower(actor, willpowerDamage)

      // Send the results of the roll back to any functions that need it
      if (callback) callback(roll)

      // Run any macros that need to be ran
      if (macro && game.macros.get(macro)) {
        game.macros.get(macro).execute({
          actor,
          token: actor.token ?? actor.getActiveTokens[0]
        })
      }

      // The below isn't needed if there's no dice being rolled
      if (parseInt(inputBasicDice) === 0 && parseInt(inputAdvancedDice) === 0) return roll

      // The below isn't needed if disableMessageOutput is set to true
      if (disableMessageOutput) {
        // Send notice to DiceSoNice because we're not making a new chat message
        game.dice3d.showForRoll(roll)

        // End function here
        return roll
      }

      // Construct the proper message content from the generateRollMessage function
      const content = await generateRollMessage({
        system,
        roll,
        actor,
        data,
        title,
        flavor,
        difficulty: $form ? $form.find('[id=inputDifficulty]').val() : difficulty,
        activeModifiers
      })

      // Post the message to the chat
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor }),
        content,
        flags: {
          system,
          title,
          flavor,
          activeModifiers
        }
      },
      {
        rollMode: $form ? $form.find('[name=rollMode]').val() : rollMode
      })

      return roll
    }

    // Check if the user wants to bypass the roll dialog
    if (!quickRoll) {
      // Roll dialog template
      const dialogTemplate = `systems/vtm5e/templates/ui/${system}-roll-dialog.hbs`
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
      const content = await renderTemplate(dialogTemplate, dialogData)

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
                label: game.i18n.localize('WOD5E.Roll.Label'),
                callback: async html => {
                  // Obtain the input fields
                  const basicDiceInput = html.find('#inputBasicDice')
                  const advancedDiceInput = html.find('#inputAdvancedDice')

                  // Get the values
                  let basicValue = basicDiceInput.val() ? basicDiceInput.val() : 0
                  const advancedValue = advancedDiceInput.val() ? advancedDiceInput.val() : 0

                  // Add any custom modifiers
                  const customModifiersList = html.find('.custom-modifier')
                  if (customModifiersList.length > 0) {
                    // Go through each custom modifier and add it to the array
                    customModifiersList.each(function () {
                      // Get the value from the current .custom-modifier element
                      const value = $(this).find('.mod-value').val()

                      // Add the value to the basicValue
                      basicValue = parseInt(basicValue) + parseInt(value)
                    })
                  }

                  // Send the roll to the _roll function
                  roll = await _roll(basicValue, advancedValue, html)
                }
              },
              cancel: {
                icon: '<i class="fas fa-times"></i>',
                label: game.i18n.localize('WOD5E.Cancel')
              }
            },
            default: 'roll',
            close: () => {
              resolve(roll)
            },
            render: (html) => {
              // Obtain the input fields for basic and advanced dice
              const basicDiceInput = html.find('#inputBasicDice')

              // Add event listeners to plus and minus signs on the dice in the dialog
              html.find('.dialog-plus').click(function (event) {
                event.preventDefault()

                // Determine the input
                const input = $(`#${event.currentTarget.dataset.resource}`)

                // Add one to the value
                const newValue = parseInt(input.val()) + 1

                // Plug in the new value to the input
                input.val(newValue)
              })
              html.find('.dialog-minus').click(function (event) {
                event.preventDefault()

                // Determine the input
                const input = $(`#${event.currentTarget.dataset.resource}`)

                // Prevent negative amounts of dice when getting the new value
                const newValue = Math.max(parseInt(input.val()) - 1, 0)

                // Plug in the new value to the input
                input.val(newValue)
              })

              // Add event listeners to the situational modifier toggles
              html.find('.mod-checkbox').on('change', function (event) {
                event.preventDefault()

                // Determine the input
                const modCheckbox = $(event.target)
                const modifier = event.currentTarget.dataset.value

                // Get the values of basic and advanced dice
                const basicValue = basicDiceInput.val() ? basicDiceInput.val() : 0

                // Determine the new input depending on if the bonus is getting added (checked)
                // or not (unchecked)
                let newValue = 0
                if (modCheckbox.prop('checked')) {
                  newValue = parseInt(basicValue) + parseInt(modifier)
                } else {
                  newValue = parseInt(basicValue) - parseInt(modifier)
                }

                // Ensure that there can't be negative dice
                if (newValue < 0) newValue = 0

                // Plug in the new value to the input
                basicDiceInput.val(newValue)
              })

              // Add event listener to the add custo mmodifier button
              html.find('.add-custom-mod').click(function (event) {
                event.preventDefault()

                // Define the custom modifiers list and a custom modifier element
                const customModList = $('#custom-modifiers-list')
                const customModElement = `<div class="form-group custom-modifier">
                    <div class="mod-label">
                      <a class="mod-delete" title="` + game.i18n.localize('WOD5E.Delete') + `">
                        <i class="fas fa-trash"></i>
                      </a>
                      <input class="mod-name" type="text" value="Custom"/>
                    </div>
                    <input class="mod-value" type="number" value="1"/>
                  </div>`

                // Append a new custom modifier element to the list
                customModList.append(customModElement)
              })
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
    async function handleFailure (system, diceResults) {
      const failures = diceResults.filter(result => result.success === false && !result.discarded).length

      if (failures > 0) {
        if (system === 'vampire' && increaseHunger && game.settings.get('vtm5e', 'automatedRouse')) {
          _increaseHunger(actor, failures)
        } else if (system === 'werewolf' && decreaseRage && game.settings.get('vtm5e', 'automatedRage')) {
          _decreaseRage(actor, failures)
        }
      }
    }
  }
}

export { WOD5eDice }
