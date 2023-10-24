/* global Dialog, game, mergeObject, renderTemplate, ChatMessage */

import { MortalActorSheet } from './mortal-actor-sheet.js'
import { rollDice } from './roll-dice.js'

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {MortalActorSheet}
 */

export class GhoulActorSheet extends MortalActorSheet {
  /** @override */
  static get defaultOptions () {
    // Define the base list of CSS classes
    const classList = ['vtm5e', 'sheet', 'actor', 'ghoul', 'ghoul-sheet']

    // If the user's enabled darkmode, then push it to the class list
    if (game.settings.get('vtm5e', 'darkTheme')) {
      classList.push('dark-theme')
    }

    return mergeObject(super.defaultOptions, {
      classes: classList,
      template: 'systems/vtm5e/templates/actor/ghoul-sheet.html',
      width: 940,
      height: 700,
      tabs: [{
        navSelector: '.sheet-tabs',
        contentSelector: '.sheet-body',
        initial: 'stats'
      }]
    })
  }

  /** @override */
  get template () {
    if (!game.user.isGM && this.actor.limited) return 'systems/vtm5e/templates/actor/limited-sheet.html'
    return 'systems/vtm5e/templates/actor/ghoul-sheet.html'
  }

  /* -------------------------------------------- */

  /** @override */
  async getData () {
    const data = await super.getData()

    data.sheetType = `${game.i18n.localize('VTM5E.Ghoul')}`

    // Prepare items.
    if (this.actor.type === 'ghoul') {
      this._prepareItems(data)
    }

    return data
  }

  /**
     * Organize and classify Disciplines for Vampire & Ghoul sheets.
     *
     * @param {Object} actorData The actor to prepare.
     * @return {undefined}
     * @override
     */
  _prepareItems (sheetData) {
    super._prepareItems(sheetData)
    const actorData = sheetData.actor

    const disciplines = {
      animalism: [],
      auspex: [],
      celerity: [],
      dominate: [],
      fortitude: [],
      obfuscate: [],
      potence: [],
      presence: [],
      protean: [],
      sorcery: [],
      oblivion: [],
      rituals: [],
      ceremonies: [],
      alchemy: []
    }

    // Iterate through items, allocating to containers
    for (const i of sheetData.items) {
      if (i.type === 'power') {
        // Append to disciplines.
        if (i.system.discipline !== undefined) {
          disciplines[i.system.discipline].push(i)
          if (!this.actor.system.disciplines[i.system.discipline].visible) {
            this.actor.update({ [`system.disciplines.${i.system.discipline}.visible`]: true })
          }
        }
      }
    }

    // Assign and return
    actorData.disciplines_list = disciplines
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners (html) {
    super.activateListeners(html)

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return

    // Make Discipline visible
    html.find('.discipline-create').click(this._onShowDiscipline.bind(this))

    // Make Discipline hidden
    html.find('.discipline-delete').click(ev => {
      const data = $(ev.currentTarget)[0].dataset
      this.actor.update({ [`system.disciplines.${data.discipline}.visible`]: false })
    })

    // Post Discipline description to the chat
    html.find('.discipline-chat').click(ev => {
      const data = $(ev.currentTarget)[0].dataset
      const discipline = this.actor.system.disciplines[data.discipline]

      renderTemplate('systems/vtm5e/templates/actor/parts/chat-message.html', {
        name: game.i18n.localize(discipline.name),
        img: 'icons/svg/dice-target.svg',
        description: discipline.description
      }).then(html => {
        ChatMessage.create({
          content: html
        })
      })
    })

    // Roll a general rouse check
    html.find('.rouse-check').click(event => {
      event.preventDefault()
      const element = event.currentTarget
      const dataset = element.dataset
      const numDice = dataset.roll
      const difficulty = dataset.difficulty

      // See if we need to reduce hunger on this roll
      const increaseHunger = dataset.increaseHunger

      // Roll the rouse check
      rollDice(numDice, this.actor, `${dataset.label}`, difficulty, numDice, increaseHunger)
    })

    // Roll a rouse check for an item
    html.find('.item-rouse').click(ev => {
      const li = $(ev.currentTarget).parents('.item')
      const item = this.actor.getEmbeddedDocument('Item', li.data('itemId'))
      const level = item.system.level

      // Vampires roll rouse checks
      if (this.actor.type === 'vampire') {
        const potency = this.actor.type === 'vampire' ? this.actor.system.blood.potency : 0
        const dicepool = this.potencyToRouse(potency, level)

        rollDice(dicepool, this.actor, game.i18n.localize('VTM5E.RousingBlood'), 1, dicepool, true, false)
      } else if (this.actor.type === 'ghoul' && level > 1) {
        // Ghouls take aggravated damage for using powers above level 1 instead of rolling rouse checks
        const actorHealth = this.actor.system.health
        const actorHealthMax = actorHealth.max
        const currentAggr = actorHealth.aggravated
        let newAggr = Number(currentAggr) + 1

        // Make sure aggravated can't go over the max
        if (newAggr > actorHealthMax) {
          newAggr = actorHealthMax
        }

        this.actor.update({ 'system.health.aggravated': newAggr })
      }
    })

    // Rollable Vampire/Ghouls powers
    html.find('.power-rollable').click(this._onVampireRoll.bind(this))
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
      buttons,
      default: 'draw'
    }).render(true)
  }

  _onVampireRoll (event) {
    event.preventDefault()
    const element = event.currentTarget
    const dataset = element.dataset
    const item = this.actor.items.get(dataset.id)
    const itemDiscipline = item.system.discipline
    const disciplineValue = this.actor.system.disciplines[itemDiscipline].value
    const hunger = this.actor.type === 'vampire' ? this.actor.system.hunger.value : 0

    const dice1 = item.system.dice1 === 'discipline' ? disciplineValue : this.actor.system.abilities[item.system.dice1].value

    let dice2
    if (item.system.dice2 === 'discipline') {
      dice2 = disciplineValue
    } else if (item.system.skill) {
      dice2 = this.actor.system.skills[item.system.dice2].value
    } else if (item.system.amalgam) {
      dice2 = this.actor.system.disciplines[item.system.dice2].value
    } else {
      dice2 = this.actor.system.abilities[item.system.dice2].value
    }

    const dicePool = dice1 + dice2
    rollDice(dicePool, this.actor, `${item.name}`, 0, hunger)
  }

  potencyToRouse (potency, level) {
    // Define the number of dice to roll based on the user's blood potency
    // and the power's level
    // Potency 0 never rolls additional rouse dice for disciplines
    if (potency === 0) {
      return (1)
    } else
    // Potency of 9 and 10 always roll additional rouse dice for disciplines
    if (potency > 8) {
      return (2)
    } else
    // Potency 7 and 8 roll additional rouse dice on discipline powers below 5
    if (potency > 6 && level < 5) {
      return (2)
    } else
    // Potency 5 and 6 roll additional rouse dice on discipline powers below 4
    if (potency > 4 && level < 4) {
      return (2)
    } else
    // Potency 3 and 4 roll additional rouse dice on discipline powers below 3
    if (potency > 2 && level < 3) {
      return (2)
    } else
    // Potency 1 and 2 roll additional rouse dice on discipline powers below 2
    if (potency > 0 && level < 2) {
      return (2)
    }

    // If none of the above are true, just roll 1 dice for the rouse check
    return (1)
  }
}
