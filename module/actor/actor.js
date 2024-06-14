/* global Actor, game, renderTemplate, Dialog, FormDataExtended, foundry, WOD5E, CONST */

/**
 * Extend the base ActorSheet document and put all our base functionality here
 * @extends {Actor}
 */
export class ActorInfo extends Actor {
  prepareData () {
    super.prepareData()
  }

  /**
   * Redefines the create "actor" type with translations :)
   * @param {object} data         Initial data with which to populate the creation form
   * @param {object} [options]    Positioning and sizing options for the resulting dialog
   * @return {Promise<Document>}  A Promise which resolves to the created Document
   * @memberof ClientDocumentMixin
   */
  static async createDialog (data = {}, options = {}) {
    // Define data from the system and the game to be used when rendering the new actor dialog
    // Actor name
    const documentName = this.metadata.name

    // List of actor templates
    const actorTemplateTypes = game.template.Actor.types

    // List of folders; either in the compendium pack the item's being made in, or the world itself
    let gameFolders = []
    if (options.pack) {
      gameFolders = game.packs.get(options.pack).folders.filter(f => (f.type === documentName) && f.displayed)
    } else {
      gameFolders = game.folders.filter(f => (f.type === documentName) && f.displayed)
    }

    // Localize the label and title
    const label = game.i18n.localize(this.metadata.label)
    const title = game.i18n.format('DOCUMENT.Create', { type: label })
    // Generate a default name based on the label
    const defaultName = game.i18n.format('DOCUMENT.New', { type: label })

    // Reorganize the actor templates into something usable for the creation form
    const actorTypes = {}
    const actorTypesList = WOD5E.ActorTypes.getList()
    // Cycle through all the template types, and use a label if one is found;
    // default to just the base type (key) provided
    for (const actorType of actorTemplateTypes) {
      actorTypes[actorType] = actorTypesList[actorType] ? actorTypesList[actorType].label : actorType
    }

    // Render the document creation form
    const html = await renderTemplate('templates/sidebar/document-create.html', {
      name: data.name || defaultName,
      folder: data.folder,
      folders: gameFolders,
      hasFolders: gameFolders.length > 0,
      type: data.type || 'vampire',
      types: actorTypes,
      hasTypes: true
    })

    // Render the confirmation dialog window
    return Dialog.prompt({
      title,
      content: html,
      label: title,
      callback: html => {
        // Grab the element for data manipulation
        const form = html[0].querySelector('form')
        const fd = new FormDataExtended(form)
        // Merge data with Foundry's default object before we manipulate it
        data = foundry.utils.mergeObject(data, fd.object)
        // Force a default name if none is given
        if (!data.name) data.name = game.i18n.format('DOCUMENT.New', { type: actorTypes[data.type] })
        // If folder isn't given, delete the field
        if (!data.folder) delete data.folder
        // Choose the default actor type if there's only one
        if (actorTypes.length === 1) data.type = actorTypes[0]
        // Render the sheet after creating it
        return this.create(data, {
          renderSheet: true,
          pack: options.pack || ''
        })
      },
      rejectClose: false,
      options
    })
  }

  async _preCreate (data, context, user) {
    await super._preCreate(data, context, user)

    const tokenUpdate = {}

    // Link non-SPC token data by default
    if (data.prototypeToken?.actorLink === undefined && data.type !== 'spc') {
      tokenUpdate.actorLink = true
    }

    if (!foundry.utils.isEmpty(tokenUpdate)) {
      this.prototypeToken.updateSource(tokenUpdate)
    }
  }

  /** Handle things that need to be done every update or specifically when the actor is being updated */
  async _onUpdate (data, options, user) {
    await super._onUpdate(data, options, user)
    const actor = game.actors.get(data._id)

    // Only run through this for the storyteller
    if (!game.user.isGM) return

    // If the character is a player, update disposition to friendly
    if (actor.hasPlayerOwner && actor.type !== 'group') {
      // Update things here
      actor.update({
        'prototypeToken.disposition': CONST.TOKEN_DISPOSITIONS.FRIENDLY,
        ownership: { default: 1 }
      })
    }

    return data
  }
}
