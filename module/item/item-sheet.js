/* global ItemSheet, foundry, TextEditor */

import { _onAddBonus, _onDeleteBonus, _onEditBonus } from './scripts/item-bonuses.js'

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class WoDItemSheet extends ItemSheet {
  /** @override */
  static get defaultOptions () {
    // Define the base list of CSS classes
    const classList = ['wod5e', 'sheet', 'item']

    return foundry.utils.mergeObject(super.defaultOptions, {
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

    return `${path}/item-${this.item.type}-sheet.hbs`
  }

  /* -------------------------------------------- */

  /** @override */
  async getData () {
    const data = super.getData()

    // Encrich editor content
    data.enrichedDescription = await TextEditor.enrichHTML(this.object.system.description)
    data.bonuses = this.object.system.bonuses

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

    // Top-level Variables
    const item = this.item

    // Rollable Checkbox Handler.
    const rollCheckbox = document.querySelector('input[type="checkbox"][name="system.rollable"]')

    if (rollCheckbox != null) {
      rollCheckbox.addEventListener('change', () => {
        if (rollCheckbox.checked) {
          this.item.update({ 'system.rollable': true })
        } else {
          this.item.update({ 'system.rollable': false })
        }
      })
    }

    // Skill Checkbox Handler.
    const skillCheckbox = document.querySelector('input[type="checkbox"][name="system.skill"]')

    if (skillCheckbox != null) {
      skillCheckbox.addEventListener('change', () => {
        if (skillCheckbox.checked) {
          this.item.update({ 'system.skill': true })
        } else {
          this.item.update({ 'system.skill': false })
        }
      })
    }

    // Prompt the dialog to add a new bonus
    html.find('.add-bonus').click(async event => {
      _onAddBonus(event, item)
    })

    // Delete a bonus
    html.find('.delete-bonus').click(async event => {
      _onDeleteBonus(event, item)
    })

    // Prompt the dialog to edit a bonus
    html.find('.edit-bonus').click(async event => {
      _onEditBonus(event, item)
    })
  }
}
