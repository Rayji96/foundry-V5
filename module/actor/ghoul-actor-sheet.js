/* global game, foundry, renderTemplate, ChatMessage */

import { WOD5eDice } from '../scripts/system-rolls.js'
import { getActiveBonuses } from '../scripts/rolls/situational-modifiers.js'
import { MortalActorSheet } from './mortal-actor-sheet.js'

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {MortalActorSheet}
 */

export class GhoulActorSheet extends MortalActorSheet {
  /** @override */
  static get defaultOptions () {
    // Define the base list of CSS classes
    const classList = ['wod5e', 'sheet', 'actor', 'ghoul', 'ghoul-sheet']

    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: classList,
      template: 'systems/vtm5e/templates/actor/ghoul-sheet.hbs',
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
    if (!game.user.isGM && this.actor.limited) return 'systems/vtm5e/templates/actor/limited-sheet.hbs'
    return 'systems/vtm5e/templates/actor/ghoul-sheet.hbs'
  }

  /* -------------------------------------------- */

  /** @override */
  async getData () {
    // Top-level variables
    const data = await super.getData()
    const actor = this.actor

    // Prepare items.
    if (actor.type === 'ghoul') {
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
  async _prepareItems (sheetData) {
    // Prepare items
    super._prepareItems(sheetData)

    // Top-level variables
    const actorData = sheetData.actor
    const actor = this.actor

    // Variables yet to be defined
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
      // Make sure the item is a power and has a discipline
      if (i.type === 'power' && i.system.discipline) {
        // Append to disciplines list
        disciplines[i.system.discipline].push(i)

        // If the discipline isn't already visible, make it visible
        if (!actor.system.disciplines[i.system.discipline].visible) {
          actor.update({ [`system.disciplines.${i.system.discipline}.visible`]: true })
        }
      }
    }

    // Sort the discipline containers by the level of the power instead of by creation date
    for (const discipline in disciplines) {
      disciplines[discipline] = disciplines[discipline].sort(function (power1, power2) {
        // If the levels are the same, sort alphabetically instead
        if (power1.system.level === power2.system.level) {
          return power1.name.localeCompare(power2.name)
        }

        // Sort by level
        return power1.system.level - power2.system.level
      })
    }

    // Assign and return the disciplines list
    actorData.system.disciplines_list = disciplines
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners (html) {
    // Activate listeners
    super.activateListeners(html)

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return

    // Top-level variables
    const actor = this.actor

    // Make Discipline hidden
    html.find('.discipline-delete').click(async ev => {
      const data = $(ev.currentTarget)[0].dataset
      actor.update({ [`system.disciplines.${data.discipline}.visible`]: false })
    })

    // Post Discipline description to the chat
    html.find('.discipline-chat').click(async event => {
      const data = $(event.currentTarget)[0].dataset
      const discipline = actor.system.disciplines[data.discipline]

      renderTemplate('systems/vtm5e/templates/chat/chat-message.hbs', {
        name: game.i18n.localize(discipline.name),
        img: 'icons/svg/dice-target.svg',
        description: discipline.description
      }).then(html => {
        ChatMessage.create({
          content: html
        })
      })
    })

    // Roll a rouse check for an item
    html.find('.item-rouse').click(async event => {
      event.preventDefault()

      // Top-level variables
      const actor = this.actor
      const li = $(event.currentTarget).parents('.item')
      const item = actor.getEmbeddedDocument('Item', li.data('itemId'))

      // Secondary variables
      const level = item.system.level
      const cost = item.system.cost > 0 ? item.system.cost : 1
      const selectors = ['rouse']
      const macro = item.system.macroid

      // Vampires roll rouse checks
      if (actor.type === 'vampire') {
        const potency = actor.type === 'vampire' ? actor.system.blood.potency : 0
        const rouseRerolls = this.potencyToRouse(potency, level)

        // Handle getting any situational modifiers
        const activeBonuses = await getActiveBonuses({
          actor,
          selectors
        })

        // Send the roll to the system
        WOD5eDice.Roll({
          advancedDice: cost + activeBonuses.totalValue,
          title: game.i18n.localize('WOD5E.VTM.RousingBlood'),
          actor,
          disableBasicDice: true,
          rerollHunger: rouseRerolls,
          increaseHunger: true,
          selectors,
          macro
        })
      } else if (actor.type === 'ghoul' && level > 1) {
        // Ghouls take aggravated damage for using powers above level 1 instead of rolling rouse checks
        const actorHealth = actor.system.health
        const actorHealthMax = actorHealth.max
        const currentAggr = actorHealth.aggravated
        let newAggr = parseInt(currentAggr) + 1

        // Make sure aggravated can't go over the max
        if (newAggr > actorHealthMax) {
          newAggr = actorHealthMax
        }

        // Update the actor with the new health
        actor.update({ 'system.health.aggravated': newAggr })
      }
    })

    // Rollable Vampire/Ghouls powers
    html.find('.power-rollable').click(this._onVampireRoll.bind(this))
  }

  async _onVampireRoll (event) {
    event.preventDefault()

    // Top-level variables
    const actor = this.actor
    const element = event.currentTarget
    const dataset = Object.assign({}, element.dataset)
    const item = actor.items.get(dataset.id)

    // Secondary variables
    const itemDiscipline = item.system.discipline
    const hunger = actor.type === 'vampire' ? actor.system.hunger.value : 0
    const macro = item.system.macroid

    // Variables yet to be defined
    let disciplineValue, dice1, dice2
    const selectors = []

    // Assign any rituals to use Blood Sorcery value
    // and any ceremonies to use Oblivion value, otherwise
    // just use the normal disciplines path and value
    if (itemDiscipline === 'rituals') {
      disciplineValue = actor.system.disciplines.sorcery.value
    } else if (itemDiscipline === 'ceremonies') {
      disciplineValue = actor.system.disciplines.oblivion.value
    } else {
      disciplineValue = actor.system.disciplines[itemDiscipline].value
    }

    // Handle the first set of dice and any logic that it needs
    if (item.system.dice1 === 'discipline') {
      dice1 = disciplineValue
    } else {
      dice1 = actor.system.abilities[item.system.dice1].value
      selectors.push(...['abilities', `abilities.${item.system.dice1}`])
    }

    // If either set of dice are a discipline power, push the necessary selectors
    if (item.system.dice1 === 'discipline' || item.system.dice2 === 'discipline') {
      selectors.push('disciplines')

      if (itemDiscipline === 'rituals') {
        selectors.push('disciplines.sorcery')
      } else if (itemDiscipline === 'ceremonies') {
        selectors.push('disciplines.oblivion')
      } else {
        selectors.push(`disciplines.${itemDiscipline}`)
      }
    }

    // Handle the second set of dice and logic that it needs
    if (item.system.dice2 === 'discipline') {
      // Use the previously declared disciplineValue
      dice2 = disciplineValue
    } else if (item.system.skill) {
      // Get the skill value and push the skill selectors
      dice2 = actor.system.skills[item.system.dice2].value
      selectors.push(...['skills', `skills.${item.system.dice2}`])
    } else if (item.system.amalgam) {
      // Get the second discipline roll
      dice2 = actor.system.disciplines[item.system.dice2].value

      // Push the selector for the second discipline
      if (item.system.dice2 === 'rituals') {
        selectors.push('disciplines.sorcery')
      } else if (item.system.dice2 === 'ceremonies') {
        selectors.push('disciplines.oblivion')
      } else {
        selectors.push(`disciplines.${itemDiscipline}`)
      }
    } else {
      // Get the ability value and push the selectors
      dice2 = actor.system.abilities[item.system.dice2].value
      selectors.push(...['abilities', `abilities.${item.system.dice2}`])
    }

    // Handle getting any situational modifiers
    const activeBonuses = await getActiveBonuses({
      actor,
      selectors
    })

    const dicePool = dice1 + dice2 + activeBonuses.totalValue

    WOD5eDice.Roll({
      basicDice: Math.max(dicePool - hunger, 0),
      advancedDice: Math.min(dicePool, hunger),
      title: item.name,
      actor,
      data: item.system,
      selectors,
      macro
    })
  }

  potencyToRouse (potency, level) {
    // Define whether to reroll dice based on the user's blood potency
    // and the power's level
    if (potency === 0) {
      // Potency 0 never rolls additional rouse dice for disciplines
      return false
    } else if (potency > 8) {
      // Potency of 9 and 10 always roll additional rouse dice for disciplines
      return true
    } else if (potency > 6 && level < 5) {
      // Potency 7 and 8 roll additional rouse dice on discipline powers below 5
      return true
    } else if (potency > 4 && level < 4) {
      // Potency 5 and 6 roll additional rouse dice on discipline powers below 4
      return true
    } else if (potency > 2 && level < 3) {
      // Potency 3 and 4 roll additional rouse dice on discipline powers below 3
      return true
    } else if (potency > 0 && level < 2) {
      // Potency 1 and 2 roll additional rouse dice on discipline powers below 2
      return true
    }

    // If none of the above are true, just roll 1 dice for the rouse check
    return false
  }
}
