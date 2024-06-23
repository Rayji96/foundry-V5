/* global Dialog, game, foundry, WOD5E */

import { WoDActor } from './wod-v5-sheet.js'
import { Skills } from '../def/skills.js'

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {WoDActor}
 */

export class SPCActorSheet extends WoDActor {
  /** @override */
  static get defaultOptions () {
    // Define the base list of CSS classes
    const classList = ['wod5e', 'sheet', 'actor', 'spc']

    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: classList,
      template: 'systems/vtm5e/templates/actor/spc-sheet.hbs',
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
    if (!game.user.isGM && this.actor.limited) return 'systems/vtm5e/templates/actor/limited-sheet.hbs'
    return 'systems/vtm5e/templates/actor/spc-sheet.hbs'
  }

  /* -------------------------------------------- */

  /** @override */
  async getData () {
    // Top-level variables
    const data = await super.getData()

    // Prepare items
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
  async _prepareItems (sheetData) {
    // Top-level variables
    const actorData = sheetData.actor

    // Secondary variables
    const exceptionaldicepools = []

    // Prepare items
    super._prepareItems(sheetData)

    // Loop through each entry in the skills list, get the data (if available), and then push to the containers
    const skillsList = Skills.getList({})
    const actorSkills = actorData.system?.exceptionaldicepools

    if (actorSkills) {
      // Clean up non-existent skills, such as custom ones that no longer exist
      const validSkills = new Set(Object.keys(skillsList))
      for (const id of Object.keys(actorSkills)) {
        if (!validSkills.has(id)) {
          delete actorSkills[id]
        }
      }

      for (const [id, value] of Object.entries(skillsList)) {
        let skillData = {}
        let hasSpecialties = false
        const specialtiesList = []

        if (actorSkills[id]?.bonuses?.length > 0) {
          hasSpecialties = true

          for (const bonus of actorSkills[id].bonuses) {
            specialtiesList.push(bonus.source)
          }
        }

        // If the actor has a skill with the key, grab its current values
        if (Object.prototype.hasOwnProperty.call(actorSkills, id)) {
          skillData = Object.assign({
            id,
            value: actorSkills[id].value,
            hasSpecialties,
            specialtiesList,
            visible: actorSkills[id].visible
          }, value)
        } else { // Otherwise, add it to the actor and set it as some default data
          await this.actor.update({ [`system.exceptionaldicepools.${id}`]: { value: 0 } })

          skillData = Object.assign({
            id,
            value: 0,
            hasSpecialties,
            specialtiesList
          }, value)
        }

        // Push to the container as long as the skill isn't "hidden"
        if (!skillData.hidden && skillData.visible) {
          exceptionaldicepools.push(skillData)
        }
      }
    }

    actorData.system.exceptionaldicepools_list = exceptionaldicepools
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners (html) {
    // Activate listeners
    super.activateListeners(html)

    // Top-level variables
    const actor = this.actor

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return

    // Make Exceptional Skill visible
    html.find('.exceptionalskill-create').click(this._onShowExceptionalSkill.bind(this))

    // Make Exceptional Skill hidden
    html.find('.exceptionalskill-delete').click(ev => {
      const data = $(ev.currentTarget)[0].dataset
      actor.update({ [`system.exceptionaldicepools.${data.exceptionalskill}.visible`]: false })
    })

    // Make Discipline visible
    html.find('.discipline-create').click(this._onShowDiscipline.bind(this))

    // Make Discipline hidden
    html.find('.discipline-delete').click(ev => {
      const data = $(ev.currentTarget)[0].dataset
      actor.update({ [`system.disciplines.${data.discipline}.visible`]: false })
    })
  }

  /**
     * Handle making a exceptional skills visible
     * @param {Event} event   The originating click event
     * @private
     */
  _onShowExceptionalSkill (event) {
    event.preventDefault()

    // Top-level variables
    const actor = this.actor

    // Variables yet to be defined
    let options = ''
    let buttons = {}

    // Gather and push the list of options to the 'options' variable
    for (const [key, value] of Object.entries(WOD5E.Skills.getList({}))) {
      options = options.concat(`<option value="${key}">${game.i18n.localize(value.displayName)}</option>`)
    }

    // Define the template to be used
    const template = `
      <form>
          <div class="form-group">
              <label>${game.i18n.localize('WOD5E.SPC.SelectSkill')}</label>
              <select id="skillSelect">${options}</select>
          </div>
      </form>`

    // Define any buttons needed and add them to the buttons variable
    buttons = {
      submit: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize('WOD5E.Add'),
        callback: async (html) => {
          // Define the skill being used
          const exceptionalskill = html.find('#skillSelect')[0].value

          // If the dicepool wasn't already visible, make it visible
          actor.update({ [`system.exceptionaldicepools.${exceptionalskill}.visible`]: true })
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize('WOD5E.Cancel')
      }
    }

    // Display the dialog
    new Dialog({
      title: game.i18n.localize('WOD5E.SPC.AddSkill'),
      content: template,
      buttons,
      default: 'submit'
    },
    {
      classes: ['wod5e', 'mortal-dialog', 'mortal-sheet']
    }).render(true)
  }

  /**
     * Handle making a discipline visible
     * @param {Event} event   The originating click event
     * @private
     */
  _onShowDiscipline (event) {
    event.preventDefault()

    // Top-level variables
    const actor = this.actor

    // Variables yet to be defined
    let options = ''
    let buttons = {}

    // Gather and push the list of options to the 'options' variable
    for (const [key, value] of Object.entries(actor.system.disciplines)) {
      options = options.concat(`<option value="${key}">${game.i18n.localize(value.name)}</option>`)
    }

    // Define the template to be used
    const template = `
      <form>
          <div class="form-group">
              <label>${game.i18n.localize('WOD5E.VTM.SelectDiscipline')}</label>
              <select id="disciplineSelect">${options}</select>
          </div>
      </form>`

    // Define any buttons needed and add them to the buttons variable
    buttons = {
      submit: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize('WOD5E.Add'),
        callback: async (html) => {
          // Define the selected discipline
          const discipline = html.find('#disciplineSelect')[0].value

          // If the discipline wasn't already visible, make it visible
          actor.update({ [`system.disciplines.${discipline}.visible`]: true })
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize('WOD5E.Cancel')
      }
    }

    // Display the dialog
    new Dialog({
      title: game.i18n.localize('WOD5E.VTM.AddDiscipline'),
      content: template,
      buttons,
      default: 'submit'
    },
    {
      classes: ['wod5e', 'vampire-dialog', 'vampire-sheet']
    }).render(true)
  }
}
