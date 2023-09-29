/* global Dialog, duplicate, game, mergeObject */

// Export this function to be used in other scripts
import { CoterieActorSheet } from './coterie-actor-sheet.js'

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {CoterieActorSheet}
 */

export class SPCActorSheet extends CoterieActorSheet {
  /** @override */
  static get defaultOptions () {
    // Define the base list of CSS classes
    const classList = ['vtm5e', 'sheet', 'actor', 'spc']

    // If the user's enabled darkmode, then push it to the class list
    if (game.settings.get('vtm5e', 'darkTheme')) {
      classList.push('dark-theme')
    }

    return mergeObject(super.defaultOptions, {
      classes: classList,
      template: 'systems/vtm5e/templates/actor/spc-sheet.html',
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
    this.hunger = false
    this.hasBoons = true
  }

  /** @override */
  get template () {
    if (!game.user.isGM && this.actor.limited) return 'systems/vtm5e/templates/actor/limited-sheet.html'
    return 'systems/vtm5e/templates/actor/spc-sheet.html'
  }

  /* -------------------------------------------- */

  /** @override */
  async getData () {
    const data = await super.getData()
    // TODO: confirm that I can finish and use this list
    data.sheetType = `${game.i18n.localize('VTM5E.SPC')}`

    // Prepare items.
    if (this.actor.type === 'spc') {
      this._prepareItems(data)
    }

    return data
  }

  /**
     * Organize and classify Items for all sheets.
     *
     * @param {Object} actorData The actor to prepare.
     * @return {undefined}
     * @override
     */
  _prepareItems (sheetData) {
    super._prepareItems(sheetData)
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners (html) {
    super.activateListeners(html)

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this))
    html.find('.rollable-with-mod').click(this._onRollWithMod.bind(this))

    // Make Discipline visible
    html.find('.discipline-create').click(this._onShowDiscipline.bind(this))

    // Make Discipline hidden
    html.find('.discipline-delete').click(ev => {
      const data = $(ev.currentTarget)[0].dataset
      this.actor.update({ [`system.disciplines.${data.discipline}.visible`]: false })
    })
  }

  /**
     * Handle making a exceptionalskill visible
     * @param {Event} event   The originating click event
     * @private
     */
  _onShowExceptionalSkill (event) {
    event.preventDefault()
    let options = ''
    for (const [key, value] of Object.entries(this.actor.system.exceptionaldicepools)) {
      options = options.concat(`<option value="${key}">${game.i18n.localize(value.name)}</option>`)
    }

    const template = `
      <form>
          <div class="form-group">
              <label>${game.i18n.localize('VTM5E.SelectSkill')}</label>
              <select id="skillSelect">${options}</select>
          </div>
      </form>`

    let buttons = {}
    buttons = {
      draw: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize('VTM5E.Add'),
        callback: async (html) => {
          const exceptionalskill = html.find('#skillSelect')[0].value
          this.actor.update({ [`system.exceptionaldicepools.${exceptionalskill}.visible`]: true })
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize('VTM5E.Cancel')
      }
    }

    new Dialog({
      title: game.i18n.localize('VTM5E.AddSkill'),
      content: template,
      buttons: buttons,
      default: 'draw'
    }).render(true)
  }

  /**
     * Handle making a discipline visible
     * @param {Event} event   The originating click event
     * @private
     */
  _onShowDiscipline (event) {
    event.preventDefault()
    let options = ''
    for (const [key, value] of Object.entries(this.actor.system.disciplines)) {
      options = options.concat(`<option value="${key}">${game.i18n.localize(value.name)}</option>`)
    }

    const template = `
      <form>
          <div class="form-group">
              <label>${game.i18n.localize('VTM5E.SelectDiscipline')}</label>
              <select id="disciplineSelect">${options}</select>
          </div>
      </form>`

    let buttons = {}
    buttons = {
      draw: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize('VTM5E.Add'),
        callback: async (html) => {
          const discipline = html.find('#disciplineSelect')[0].value
          this.actor.update({ [`system.disciplines.${discipline}.visible`]: true })
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize('VTM5E.Cancel')
      }
    }

    new Dialog({
      title: game.i18n.localize('VTM5E.AddDiscipline'),
      content: template,
      buttons: buttons,
      default: 'draw'
    }).render(true)
  }
}