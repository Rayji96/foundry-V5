/* global game, mergeObject */

import { GhoulActorSheet } from './ghoul-actor-sheet.js'
import { getBloodPotencyValues, getBloodPotencyText } from './blood-potency.js'
import { rollDice } from './roll-dice.js'

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {GhoulActorSheet}
 */

export class VampireActorSheet extends GhoulActorSheet {
  /** @override */
  static get defaultOptions () {
    // Define the base list of CSS classes
    const classList = ['vtm5e', 'sheet', 'actor', 'vampire']

    // If the user's enabled darkmode, then push it to the class list
    if (game.settings.get('vtm5e', 'darkTheme')) {
      classList.push('dark-theme')
    }

    return mergeObject(super.defaultOptions, {
      classes: classList,
      template: 'systems/vtm5e/templates/actor/vampire-sheet.html',
      width: 800,
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
    this.hunger = true
  }

  /** @override */
  get template () {
    if (!game.user.isGM && this.actor.limited) return 'systems/vtm5e/templates/actor/limited-sheet.html'
    return 'systems/vtm5e/templates/actor/vampire-sheet.html'
  }

  /* -------------------------------------------- */

  /** @override */
  async getData () {
    const data = await super.getData()

    data.sheetType = `${game.i18n.localize('VTM5E.Vampire')}`

    // Prepare items.
    if (this.actor.type === 'vampire' ||
    this.actor.type === 'character'
    ) {
      this._prepareItems(data)
    }

    return data
  }

  /**
     * set Blood Potency for Vampire sheets.
     *
     * @param {Object} actorData The actor to prepare.
     * @return {undefined}
     * @override
     */
  _prepareItems (sheetData) {
    super._prepareItems(sheetData)

    const actorData = sheetData.actor
    actorData.bloodPotencyValue = parseInt(this.actor.system.blood.potency)
    sheetData.blood_potency_text = getBloodPotencyText(actorData.bloodPotencyValue)
    actorData.bloodPotency = getBloodPotencyValues(actorData.bloodPotencyValue)
    actorData.system.gamesystem = 'vampire'
  }

  /** @override */
  _onVampireRoll (event) {
    event.preventDefault()
    const element = event.currentTarget
    const dataset = element.dataset
    const item = this.actor.items.get(dataset.id)
    let disciplineValue = 0
    if (item.system.discipline === 'rituals') {
      disciplineValue = this.actor.system.disciplines.sorcery.value
    } else if (item.system.discipline === 'ceremonies') {
      disciplineValue = this.actor.system.disciplines.oblivion.value
    } else {
      disciplineValue = this.actor.system.disciplines[item.system.discipline].value
    }
    disciplineValue += this.actor.bloodPotency.power // Blood potency power adds dices to discipline rolls only

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
    rollDice(dicePool, this.actor, `${item.name}`, 0, this.hunger)
  }
}
