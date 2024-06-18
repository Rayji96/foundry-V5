/* global game, foundry */

import { WOD5eDice } from '../scripts/system-rolls.js'
import { GhoulActorSheet } from './ghoul-actor-sheet.js'
import { getBloodPotencyValues, getBloodPotencyText } from './scripts/blood-potency.js'

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {GhoulActorSheet}
 */

export class VampireActorSheet extends GhoulActorSheet {
  /** @override */
  static get defaultOptions () {
    // Define the base list of CSS classes
    const classList = ['wod5e', 'sheet', 'actor', 'vampire', 'vampire-sheet']

    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: classList,
      template: 'systems/vtm5e/templates/actor/vampire-sheet.hbs',
      width: 940,
      height: 700,
      tabs: [{
        navSelector: '.sheet-tabs',
        contentSelector: '.sheet-body',
        initial: 'stats'
      }]
    })
  }

  constructor (actor, options) {
    super(actor, options)
    this.isCharacter = true
  }

  /** @override */
  get template () {
    if (!game.user.isGM && this.actor.limited) return 'systems/vtm5e/templates/actor/limited-sheet.hbs'
    return 'systems/vtm5e/templates/actor/vampire-sheet.hbs'
  }

  /* -------------------------------------------- */

  /** @override */
  async getData () {
    const data = await super.getData()

    this._prepareItems(data)

    return data
  }

  /**
     * set Blood Potency for Vampire sheets.
     *
     * @param {Object} actorData The actor to prepare.
     * @return {undefined}
     * @override
     */
  async _prepareItems (sheetData) {
    // Prepare items
    super._prepareItems(sheetData)

    // Top-level variables
    const actorData = sheetData.actor
    const actor = this.actor

    // Define various blood potency values
    actorData.system.bloodPotencyValue = parseInt(actor.system.blood.potency)
    sheetData.blood_potency_text = getBloodPotencyText(actorData.system.bloodPotencyValue)
    actorData.system.bloodPotency = getBloodPotencyValues(actorData.system.bloodPotencyValue)

    // Handle adding blood potency bonuses
    actorData.system.blood.bonuses = [
      {
        source: game.i18n.localize('WOD5E.VTM.BloodPotency'),
        value: actorData.system.bloodPotency.power,
        paths: ['disciplines'],
        activeWhen: {
          check: 'always'
        }
      },
      {
        source: game.i18n.localize('WOD5E.VTM.BloodSurge'),
        value: actorData.system.bloodPotency.surge,
        paths: ['all'],
        unless: ['willpower', 'humanity', 'extended'],
        displayWhenInactive: true,
        activeWhen: {
          check: 'isPath',
          path: 'blood-surge'
        },
        advancedCheckDice: 1
      }
    ]
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  // Event Listeners
  /** @override */
  activateListeners (html) {
    // Activate listeners
    super.activateListeners(html)

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return

    // Rollable gift buttons
    html.find('.remorse-roll').click(this._onRemorseRoll.bind(this))
    html.find('.frenzy-roll').click(this._onFrenzyRoll.bind(this))
  }

  // Roll Handlers
  async _onRemorseRoll (event) {
    event.preventDefault()

    // Top-level variables
    const actor = this.actor

    // Secondary variables
    const humanity = actor.system.humanity.value
    const stain = actor.system.humanity.stains
    const dicePool = Math.max((10 - humanity - stain), 1)

    WOD5eDice.Roll({
      basicDice: dicePool,
      title: game.i18n.localize('WOD5E.VTM.RollingRemorse'),
      paths: ['humanity'],
      actor,
      data: actor.system,
      quickRoll: true,
      disableAdvancedDice: true,
      callback: (rollData) => {
        const hasSuccess = rollData.terms[0].results.some(result => result.success)

        // Reduce humanity by 1 if the roll fails, otherwise reset stain to 0 in any other cases
        if (hasSuccess) {
          actor.update({ 'system.humanity.stains': 0 })
        } else {
          actor.update({ 'system.humanity.value': Math.max(humanity - 1, 0) })
          actor.update({ 'system.humanity.stains': 0 })
        }
      }
    })
  }

  async _onFrenzyRoll (event) {
    event.preventDefault()

    // Top-level variables
    const actor = this.actor

    // Secondary variables
    const willpowerDicePool = this.getWillpowerDicePool(actor)
    const humanity = actor.system.humanity.value
    const dicePool = Math.max(willpowerDicePool + Math.floor(humanity / 3), 1)

    WOD5eDice.Roll({
      basicDice: dicePool,
      title: game.i18n.localize('WOD5E.VTM.ResistingFrenzy'),
      actor,
      data: actor.system,
      disableAdvancedDice: true
    })
  }
}
