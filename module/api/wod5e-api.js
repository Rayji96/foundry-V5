/* global renderTemplate, Dialog, ChatMessage, game, ui, WOD5E */

import { WOD5eDice } from '../scripts/system-rolls.js'
import { _onConfirmRoll } from '../actor/scripts/roll.js'

export class wod5eAPI {
  /**
   * Class that handles all WOD5e rolls.
   *
   * @param basicDice                 (Optional, default 0) The number of 'basic' dice to roll, such as v, w, and h
   * @param advancedDice              (Optional, default 0) The number of 'advanced' dice to roll, such as g, r and s
   * @param actor                     (Optional, default to speaker actor) The actor that the roll is coming from
   * @param data                      (Optional, default actor.system) Actor or item data to pass along with the roll
   * @param title                     (Optional, default "Rolling") Title of the roll for the dialog/chat message
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
   *
   */
  static async Roll ({
    basicDice = 0,
    advancedDice = 0,
    actor = game.actors.get(ChatMessage.getSpeaker().actor),
    data = game.actors.get(ChatMessage.getSpeaker().actor)?.system || {},
    title = 'Rolling',
    disableBasicDice = false,
    disableAdvancedDice = false,
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
    macro = ''
  }) {
    if (!actor || !data) {
      ui.notifications.error('Error: No actor defined.')

      return
    }

    // Send the roll to the system
    await WOD5eDice.Roll({
      basicDice,
      advancedDice,
      actor,
      data,
      title,
      disableBasicDice,
      disableAdvancedDice,
      willpowerDamage,
      difficulty,
      flavor,
      callback,
      quickRoll,
      rollMode,
      rerollHunger,
      increaseHunger,
      decreaseRage,
      selectors,
      macro
    })
  }

  /**
   * Class that handles rolling via a dataset format before passing the data to Roll.
   *
   * @param dataset                   A formatted dataset with various roll variables
   * @param actor                     (Optional, default to speaker actor) The actor that the roll is coming from
  */
  static async RollFromDataset ({
    dataset,
    actor = game.actors.get(ChatMessage.getSpeaker().actor)
  }) {
    // If there's no dataset, send an error and then stop the function
    if (!dataset) return console.error('No dataset defined.')

    // If selectDialog isn't set, just skip to the next dialog immediately
    if (!dataset.selectDialog) return _onConfirmRoll(dataset, actor)

    // Variables
    const { skill, attribute, discipline, renown } = dataset

    // Define the actor's gamesystem, defaulting to "mortal" if it's not in the systems list
    const system = WOD5E.Systems.getList().find(obj => actor.system.gamesystem in obj) ? actor.system.gamesystem : 'mortal'

    // Render selecting a skill/attribute to roll
    const dialogTemplate = 'systems/vtm5e/templates/ui/select-dice-dialog.hbs'
    const dialogData = {
      system,
      skill,
      attribute,
      discipline,
      renown
    }
    // Render the template
    const content = await renderTemplate(dialogTemplate, dialogData)

    // Render the dialog window to select which skill/attribute combo to use
    new Dialog(
      {
        title: 'Select Roll',
        content,
        buttons: {
          confirm: {
            icon: '<i class="fas fa-dice"></i>',
            label: game.i18n.localize('WOD5E.Confirm'),
            callback: async html => {
              // Compile the selected data and send it to the roll function
              const skillSelect = html.find('[id=skillSelect]').val()
              const attributeSelect = html.find('[id=attributeSelect]').val()
              const disciplineSelect = html.find('[id=disciplineSelect]').val()
              const renownSelect = html.find('[id=renownSelect]').val()

              // Handle adding a skill to the dicepool
              if (skillSelect) {
                // Add it to the label
                dataset.label += ` + ${await WOD5E.api.generateLabelAndLocalize({ string: skillSelect })}`

                // Add it to the value path if applicable
                if (dataset.valuePaths) dataset.valuePaths += ` skills.${skillSelect}.value`

                // If using absolute values instead of value paths, add the values together
                if (dataset.useAbsoluteValue && dataset.absoluteValue) dataset.absoluteValue += actor.system.skills[skillSelect].value

                // Add the attribute selectors to the roll
                dataset.selectors += ` skills skills.${attributeSelect}`
              }
              // Handle adding an attribute to the dicepool
              if (attributeSelect) {
                // Add it to the label
                dataset.label += ` + ${await WOD5E.api.generateLabelAndLocalize({ string: attributeSelect })}`

                // Add it to the value path if applicable
                if (dataset.valuePaths) dataset.valuePaths += ` abilities.${attributeSelect}.value`

                // If using absolute values instead of value paths, add the values together
                if (dataset.useAbsoluteValue && dataset.absoluteValue) dataset.absoluteValue += actor.system.abilities[attributeSelect].value

                // Add the attribute selectors to the roll
                dataset.selectors += ` abilities abilities.${attributeSelect}`
              }
              // Handle adding a discipline to the dicepool
              if (disciplineSelect) {
                // Add it to the label
                dataset.label += ` + ${await WOD5E.api.generateLabelAndLocalize({ string: disciplineSelect })}`

                // Add it to the value path if applicable
                if (dataset.valuePaths) dataset.valuePaths += ` disciplines.${disciplineSelect}.value`

                // If using absolute values instead of value paths, add the values together
                if (dataset.useAbsoluteValue && dataset.absoluteValue) dataset.absoluteValue += actor.system.disciplines[disciplineSelect].value

                // Add the discipline and potency selectors to the roll
                dataset.selectors += ` disciplines disciplines.${disciplineSelect}.value`
              }
              // Handle adding a renown to the dicepool
              if (renownSelect) {
                // Add it to the label
                dataset.label += ` + ${await WOD5E.api.generateLabelAndLocalize({ string: renownSelect })}`

                // Add it to the value path if applicable
                if (dataset.valuePaths) dataset.valuePaths += ` renown.${renownSelect}.value`

                // If using absolute values instead of value paths, add the values together
                if (dataset.useAbsoluteValue && dataset.absoluteValue) dataset.absoluteValue += actor.system.renown[renownSelect].value

                // Add the renown selector to the roll
                dataset.selectors += ` renown renown.${renownSelect}.value`
              }

              await _onConfirmRoll(dataset, actor)
            }
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: game.i18n.localize('WOD5E.Cancel')
          }
        },
        default: 'confirm'
      },
      {
        classes: ['wod5e', `${system}-dialog`, `${system}-sheet`]
      }
    ).render(true)
  }

