/* global game, mergeObject */

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

    return mergeObject(super.defaultOptions, {
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
  _prepareItems (sheetData) {
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
        source: 'Blood Potency',
        value: actorData.system.bloodPotency.power,
        paths: ['disciplines'],
        activeWhen: {
          check: 'always'
        }
      },
      {
        source: 'Blood Surge',
        value: actorData.system.bloodPotency.surge,
        paths: ['blood-surge'],
        activeWhen: {
          check: 'always'
        },
        displayWhenInactive: true
      }
    ]
  }
}
