/* global Dialog, game, foundry, renderTemplate, ChatMessage, WOD5E */

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

    // Make Edge visible
    html.find('.edge-create').click(this._onCreateEdge.bind(this))

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

  /**
     * Handle making a new edge
     * @param {Event} event   The originating click event
     * @private
     */
  _onCreateEdge (event) {
    event.preventDefault()

    // Top-level variables
    const actor = this.actor
    const header = event.currentTarget

    // Variables yet to be defined
    let options = ''
    let buttons = {}

    // If the type of edge is already set, we don't need to ask for it
    if (header.dataset.edge) {
      // Get the image for the item, if one is available from the item definitions
      const itemFromList = WOD5E.ItemTypes.getList().find(obj => 'perk' in obj)
      const img = itemFromList.perk.img ? itemFromList.perk.img : 'systems/vtm5e/assets/icons/items/item-default.svg'

      // Prepare the item object.
      const itemData = {
        name: game.i18n.localize('WOD5E.HTR.NewPerk'),
        type: 'perk',
        img,
        system: {
          edge: header.dataset.edge
        }
      }

      // Remove the type from the dataset since it's in the itemData.type prop.
      delete itemData.system.type

      // Finally, create the item!
      return actor.createEmbeddedDocuments('Item', [itemData])
    } else {
      // Go through the options and add them to the options variable
      for (const [key, value] of Object.entries(actor.system.edges)) {
        options = options.concat(`<option value="${key}">${game.i18n.localize(value.name)}</option>`)
      }

      // Define the template to be used
      const template = `
        <form>
            <div class="form-group">
                <label>${game.i18n.localize('WOD5E.HTR.SelectEdge')}</label>
                <select id="edgeSelect">${options}</select>
            </div>
        </form>`

      // Define the buttons to be used and push them to the buttons variable
      buttons = {
        submit: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize('WOD5E.Add'),
          callback: async (html) => {
            const edge = html.find('#edgeSelect')[0].value

            // Get the image for the item, if one is available from the item definitions
            const itemFromList = WOD5E.ItemTypes.getList().find(obj => 'perk' in obj)
            const img = itemFromList.perk.img ? itemFromList.perk.img : 'systems/vtm5e/assets/icons/items/item-default.svg'

            // Prepare the item object.
            const itemData = {
              name: game.i18n.localize('WOD5E.HTR.NewPerk'),
              type: 'perk',
              img,
              system: {
                edge
              }
            }
            // Remove the type from the dataset since it's in the itemData.type prop.
            delete itemData.system.type

            // Finally, create the item!
            return actor.createEmbeddedDocuments('Item', [itemData])
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize('WOD5E.Cancel')
        }
      }

      // Display the dialog
      new Dialog({
        title: game.i18n.localize('WOD5E.WTA.AddGift'),
        content: template,
        buttons,
        default: 'submit'
      },
      {
        classes: ['wod5e', 'hunter-dialog', 'hunter-sheet']
      }).render(true)
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
    const dicePool = dice1 + dice2 + activeBonuses

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
