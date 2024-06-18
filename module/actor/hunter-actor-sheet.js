/* global game, foundry, renderTemplate, ChatMessage */

import { WOD5eDice } from '../scripts/system-rolls.js'
import { getActiveBonuses } from '../scripts/rolls/situational-modifiers.js'
import { WoDActor } from './wod-v5-sheet.js'

/**
 * Extend the WOD5E ActorSheet with some very simple modifications
 * @extends {WoDActor}
 */

export class HunterActorSheet extends WoDActor {
  /** @override */
  static get defaultOptions () {
    // Define the base list of CSS classes
    const classList = ['wod5e', 'hunter-sheet', 'sheet', 'actor', 'hunter']

    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: classList,
      template: 'systems/vtm5e/templates/actor/hunter-sheet.hbs',
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
    this.hasBoons = false
    this.despairActive = false
  }

  /** @override */
  get template () {
    if (!game.user.isGM && this.actor.limited) return 'systems/vtm5e/templates/actor/limited-sheet.hbs'
    return 'systems/vtm5e/templates/actor/hunter-sheet.hbs'
  }

  /* -------------------------------------------- */

  /** @override */
  async getData () {
    // Top-level variables
    const data = await super.getData()
    const actor = this.actor

    // Prepare items
    if (actor.type === 'hunter') {
      this._prepareItems(data)
    }

    return data
  }

  /**
     * Organize and classify Items for all sheets
     *
     * @param {Object} actorData The actor to prepare
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
    const edgesList = structuredClone(actorData.system.edges)

    // Track whether despair is toggled on or not
    if (actor.system.despair.value > 0) {
      actorData.system.despairActive = true
    }

    // Iterate through items, allocating to containers
    for (const i of sheetData.items) {
      // Make sure the item is a perk and has an edge set
      if (i.type === 'perk') {
        // Append to each of the perk types.
        if (i.system.edge !== undefined && edgesList[i.system.edge]?.powers) {
          edgesList[i.system.edge].powers.push(i)
        }
      }
    }

    // Sort the edge containers by the level of the power instead of by creation date
    for (const edgeType in edgesList) {
      edgesList[edgeType].powers = edgesList[edgeType].powers.sort(function (power1, power2) {
        // If the levels are the same, sort alphabetically instead
        if (power1.system.level === power2.system.level) {
          return power1.name.localeCompare(power2.name)
        }

        // Sort by level
        return power1.system.level - power2.system.level
      })
    }

    // Assign and return the edges list
    actorData.system.edgesList = edgesList
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

    // Toggle despair
    html.find('.despair-toggle').click(this._onToggleDespair.bind(this))

    // Rollable Edge powers
    html.find('.edge-rollable').click(this._onEdgeRoll.bind(this))

    // Post Edge description to the chat
    html.find('.edge-chat').click(async event => {
      const data = $(event.currentTarget)[0].dataset
      const edge = actor.system.edges[data.edge]

      renderTemplate('systems/vtm5e/templates/chat/chat-message.hbs', {
        name: game.i18n.localize(edge.name),
        img: 'icons/svg/dice-target.svg',
        description: edge.description
      }).then(html => {
        ChatMessage.create({
          content: html
        })
      })
    })
  }

  /** Handle toggling the depsair value */
  _onToggleDespair (event) {
    event.preventDefault()

    // Top-level variables
    const actor = this.actor

    // I really only do this so it's clear what we're doing here
    const currentDespair = actor.system.despairActive
    const newDespair = !currentDespair

    // Have to do this silly thing in order to prevent old versions of the Hunter sheet from freaking out
    // Basically we're tracking the boolean of true/false in the sheet code but making sure that
    // old versions of the sheet continue to track it in binary 1 or 0.
    // It's dumb, I know, and I hope to set up a migration function to fix it sometime
    // but I don't want to delay this release more than I already had to-
    if (newDespair) { // Set as "true"
      actor.update({ 'system.despair.value': 1 })
    } else { // Set as "false"
      actor.update({ 'system.despair.value': 0 })
    }
  }

  async _onEdgeRoll (event) {
    event.preventDefault()

    // Top-level variables
    const actor = this.actor
    const element = event.currentTarget
    const dataset = Object.assign({}, element.dataset)
    const item = actor.items.get(dataset.id)

    // Secondary variables
    const edgeValue = 1
    const macro = item.system.macroid

    // Variables yet to be defined
    let dice2
    const selectors = []

    // Determine the value of dice1
    const dice1 = item.system.dice1 === 'edge' ? edgeValue : actor.system.abilities[item.system.dice1].value

    // Determine the value of dice2
    if (item.system.dice2 === 'edge') {
      dice2 = edgeValue
    } else if (item.system.skill) {
      dice2 = actor.system.skills[item.system.dice2].value
    } else if (item.system.amalgam) {
      dice2 = actor.system.edges[item.system.dice2].value
    } else {
      dice2 = actor.system.abilities[item.system.dice2].value
    }

    // Handle getting any situational modifiers
    const activeBonuses = await getActiveBonuses({
      actor,
      selectors
    })

    // Add it all together
    const dicePool = dice1 + dice2 + activeBonuses.totalValue

    // Send the roll to the system
    WOD5eDice.Roll({
      basicDice: dicePool,
      actor,
      data: item.system,
      title: item.name,
      selectors,
      macro
    })
  }
}
