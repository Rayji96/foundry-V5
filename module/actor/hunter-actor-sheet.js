/* global Dialog, game, mergeObject, renderTemplate, ChatMessage */

// Export this function to be used in other scripts
import { CellActorSheet } from './cell-actor-sheet.js'
import { rollHunterDice } from './roll-hunter-dice.js'

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {CellActorSheet}
 */

export class HunterActorSheet extends CellActorSheet {
  /** @override */
  static get defaultOptions () {
    // Define the base list of CSS classes
    const classList = ['wod5e', 'hunter-sheet', 'sheet', 'actor', 'hunter']

    // If the user's enabled darkmode, then push it to the class list
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
    const data = await super.getData()
    // TODO: confirm that I can finish and use this list
    data.sheetType = `${game.i18n.localize('WOD5E.Hunter')}`

    // Prepare items.
    if (this.actor.type === 'hunter') {
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
    const actorData = sheetData.actor

    actorData.system.gamesystem = 'hunter'

    // Track whether despair is toggled on or not
    if (this.actor.system.despair.value > 0) {
      actorData.system.despairActive = true
    }

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

    // Iterate through items, allocating to containers
    for (const i of sheetData.items) {
      if (i.type === 'perk') {
        // Append to edges.
        if (i.system.edge !== undefined) {
          edges[i.system.edge].push(i)
          if (!this.actor.system.edges[i.system.edge].visible) {
            this.actor.update({ [`system.edges.${i.system.edge}.visible`]: true })
          }
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

    // Assign and return
    actorData.edges_list = edges
  }
  /* -------------------------------------------- */

  /** @override */
  activateListeners (html) {
    super.activateListeners(html)

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return

    // Toggle despair
    html.find('.despair-toggle').click(this._onToggleDespair.bind(this))

    // Make Edge visible
    html.find('.edge-create').click(this._onShowEdge.bind(this))

    // Make Edge hidden
    html.find('.edge-delete').click(ev => {
      const data = $(ev.currentTarget)[0].dataset
      this.actor.update({ [`system.edges.${data.edge}.visible`]: false })
    })

    // Post Edge description to the chat
    html.find('.edge-chat').click(ev => {
      const data = $(ev.currentTarget)[0].dataset
      const edge = this.actor.system.edges[data.edge]

      renderTemplate('systems/vtm5e/templates/actor/parts/chat-message.html', {
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

    // I really only do this so it's clear what we're doing here
    const currentDespair = this.actor.system.despairActive
    const newDespair = !currentDespair

    // Have to do this silly thing in order to prevent old versions of the Hunter sheet from freaking out
    // Basically we're tracking the boolean of true/false in the sheet code but making sure that
    // old versions of the sheet continue to track it in binary 1 or 0.
    // It's dumb, I know, and I hope to set up a migration function to fix it sometime
    // but I don't want to delay this release more than I already had to-
    if (newDespair) { // Set as "true"
      this.actor.update({ 'system.despair.value': 1 })
    } else { // Set as "false"
      this.actor.update({ 'system.despair.value': 0 })
    }
  }

  /**
     * Handle making a edge visible
     * @param {Event} event   The originating click event
     * @private
     */
  _onShowEdge (event) {
    event.preventDefault()
    let options = ''
    for (const [key, value] of Object.entries(this.actor.system.edges)) {
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
      draw: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize('WOD5E.Add'),
        callback: async (html) => {
          const edge = html.find('#edgeSelect')[0].value
          this.actor.update({ [`system.edges.${edge}.visible`]: true })
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
      default: 'draw'
    }).render(true)
  }

  _onPerkRoll (event) {
    event.preventDefault()
    const element = event.currentTarget
    const dataset = element.dataset
    const item = this.actor.items.get(dataset.id)
    const edgeValue = 1

    const dice1 = item.system.dice1 === 'edge' ? edgeValue : this.actor.system.abilities[item.system.dice1].value

    let dice2
    if (item.system.dice2 === 'edge') {
      dice2 = edgeValue
    } else if (item.system.skill) {
      dice2 = this.actor.system.skills[item.system.dice2].value
    } else if (item.system.amalgam) {
      dice2 = this.actor.system.edges[item.system.dice2].value
    } else {
      dice2 = this.actor.system.abilities[item.system.dice2].value
    }

    const dicePool = dice1 + dice2
    rollHunterDice(dicePool, this.actor, `${item.name}`, 0)
  }
}
