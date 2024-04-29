/* global game, mergeObject */

import { WoDActor } from './wod-v5-sheet.js'

/**
 * Extend the base WoDActor with anything necessary for the new actor sheet
 * @extends {WoDActor}
 */

export class GroupActorSheet extends WoDActor {
  /** @override */
  static get defaultOptions () {
    // Define the base list of CSS classes
    const classList = ['wod5e', 'sheet', 'actor']

    return mergeObject(super.defaultOptions, {
      classes: classList,
      template: 'systems/vtm5e/templates/actor/group-sheet.hbs',
      width: 650,
      height: 600,
      tabs: [{
        navSelector: '.sheet-tabs',
        contentSelector: '.sheet-body',
        initial: 'features'
      }],
      dragDrop: [{
        dragSelector: '.entity.actor',
        dropSelector: null
      }]
    })
  }

  constructor (actor, options) {
    super(actor, options)

    this.isCharacter = false
  }

  /** @override */
  get template () {
    if (!game.user.isGM && this.actor.limited) return 'systems/vtm5e/templates/actor/limited-sheet.hbs'

    // Switch-case for the sheet type to determine which template to display
    switch (this.actor.system.groupType) {
      case 'cell':
        return 'systems/vtm5e/templates/actor/cell-sheet.hbs'
        break

      case 'coterie':
        return 'systems/vtm5e/templates/actor/coterie-sheet.hbs'
        break

      default:
        console.log('Oops! Something broke...')
        return 'systems/vtm5e/templates/actor/coterie-sheet.hbs'
    }
  }

  /* -------------------------------------------- */

  // Response to an actor being dropped onto the sheet
  async _onDrop (event) {
    let data = {}

    try {
      data = JSON.parse(event.dataTransfer.getData('text/plain'))
    } catch (err) {
      console.log(err)

      return false
    }

    if (data.type == 'Actor') {
      this._addActor(data.uuid)
    }
  }

  /** @override */
  async getData () {
    // Top-level variables
    const data = await super.getData()
    const actor = this.actor
    const actorElement = this.element

    // Prepare items.
    if (actor.type === 'group') {
      this._prepareItems(data)
    }

    // Show boons on the sheet
    data.hasBoons = this.hasBoons

    // Define data types
    data.dtypes = ['String', 'Number', 'Boolean']

    return data
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners (html) {
    // Activate listeners
    super.activateListeners(html)

    if (this.actor.system.groupType === 'cell') {
      $(html[0].offsetParent).addClass('hunter-sheet')
    }
  }

  // Add a new actor to the active players list
  _addActor (actorID) {
    // Define the actor data
    const actor = fromUuidSync(actorID)

    // Check if the actor is unique in the already existing list;
    // Returns true if it's found, or false if it's not found
    const actorUniqueCheck = this.actor.system.members.find(players => players == actorID)

    // If the actor exists and is unique
    if (!actorUniqueCheck) {
      // Push to the players list
      this._updateActors('add', actorID)
    }
  }

  _removeActor (player) {
    const actorID = player.currentTarget.id
    const newList = this.actor.system.members.filter(actor => actor !== actorID)

    this._updateActors('replace', newList)
  }

  // Function to update the actors setting
  _updateActors (operation, newData) {
    // Switch case to determine what to do with the data
    switch (operation) {
      // Append new actors to the list
      case 'add':
        const membersList = this.actor.system.members
        // Push actor to the list
        membersList.push(newData)
        this.actor.update({ 'system.members': membersList })

        break

      // Wholly replace the previous list with the new data
      case 'replace':
        // Fill in the list with the new data
        this.actor.update({ 'system.members': newData })

        break

      default:
        console.log('Error! Something broke...')
    }
  }
}
