/* global game, mergeObject */

// Export this function to be used in other scripts
import { CoterieActorSheet } from './coterie-actor-sheet.js'

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {CoterieActorSheet}
 */

export class MortalActorSheet extends CoterieActorSheet {
  /** @override */
  static get defaultOptions () {
    // Define the base list of CSS classes
    const classList = ['wod5e', 'sheet', 'actor', 'mortal']

    // If the user's enabled darkmode, then push it to the class list
    if (game.settings.get('vtm5e', 'darkTheme')) {
      classList.push('dark-theme')
    }

    return mergeObject(super.defaultOptions, {
      classes: classList,
      template: 'systems/vtm5e/templates/actor/mortal-sheet.html',
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
    if (!game.user.isGM && this.actor.limited) return 'systems/vtm5e/templates/actor/limited-sheet.html'
    return 'systems/vtm5e/templates/actor/mortal-sheet.html'
  }

  /* -------------------------------------------- */

  /** @override */
  async getData () {
    const data = await super.getData()

    data.sheetType = `${game.i18n.localize('WOD5E.Mortal')}`

    // Prepare items.
    if (this.actor.type === 'mortal') {
      this._prepareItems(data)
    }

    return data
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners (html) {
    super.activateListeners(html)
  }
}
