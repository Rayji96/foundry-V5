/* global game, mergeObject */

import { WoDActor } from './wod-v5-sheet.js'

/**
 * Extend the base WoDActor with anything necessary for the new actor sheet
 * @extends {WoDActor}
 */

export class CoterieActorSheet extends WoDActor {
  /** @override */
  static get defaultOptions () {
    // Define the base list of CSS classes
    const classList = ['wod5e', 'sheet', 'actor', 'coterie', 'coterie-sheet']

    // If the user has darkmode enabled, then push it to the class list
    if (game.settings.get('vtm5e', 'darkTheme')) {
      classList.push('dark-theme')
    }

    return mergeObject(super.defaultOptions, {
      classes: classList,
      template: 'systems/vtm5e/templates/actor/coterie-sheet.hbs',
      width: 940,
      height: 700,
      tabs: [{
        navSelector: '.sheet-tabs',
        contentSelector: '.sheet-body',
        initial: 'features'
      }]
    })
  }

  constructor (actor, options) {
    super(actor, options)
    this.isCharacter = false
  }

  /** @override */
  get template () {
    if (!game.user.isGM && this.actor.limited) return 'systems/vtm5e/templates/actor/limited-sheet.hbs'
    return 'systems/vtm5e/templates/actor/coterie-sheet.hbs'
  }

  /* -------------------------------------------- */

  /** @override */
  async getData () {
    // Top-level variables
    const data = await super.getData()
    const actor = this.actor

    // Define the type of sheet
    data.sheetType = `${game.i18n.localize('WOD5E.Coterie')}`

    // Prepare items.
    if (actor.type === 'coterie') {
      this._prepareItems(data)
    }

    // Show boons on the sheet
    data.hasBoons = this.hasBoons

    // Define data types
    data.dtypes = ['String', 'Number', 'Boolean']

    return data
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners (html) {
    // Activate listeners
    super.activateListeners(html)
  }
}
