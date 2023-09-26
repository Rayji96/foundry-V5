/* global game, mergeObject */

import { MortalActorSheet } from './mortal-actor-sheet.js'
import { rollDice } from './roll-dice.js'

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {MortalActorSheet}
 */

export class WerewolfActorSheet extends MortalActorSheet {
  /** @override */
  static get defaultOptions () {
    // Define the base list of CSS classes
    const classList = ['vtm5e', 'werewolf-sheet', 'actor', 'werewolf']

    // If the user's enabled darkmode, then push it to the class list
    if (game.settings.get('vtm5e', 'darkTheme')) {
      classList.push('dark-theme')
    }

    return mergeObject(super.defaultOptions, {
      classes: classList,
      template: 'systems/vtm5e/templates/actor/werewolf-sheet.html',
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
    this.rage = true
  }

  /** @override */
  get template () {
    if (!game.user.isGM && this.actor.limited) return 'systems/vtm5e/templates/actor/limited-sheet.html'
    return 'systems/vtm5e/templates/actor/werewolf-sheet.html'
  }

  /* -------------------------------------------- */

  /** @override */
  async getData () {
    const data = await super.getData()

    data.sheetType = `${game.i18n.localize('VTM5E.Werewolf')}`

    // Prepare items.
    if (this.actor.type === 'werewolf' ||
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
    actorData.system.gamesystem = 'werewolf'
  }

  _onResourceChange (event) {
    event.preventDefault()
    const actorData = duplicate(this.actor)
    const element = event.currentTarget
    const dataset = element.dataset
    const resource = dataset.resource
    if (dataset.action === 'plus' && !this.locked) {
      actorData.system[resource].max++
    } else if (dataset.action === 'minus' && !this.locked) {
      actorData.system[resource].max = Math.max(actorData.system[resource].max - 1, 0)
    }

    if (actorData.system[resource].aggravated + actorData.system[resource].superficial > actorData.system[resource].max) {
      actorData.system[resource].aggravated = actorData.system[resource].max - actorData.system[resource].superficial
      if (actorData.system[resource].aggravated <= 0) {
        actorData.system[resource].aggravated = 0
        actorData.system[resource].superficial = actorData.system[resource].max
      }
    }
    this.actor.update(actorData)
  }
}
