/* global game, mergeObject, TextEditor */

import { WoDv5Actor } from './wod-v5-sheet.js'

/**
 * Extend the base WoDv5Actor with anything necessary for the new actor sheet
 * @extends {WoDv5Actor}
 */

export class CoterieActorSheet extends WoDv5Actor {
  /** @override */
  static get defaultOptions () {
    // Define the base list of CSS classes
    const classList = ['vtm5e', 'sheet', 'actor', 'coterie', 'coterie-sheet']

    // If the user's enabled darkmode, then push it to the class list
    if (game.settings.get('vtm5e', 'darkTheme')) {
      classList.push('dark-theme')
    }

    return mergeObject(super.defaultOptions, {
      classes: classList,
      template: 'systems/vtm5e/templates/actor/coterie-sheet.html',
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
    if (!game.user.isGM && this.actor.limited) return 'systems/vtm5e/templates/actor/limited-sheet.html'
    return 'systems/vtm5e/templates/actor/coterie-sheet.html'
  }

  /* -------------------------------------------- */

  /** @override */
  async getData () {
    const data = await super.getData()
    data.hasBoons = this.hasBoons

    data.sheetType = `${game.i18n.localize('VTM5E.Coterie')}`

    data.dtypes = ['String', 'Number', 'Boolean']

    // Encrich editor content
    data.enrichedBiography = await TextEditor.enrichHTML(this.object.system.biography, { async: true })
    data.enrichedAppearance = await TextEditor.enrichHTML(this.object.system.appearance, { async: true })
    data.enrichedNotes = await TextEditor.enrichHTML(this.object.system.notes, { async: true })
    data.enrichedEquipment = await TextEditor.enrichHTML(this.object.system.equipment, { async: true })

    // Prepare items.
    if (this.actor.type === 'coterie') {
      this._prepareItems(data)
    }

    return data
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners (html) {
    super.activateListeners(html)

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return
  }
}
