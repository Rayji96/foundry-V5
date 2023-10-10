/* global Actor, game, renderTemplate, Dialog, FormDataExtended, foundry */

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
    // Define data from the system and the game to be used when rendering the new actor dialogue
    // Actor name
    const documentName = this.metadata.name

    // List of actor templates
    const actorTemplates = game.template.Actor
    // List of folders in the game, if there is at least 1
    const gameFolders = game.folders.filter(f => (f.type === documentName) && f.displayed)

    // Localize the label and title
    const label = game.i18n.localize(this.metadata.label)
    const title = game.i18n.format('DOCUMENT.Create', { type: label })

    // Reorganize the actor templates into something usable for the creation form
    const actorTypes = {}
    for (let i in actorTemplates) {
      // If the actor template has a label, add it to the types list
      if (actorTemplates[i].label) {
        actorTypes[i] = game.i18n.localize(actorTemplates[i].label)
      }
    }

    // Render the document creation form
    const html = await renderTemplate('templates/sidebar/document-create.html', {
      name: data.name || game.i18n.format('DOCUMENT.New', { type: label }),
      folder: data.folder,
      folders: gameFolders,
      hasFolders: gameFolders.length > 0,
      type: data.type || 'base',
      types: actorTypes,
      hasTypes: true
    })

    // Render the confirmation dialog window
    return Dialog.prompt({
      title: title,
      content: html,
      label: title,
      callback: html => {
        const form = html[0].querySelector('form')
        const fd = new FormDataExtended(form)
        data = foundry.utils.mergeObject(data, fd.object)
        if (!data.folder) delete data.folder
        if (actorTypes.length === 1) data.type = actorTypes[0]
        return this.create(data, { renderSheet: true })
      },
      rejectClose: false,
      options: options
    })
  }
}