  // Function to grab the values of any given paths and add them up as the total number of basic dice for the roll
  static async getFlavorDescription ({
    valuePath = '',
    data = {}
  }) {
    // Look up the path and grab the value
    const properties = valuePath.split('.')

    let pathValue = data
    for (const prop of properties) {
      pathValue = pathValue[prop]

      if (pathValue === undefined) break // Break the loop if property is not found
    }

    return pathValue
  }

  // Function to grab the values of any given paths and add them up as the total number of basic dice for the roll
  static async getBasicDice ({
    valuePaths = [],
    flatMod = 0,
    actor = game.actors.get(ChatMessage.getSpeaker().actor)
  }) {
    // Top-level variables
    const actorData = actor.system

    // Secondary variables
    const valueArray = valuePaths.split(' ')
    // Start with any flat modifiers or 0 if we have none
    let total = parseInt(flatMod) || 0

    // Look up the path and grab the value
    for (const path of valueArray) {
      const properties = path.split('.')

      let pathValue = actorData
      for (const prop of properties) {
        pathValue = pathValue[prop]

        if (pathValue === undefined) break // Break the loop if property is not found
      }

      // Add the value from the path to the total; if the value isn't a number, just default to 0
      total += typeof pathValue === 'number' ? pathValue : 0
    }

    return total
  }

  // Function to construct what the advanced dice of the actor's roll should be and total to
  static async getAdvancedDice ({
    actor = game.actors.get(ChatMessage.getSpeaker().actor)
  }) {
    // Top-level variables
    const actorData = actor.system

    // Define the actor's gamesystem, defaulting to "mortal" if it's not in the systems list
    const system = WOD5E.Systems.getList().find(obj => actor.system.gamesystem in obj) ? actor.system.gamesystem : 'mortal'

    if (system === 'vampire' && actor.type !== 'ghoul') {
      // Define actor's hunger dice, ensuring it can't go below 0
      const hungerDice = Math.max(actorData.hunger.value, 0)

      return hungerDice
    } else if (system === 'werewolf') {
      // Define actor's rage dice, ensuring it can't go below 0
      const rageDice = Math.max(actorData.rage.value, 0)

      return rageDice
    } else {
      // Hunters will handle their Desperation dice in the roll dialog
      // Mortals and ghouls don't need this
      return 0
    }
  }

  static async generateLabelAndLocalize ({
    string = ''
  }) {
    // Always lowercase any labels we're localizing
    // customRoll is the one exception to this rule
    const str = string === 'customRoll' ? 'customRoll' : string.toLowerCase()

    // Lists
    const attributes = WOD5E.Attributes.getList()
    const skills = WOD5E.Skills.getList()
    const features = WOD5E.Features.getList()
    const items = WOD5E.ItemTypes.getList()
    const disciplines = WOD5E.Disciplines.getList()
    const renown = WOD5E.Renown.getList()
    const edges = WOD5E.Edges.getList()

    // Attributes
    if (attributes.find(obj => str in obj)) {
      return findLabel(attributes, str)
    }
    // Skills
    if (skills.find(obj => str in obj)) {
      return findLabel(skills, str)
    }
    // Features
    if (features.find(obj => str in obj)) {
      return findLabel(features, str)
    }
    // Items
    if (items.find(obj => str in obj)) {
      return findLabel(items, str)
    }
    // Disciplines
    if (disciplines.find(obj => str in obj)) {
      return findLabel(disciplines, str)
    }
    // Renown
    if (renown.find(obj => str in obj)) {
      return findLabel(renown, str)
    }
    // Edges
    if (edges.find(obj => str in obj)) {
      return findLabel(edges, str)
    }

    // Return the base localization if nothing else is found
    return game.i18n.localize(`WOD5E.${str}`)

    // Function to actually grab the localized label
    function findLabel (list, string) {
      const stringObject = list.find(obj => string in obj)

      // Return the localized string if found
      if (stringObject) return stringObject[string].displayName

      // Return nothing
      return ''
    }
  }
}
