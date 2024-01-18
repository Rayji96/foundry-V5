/* global Dialog, game, mergeObject, renderTemplate, ChatMessage */

// Export this function to be used in other scripts
import { WOD5eDice } from '../scripts/system-rolls.js'
import { getActiveBonuses } from '../scripts/rolls/situational-modifiers.js'
import { CellActorSheet } from './cell-actor-sheet.js'

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {CellActorSheet}
 */

export class HunterActorSheet extends CellActorSheet {
  /** @override */
  static get defaultOptions () {
    // Define the base list of CSS classes
    const classList = ['wod5e', 'hunter-sheet', 'sheet', 'actor', 'hunter']

    // If the user has darkmode enabled, then push it to the class list
    if (game.settings.get('vtm5e', 'darkTheme')) {
      classList.push('dark-theme')
    }

    return mergeObject(super.defaultOptions, {
      classes: classList,
      template: 'systems/vtm5e/templates/actor/hunter-sheet.html',
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
    if (!game.user.isGM && this.actor.limited) return 'systems/vtm5e/templates/actor/limited-sheet.html'
    return 'systems/vtm5e/templates/actor/hunter-sheet.html'
  }

  /* -------------------------------------------- */

  /** @override */
  async getData () {
    // Top-level variables
    const data = await super.getData()
    const actor = this.actor

    // Define the type of sheet
    data.sheetType = `${game.i18n.localize('WOD5E.Hunter')}`

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
  _prepareItems (sheetData) {
    // Prepare items
    super._prepareItems(sheetData)

    // Top-level variables
    const actorData = sheetData.actor
    const actor = this.actor

    // Variables yet to be defined
    const edges = {
      arsenal: [],
      fleet: [],
      ordnance: [],
      library: [],
      improvisedgear: [],
      globalaccess: [],
      dronejockey: [],
      beastwhisperer: [],
      sensetheunnatural: [],
      repeltheunnatural: [],
      thwarttheunnatural: [],
      artifact: []
    }

    // Track whether despair is toggled on or not
    if (actor.system.despair.value > 0) {
      actorData.system.despairActive = true
    }

    // Iterate through items, allocating to containers
    for (const i of sheetData.items) {
      // Make sure the item is a perk and has an edge set
      if (i.type === 'perk' && i.system.edge) {
        // Append to edges
        edges[i.system.edge].push(i)

        // If the edge isn't already visible, make it visible
        if (!actor.system.edges[i.system.edge].visible) {
          actor.update({ [`system.edges.${i.system.edge}.visible`]: true })
        }
      }
    }

    // Sort the edge containers by the level of the power instead of by creation date
    for (const edgeType in edges) {
      edges[edgeType] = edges[edgeType].sort(function (power1, power2) {
        // If the levels are the same, sort alphabetically instead
        if (power1.system.level === power2.system.level) {
          return power1.name.localeCompare(power2.name)
        }

        // Sort by level
        return power1.system.level - power2.system.level
      })
    }

    // Assign and return the edges list
    actorData.edges_list = edges
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

    // Make Edge visible
    html.find('.edge-create').click(this._onShowEdge.bind(this))

    // Make Edge hidden
    html.find('.edge-delete').click(ev => {
      const data = $(ev.currentTarget)[0].dataset
      actor.update({ [`system.edges.${data.edge}.visible`]: false })
    })

    // Rollable Edge powers
    html.find('.edge-rollable').click(this._onEdgeRoll.bind(this))

    // Post Edge description to the chat
    html.find('.edge-chat').click(event => {
      const data = $(event.currentTarget)[0].dataset
      const edge = actor.system.edges[data.edge]

      renderTemplate('systems/vtm5e/templates/chat/chat-message.html', {
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

  /**
     * Handle making a edge visible
     * @param {Event} event   The originating click event
     * @private
     */
  _onShowEdge (event) {
    event.preventDefault()

    // Top-level variables
    const actor = this.actor

    // Variables yet to be defined
    let options = ''
    for (const [key, value] of Object.entries(actor.system.edges)) {
      options = options.concat(`<option value="${key}">${game.i18n.localize(value.name)}</option>`)
    }

    const template = `
      <form>
          <div class="form-group">
              <label>${game.i18n.localize('WOD5E.SelectEdge')}</label>
              <select id="edgeSelect">${options}</select>
          </div>
      </form>`

    let buttons = {}
    buttons = {
      submit: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize('WOD5E.Add'),
        callback: async (html) => {
          const edge = html.find('#edgeSelect')[0].value
          actor.update({ [`system.edges.${edge}.visible`]: true })
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize('WOD5E.Cancel')
      }
    }

    new Dialog({
      title: game.i18n.localize('WOD5E.AddEdge'),
      content: template,
      buttons,
      default: 'submit'
    },
    {
      classes: ['wod5e', `hunter-dialog`, `hunter-sheet`]
    }).render(true)
  }

  async _onEdgeRoll (event) {
    event.preventDefault()

    // Top-level variables
    const actor = this.actor
    const element = event.currentTarget
    const dataset = element.dataset
    const item = actor.items.get(dataset.id)

    // Secondary variables
    const edgeValue = 1

    // Variables yet to be defined
    let dice1, dice2

    // Determine the value of dice1
    dice1 = item.system.dice1 === 'edge' ? edgeValue : actor.system.abilities[item.system.dice1].value

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
    const dicePool = dice1 + dice2 + activeBonuses

    // Send the roll to the system
    WOD5eDice.Roll({
      basicDice: dicePool,
      actor,
      data: item.system,
      title: item.name,
      selectors
    })
  }
}
