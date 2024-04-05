/* global Actor, game, renderTemplate, Dialog, FormDataExtended, foundry, WOD5E */

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

    // Reorganize the actor templates into something usable for the creation form
    const actorTypes = {}
    for (const i in actorTemplateTypes) {
      const actorType = actorTemplateTypes[i]

      // If the actor template has a label, add it to the types list
      // Otherwise, default to the actor's key
      const actorFromList = WOD5E.ActorTypes.getList().find(obj => actorType in obj)
      actorTypes[actorType] = actorFromList ? actorFromList[actorType].label : actorType
    }

    // Render the document creation form
    const html = await renderTemplate('templates/sidebar/document-create.html', {
      name: data.name || game.i18n.format('DOCUMENT.New', { type: label }),
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
        const form = html[0].querySelector('form')
        const fd = new FormDataExtended(form)
        data = foundry.utils.mergeObject(data, fd.object)
        if (!data.folder) delete data.folder
        if (actorTypes.length === 1) data.type = actorTypes[0]
        return this.create(data, {
          renderSheet: true,
          pack: options.pack || ''
        })
      },
      rejectClose: false,
      options
    })
  }

  async _preCreate(data, context, user) {
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

  async _onUpdate(data, options, user) {
    await super._onUpdate(data, options, user)

    const actor = game.actors.get(data._id)
    let isPlayerCharacter = false

    if(data?.ownership) {
      const players = game.users.players

      // Iterate through the players and check if any are the owner of this character
      players.forEach(player => {
        const playerId = player.id

        if (data.ownership[playerId] === 3) {
          isPlayerCharacter = true
        }
      })
    }

    // If the character is a player, update disposition to friendly
    if (isPlayerCharacter) {
      // Update things here
      actor.update({
        'prototypeToken.disposition': CONST.TOKEN_DISPOSITIONS.FRIENDLY
      })
    }

    return data
  }
}
