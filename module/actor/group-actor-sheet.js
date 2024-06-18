/* global game, foundry, fromUuidSync, ui */

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

    return foundry.utils.mergeObject(super.defaultOptions, {
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
    // Switch-case for the sheet type to determine which template to display
    // Includes initialization for the CSS classes
    switch (this.actor.system.groupType) {
      case 'cell':
        this.options.classes.push(...['hunter-sheet'])
        return 'systems/vtm5e/templates/actor/cell-sheet.hbs'

      case 'coterie':
        this.options.classes.push(...['coterie-sheet'])
        return 'systems/vtm5e/templates/actor/coterie-sheet.hbs'

      case 'pack':
        this.options.classes.push(...['werewolf-sheet'])
        return 'systems/vtm5e/templates/actor/pack-sheet.hbs'

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

    if (!this.actor.isOwner) return

    try {
      data = JSON.parse(event.dataTransfer.getData('text/plain'))
    } catch (err) {
      console.log(err)

      return false
    }

    if (data.type === 'Actor') {
      this._addActor(data.uuid)
    } else if (data.type === 'Item') {
      this.actor.createEmbeddedDocuments('Item', [
        fromUuidSync(data.uuid)
      ])
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
    if (actor.system.members) {
      actor.system.members.forEach(actorID => {
        const actor = fromUuidSync(actorID)
        data.groupMembers.push(actor)
      })
    }

    // Handle figuring out hunting difficulty
    if (actor.system.groupType === 'coterie') {
      data.huntingDifficulty = 7 - actor.system.chasse.value
    }

    // Apply new CSS classes to the sheet, if necessary
    this._applyClasses()

    // Group type options
    data.groupTypes = {
      coterie: 'WOD5E.VTM.Coterie',
      cell: 'WOD5E.HTR.Cell',
      pack: 'WOD5E.WTA.Pack'
    }

    return data
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners (html) {
    // Activate listeners
    super.activateListeners(html)

    html.find('.open-sheet').click(this._openActorSheet.bind(this))

    // Only activate the below listeners for the storyteller
    if (!this.actor.isOwner) return
    html.find('.remove-actor').click(this._removeActor.bind(this))
  }

  // Add a new actor to the active players list
  async _addActor (actorUUID) {
    if (!this.actor.isOwner) return

    // Define the actor data
    const actor = fromUuidSync(actorUUID)
    const group = this.actor

    // Don't let group sheets be added to group sheets
    if (actor.type === 'group') return

    // Check if the actor is unique in the already existing list;
    // Returns false if it's found, or true if it's not found
    const actorIsntUnique = group.system.members.find(players => players === actorUUID)
    if (actorIsntUnique) {
      ui.notifications.warn(`Actor ${actor.name} is already part of this group.`)

      return
    }

    // Check if the actor is already in a group and if the group still exists
    const actorHasGroup = actor.system.group
    const groupExists = game.actors.get(actorHasGroup)

    if (actorHasGroup && groupExists) {
      ui.notifications.warn(`Actor ${actor.name} is already in an existing group.`)

      return
    }

    // If the actor exists, is unique, and does not already belong to an existing group, continue
    // Define the current members list
    const membersList = group.system.members ? group.system.members : []

    // Push actor to the list
    membersList.push(actorUUID)

    // Update the group sheet with the new actor
    await group.update({ 'system.members': membersList })

    // Set the actor's group to the group's ID
    await actor.update({ 'system.group': group.id })

    // Update the group's permissions to include the players as limited by default if the default ownership is "none"
    // Otherwise keep whatever default ownership the storyteller has set
    if (actor.hasPlayerOwner && group.ownership.default === 0) {
      await group.update({ ownership: { default: 1 } })
    }

    // Re-render the actors list
    await game.actors.render()
  }

  async _removeActor (event) {
    event.preventDefault()

    if (!this.actor.isOwner) return

    // Define variables
    const data = $(event.currentTarget)[0].dataset
    const actorUUID = data.uuid
    const actor = fromUuidSync(actorUUID)
    const group = this.actor

    // Filter out the UUID from the members list
    const membersList = group.system.members.filter(actor => actor !== actorUUID)

    // Update the group sheet with the new members list
    await group.update({ 'system.members': membersList })

    // Empty the group field on the actor
    await actor.update({ 'system.group': '' })

    // Re-render the actors list
    await game.actors.render()
  }

  // Function to open an actor sheet
  async _openActorSheet (event) {
    event.preventDefault()

    // Define variables
    const data = $(event.currentTarget)[0].dataset
    const actorUUID = data.uuid

    fromUuidSync(actorUUID).sheet.render(true)
  }

  // Called to re-apply the CSS classes if the sheet type is changed
  async _applyClasses () {
    // Grab the default list of sheet classes
    const sheetElement = $(this.document._sheet.element)

    // Add a new sheet class depending on the type of sheet
    switch (this.actor.system.groupType) {
      case 'cell':
        sheetElement.removeClass('coterie-sheet werewolf-sheet')
        sheetElement.addClass('hunter-sheet')
        break

      case 'coterie':
        sheetElement.removeClass('hunter-sheet werewolf-sheet')
        sheetElement.addClass('coterie-sheet')
        break

      case 'pack':
        sheetElement.removeClass('hunter-sheet coterie-sheet')
        sheetElement.addClass('werewolf-sheet')
        break

      default:
        console.log('Oops! Something broke...')
        sheetElement.removeClass('hunter-sheet werewolf-sheet')
        sheetElement.addClass('coterie-sheet')
    }
  }
}
