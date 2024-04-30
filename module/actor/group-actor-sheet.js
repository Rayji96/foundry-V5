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
    const classList = ['wod5e', 'sheet', 'actor', 'group', 'group-sheet']

    return mergeObject(super.defaultOptions, {
      classes: classList,
      width: 700,
      height: 700,
      tabs: [{
        navSelector: '.sheet-tabs',
        contentSelector: '.sheet-body',
        initial: 'members'
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
    // Includes initialization for the CSS classes
    switch (this.actor.system.groupType) {
      case 'cell':
        this.options.classes.push(...['hunter-sheet'])
        return 'systems/vtm5e/templates/actor/cell-sheet.hbs'
        break

      case 'coterie':
        this.options.classes.push(...['coterie-sheet'])
        return 'systems/vtm5e/templates/actor/coterie-sheet.hbs'
        break

      default:
        console.log('Oops! Something broke...')
        this.options.classes.push(...['coterie-sheet'])
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

    // Prepare items.
    this._prepareItems(data)

    // Show boons on the sheet
    data.hasBoons = this.hasBoons

    // Make a list of group members
    data.groupMembers = []

    // Push each group member's data to the groupMembers list
    actor.system.members.forEach(actorID => {
      const actor = fromUuidSync(actorID)
      data.groupMembers.push(actor)
    })

    // Apply new CSS classes to the sheet, if necessary
    this._applyClasses()

    return data
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners (html) {
    // Activate listeners
    super.activateListeners(html)
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

  // Function to open an actor sheet
  _openActorSheet (event) {

  }

  // Called to re-apply the CSS classes if the sheet type is changed
  _applyClasses () {
    // Grab the default list of sheet classes
    const classList = this.options.classes
    const sheetElement = $(this.document._sheet.element)

    // Add a new sheet class depending on the type of sheet
    switch (this.actor.system.groupType) {
      case 'cell':
        sheetElement.removeClass('coterie-sheet')
        sheetElement.addClass('hunter-sheet')
        break

      case 'coterie':
        sheetElement.removeClass('hunter-sheet')
        sheetElement.addClass('coterie-sheet')
        break

      default:
        console.log('Oops! Something broke...')
        sheetElement.removeClass('hunter-sheet')
        sheetElement.addClass('coterie-sheet')
    }
  }
}
