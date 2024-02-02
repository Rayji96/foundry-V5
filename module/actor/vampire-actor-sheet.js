/* global game, mergeObject */

import { GhoulActorSheet } from './ghoul-actor-sheet.js'
import { getBloodPotencyValues, getBloodPotencyText } from './blood-potency.js'

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {GhoulActorSheet}
 */

export class VampireActorSheet extends GhoulActorSheet {
  /** @override */
  static get defaultOptions () {
    // Define the base list of CSS classes
    const classList = ['wod5e', 'sheet', 'actor', 'vampire', 'vampire-sheet']

    // If the user has darkmode enabled, then push it to the class list
    if (game.settings.get('vtm5e', 'darkTheme')) {
      classList.push('dark-theme')
    }

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

    data.sheetType = `${game.i18n.localize('WOD5E.Vampire')}`

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
    actorData.bloodPotencyValue = parseInt(actor.system.blood.potency)
    sheetData.blood_potency_text = getBloodPotencyText(actorData.bloodPotencyValue)
    actorData.bloodPotency = getBloodPotencyValues(actorData.bloodPotencyValue)

    // Handle adding blood potency bonuses
    actorData.system.blood.bonuses = [
      {
        source: 'Blood Potency',
        value: actorData.bloodPotency.power,
        paths: ['disciplines'],
        activeWhen: {
          check: 'always'
        }
      },
      {
        source: 'Blood Surge',
        value: actorData.bloodPotency.surge,
        paths: ['blood-surge'],
        activeWhen: {
          check: 'always'
        },
        displayWhenInactive: true
      }
    ]
  }
}
