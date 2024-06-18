/* global WOD5E */

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

  WOD5E.api.RollFromDataset({
    dataset,
    actor,
    data: actor.system
  })
}

/**
  * Handle rolls after the selection dialog window is closed
  * @param {Event} event   The originating click event
  * @private
*/
export const _onConfirmRoll = async function (dataset, actor) {
  // Secondary variables
  const { willpowerDamage, difficulty, disableBasicDice, disableAdvancedDice, quickRoll, rerollHunger, useAbsoluteValue, increaseHunger, decreaseRage } = dataset
  const title = dataset.label
  const data = dataset.itemId ? actor.items.get(dataset.itemId).system : actor.system
  const flavor = dataset.useFlavorPath ? await WOD5E.api.getFlavorDescription({ valuePath: dataset.flavorPath, data }) : dataset.flavor
  const flatMod = parseInt(dataset.flatMod) || 0
  const absoluteValue = parseInt(dataset.absoluteValue) || 0
  const selectors = dataset.selectors ? dataset.selectors.split(' ') : []
  const macro = dataset.itemId ? data.macroid : dataset.macroid

  // Variables yet to be defined
  let basicDice, advancedDice

  // Handle getting any situational modifiers
  const activeBonuses = await getActiveBonuses({
    actor,
    selectors
  })
  const advancedCheckDice = activeBonuses.totalACDValue

  // Get the number of basicDice and advancedDice
  if (disableBasicDice && useAbsoluteValue) {
    // For when basic dice are disabled and we want the
    // advanced dice to equal the absoluteValue given
    advancedDice = absoluteValue + activeBonuses.totalValue
    basicDice = 0
  } else if (disableBasicDice) {
    // If just the basicDice are disabled, set it to 0
    // and retrieve the appropriate amount of advanced dice
    basicDice = 0
    advancedDice = disableAdvancedDice ? 0 + activeBonuses.totalValue : await WOD5E.api.getAdvancedDice(actor) + activeBonuses.totalValue
  } else {
    // Calculate basicDice based on different conditions
    if (useAbsoluteValue) {
      // If basic dice aren't disabled, but we use the absolute
      // value, add the absoluteValue and the flatMod together
      basicDice = absoluteValue + flatMod + activeBonuses.totalValue
    } else {
      // All other, more normal, circumstances where basicDice
      // are calculated normally
      basicDice = await WOD5E.api.getBasicDice({ valuePaths: dataset.valuePaths, flatMod: flatMod + activeBonuses.totalValue, actor })
    }

    // Retrieve the appropriate amount of advanced dice
    advancedDice = disableAdvancedDice ? 0 : await WOD5E.api.getAdvancedDice({ actor })
  }

  // Define the actor's gamesystem, defaulting to "mortal" if it's not in the systems list
  const system = actor.system.gamesystem in WOD5E.Systems.getList() ? actor.system.gamesystem : 'mortal'

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
    willpowerDamage,
    difficulty,
    flavor,
    quickRoll,
    rerollHunger,
    increaseHunger,
    decreaseRage,
    selectors,
    macro,
    advancedCheckDice
  })
}
