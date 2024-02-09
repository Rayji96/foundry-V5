/* global renderTemplate, Dialog, game */

import { WOD5eDice } from '../../scripts/system-rolls.js'
import { getActiveBonuses } from '../../scripts/rolls/situational-modifiers.js'

/**
   * Handle clickable rolls activated through buttons
   * @param {Event} event   The originating click event
   * @private
*/
export const _onRoll = async function (event) {
  event.preventDefault()

  // Top-level variables
  const actor = this.actor
  const element = event.currentTarget
  const dataset = Object.assign({}, element.dataset)

  // If selectDialog isn't set, just skip to the next dialog immediately
  if (!dataset.selectDialog) return _onConfirmRoll(dataset, actor)

  // Secondary variables
  const { skill, attribute, discipline, renown } = dataset

  // Define the actor's gamesystem, defaulting to "mortal" if it's not in the systemsList
  const systemsList = ['vampire', 'werewolf', 'hunter', 'mortal']
  const system = systemsList.indexOf(actor.system.gamesystem) > -1 ? actor.system.gamesystem : 'mortal'

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
              dataset.label += ` + ${await generateLabelAndLocalize(skillSelect)}`

              // Add it to the value path if applicable
              if (dataset.valuePaths) dataset.valuePaths += ` skills.${skillSelect}.value`

              // If using absolute values instead of value paths, add the values together
              if (dataset.useAbsoluteValue && dataset.absoluteValue) dataset.absoluteValue += actor.system.skills[skillSelect].value
            }
            // Handle adding an attribute to the dicepool
            if (attributeSelect) {
              // Add it to the label
              dataset.label += ` + ${await generateLabelAndLocalize(attributeSelect)}`

              // Add it to the value path if applicable
              if (dataset.valuePaths) dataset.valuePaths += ` abilities.${attributeSelect}.value`

              // If using absolute values instead of value paths, add the values together
              if (dataset.useAbsoluteValue && dataset.absoluteValue) dataset.absoluteValue += actor.system.abilities[attributeSelect].value
            }
            // Handle adding a discipline to the dicepool
            if (disciplineSelect) {
              // Add it to the label
              dataset.label += ` + ${await generateLabelAndLocalize(disciplineSelect)}`

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
              dataset.label += ` + ${await generateLabelAndLocalize(renownSelect)}`

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

/**
   * Handle rolls after the selection dialog window is closed
   * @param {Event} event   The originating click event
   * @private
*/
export const _onConfirmRoll = async function (dataset, actor) {
  // Secondary variables
  const { damageWillpower, difficulty, disableBasicDice, disableAdvancedDice, quickRoll, rerollHunger, useAbsoluteValue, increaseHunger, decreaseRage } = dataset
  const title = dataset.label
  const data = dataset.itemId ? actor.items.get(dataset.itemId).system : actor.system
  const flavor = dataset.useFlavorPath ? await getFlavorDescription(dataset.flavorPath, data) : dataset.flavor
  const flatMod = parseInt(dataset.flatMod) || 0
  const absoluteValue = parseInt(dataset.absoluteValue) || 0
  const selectors = dataset.selectors ? dataset.selectors.split(' ') : []

  // Variables yet to be defined
  let basicDice, advancedDice

  // Handle getting any situational modifiers
  const activeBonuses = await getActiveBonuses({
    actor,
    selectors
  })

  // Get the number of basicDice and advancedDice
  if (disableBasicDice && useAbsoluteValue) {
    // For when basic dice are disabled and we want the
    // advanced dice to equal the absoluteValue given
    advancedDice = absoluteValue + activeBonuses
    basicDice = 0
  } else if (disableBasicDice) {
    // If just the basicDice are disabled, set it to 0
    // and retrieve the appropriate amount of advanced dice
    basicDice = 0
    advancedDice = disableAdvancedDice ? 0 + activeBonuses : await getAdvancedDice(actor) + activeBonuses
  } else {
    // Calculate basicDice based on different conditions
    if (useAbsoluteValue) {
      // If basic dice aren't disabled, but we use the absolute
      // value, add the absoluteValue and the flatMod together
      basicDice = absoluteValue + flatMod + activeBonuses
    } else {
      // All other, more normal, circumstances where basicDice
      // are calculated normally
      basicDice = await getBasicDice(dataset.valuePaths, flatMod + activeBonuses, actor)
    }

    // Retrieve the appropriate amount of advanced dice
    advancedDice = disableAdvancedDice ? 0 : await getAdvancedDice(actor)
  }

  // Define the actor's gamesystem, defaulting to "mortal" if it's not in the systemsList
  const systemsList = ['vampire', 'werewolf', 'hunter', 'mortal']
  const system = systemsList.indexOf(actor.system.gamesystem) > -1 ? actor.system.gamesystem : 'mortal'

  // Some quick modifications to vampire and werewolf rolls
  // in order to properly display the dice in the dialog window
  if (!disableBasicDice) {
    if (system === 'vampire') {
      // Ensure that the number of hunger dice doesn't exceed the
      // total number of dice, unless it's a rouse check that needs
      // rerolls, which requires twice the number of normal hunger
      // dice and only the highest will be kept
      advancedDice = rerollHunger ? advancedDice * 2 : Math.min(basicDice, advancedDice)

      // Calculate the number of normal dice to roll by subtracting
      // the number of hunger dice from them, minimum zero
      basicDice = Math.max(basicDice - advancedDice, 0)
    } else if (system === 'werewolf') {
      // Ensure that the number of rage dice doesn't exceed the
      // total number of dice
      advancedDice = Math.min(basicDice, advancedDice)

      // Calculate the number of normal dice to roll by subtracting
      // the number of rage dice from them, minimum zero
      basicDice = Math.max(basicDice - advancedDice, 0)
    }
  }

  // Send the roll to the system
  WOD5eDice.Roll({
    basicDice,
    advancedDice,
    actor,
    data: actor.system,
    title,
    disableBasicDice,
    disableAdvancedDice,
    damageWillpower,
    difficulty,
    flavor,
    quickRoll,
    rerollHunger,
    increaseHunger,
    decreaseRage,
    selectors
  })
}

// Function to grab the values of any given paths and add them up as the total number of basic dice for the roll
export const getFlavorDescription = async function (valuePath, data) {
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
export const getBasicDice = async function (valuePaths, flatMod, actor) {
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
export const getAdvancedDice = async function (actor) {
  // Top-level variables
  const actorData = actor.system

  // Define the actor's gamesystem, defaulting to "mortal" if it's not in the systemsList
  const systemsList = ['vampire', 'werewolf', 'hunter', 'mortal']
  const system = systemsList.indexOf(actorData.gamesystem) > -1 ? actorData.gamesystem : 'mortal'

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

export const generateLabelAndLocalize = async function (str) {
  const disciplines = {
    animalism: 'WOD5E.VTM.Animalism',
    auspex: 'WOD5E.VTM.Auspex',
    celerity: 'WOD5E.VTM.Celerity',
    dominate: 'WOD5E.VTM.Dominate',
    fortitude: 'WOD5E.VTM.Fortitude',
    obfuscate: 'WOD5E.VTM.Obfuscate',
    potence: 'WOD5E.VTM.Potence',
    presence: 'WOD5E.VTM.Presence',
    protean: 'WOD5E.VTM.Protean',
    sorcery: 'WOD5E.VTM.BloodSorcery',
    oblivion: 'WOD5E.VTM.Oblivion',
    alchemy: 'WOD5E.VTM.ThinBloodAlchemy',
    rituals: 'WOD5E.VTM.Rituals',
    ceremonies: 'WOD5E.VTM.Ceremonies'
  }

  if (Object.prototype.hasOwnProperty.call(disciplines, str)) {
    return `${game.i18n.localize(disciplines[str])}`
  }

  return `${game.i18n.localize('WOD5E.' + str.capitalize())}`
}
