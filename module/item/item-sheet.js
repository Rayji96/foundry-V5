/* global ItemSheet, mergeObject */

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class VampireItemSheet extends ItemSheet {
  /** @override */
  static get defaultOptions () {
    // Define the base list of CSS classes
    const classList = ['vtm5e', 'sheet', 'item']

    // If the user's enabled darkmode, then push it to the class list
    if (game.settings.get('vtm5e', 'darkTheme')) { // eslint-disable-line
      classList.push('dark-theme')
    }

    return mergeObject(super.defaultOptions, {
      classes: classList,
      width: 520,
      height: 480,
      tabs: [{
        navSelector: '.sheet-tabs',
        contentSelector: '.sheet-body',
        initial: 'description'
      }]
    })
  }

  /** @override */
  get template () {
    const path = 'systems/vtm5e/templates/item'
    // Return a single sheet for all item types.
    // return `${path}/item-sheet.html`;

    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.html`.
    return `${path}/item-${this.item.data.type}-sheet.html`
  }

  /* -------------------------------------------- */

  /** @override */
  getData () {
    const data = super.getData()
    return data
  }

  /* -------------------------------------------- */

  /** @override */
  setPosition (options = {}) {
    const position = super.setPosition(options)
    const sheetBody = this.element.find('.sheet-body')
    const bodyHeight = position.height - 192
    sheetBody.css('height', bodyHeight)
    return position
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners (html) {
    super.activateListeners(html)

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return

    // Rollable Checkbox Handler.
    const rollCheckbox = document.querySelector('input[type="checkbox"][name="data.rollable"]')

    if (rollCheckbox != null) {
      rollCheckbox.addEventListener('change', () => {
        if (rollCheckbox.checked) {
          this.item.update({ 'data.rollable': true })
        } else {
          this.item.update({ 'data.rollable': false })
        }
      })
    }

    // Skill Checkbox Handler.
    const skillCheckbox = document.querySelector('input[type="checkbox"][name="data.skill"]')

    if (skillCheckbox != null) {
      skillCheckbox.addEventListener('change', () => {
        if (skillCheckbox.checked) {
          this.item.update({ 'data.skill': true })
        } else {
          this.item.update({ 'data.skill': false })
        }
      })
    }
  }
}
