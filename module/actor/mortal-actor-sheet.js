/* global game, foundry */

// Export this function to be used in other scripts
import { WoDActor } from './wod-v5-sheet.js'

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {WoDActor}
 */

export class MortalActorSheet extends WoDActor {
  /** @override */
  static get defaultOptions () {
    // Define the base list of CSS classes
    const classList = ['wod5e', 'sheet', 'actor', 'mortal']

    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: classList,
      template: 'systems/vtm5e/templates/actor/mortal-sheet.hbs',
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
    this.hasBoons = true
  }

  /** @override */
  get template () {
    if (!game.user.isGM && this.actor.limited) return 'systems/vtm5e/templates/actor/limited-sheet.hbs'
    return 'systems/vtm5e/templates/actor/mortal-sheet.hbs'
  }

  /* -------------------------------------------- */

  /** @override */
  async getData () {
    // Top-level variables
    const data = await super.getData()
    const actor = this.actor

    // Define the type of sheet
    data.sheetType = `${game.i18n.localize('WOD5E.Mortal')}`

    // Prepare items
    if (actor.type === 'mortal') {
      this._prepareItems(data)
    }

    return data
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners (html) {
    // Activate listeners
    super.activateListeners(html)
  }
}
