/* global Item, game, renderTemplate, Dialog, FormDataExtended, foundry, WOD5E */

/**
 * Extend the base ItemSheet document and put all our base functionality here
 * @extends {Item}
 */
export class ItemInfo extends Item {
  prepareData () {
    super.prepareData()
  }

  /**
  * Redefines the create "item" type with translations
  * @param {object} data         Initial data with which to populate the creation form
  * @param {object} [options]    Positioning and sizing options for the resulting dialog
  * @return {Promise<Document>}  A Promise which resolves to the created Document
  * @memberof ClientDocumentMixin
  */
  static async createDialog (data = {}, options = {}) {
    // Define data from the system and the game to be used when rendering the new item dialog
    // Item name
    const documentName = this.metadata.name

    // List of item templates
    const itemTemplateTypes = game.template.Item.types

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
    const defaultName = game.i18n.format('WOD5E.New', { type: label })

    // Reorganize the item templates into something usable for the creation form
    const itemTypes = {}
    const itemTypesList = WOD5E.ItemTypes.getList()
    // Cycle through all the template types, and use a label if one is found;
    // default to just the base type (key) provided
    for (const itemType of itemTemplateTypes) {
      itemTypes[itemType] = itemTypesList[itemType] ? itemTypesList[itemType].label : itemType
    }

    // Render the document creation form
    const html = await renderTemplate('templates/sidebar/document-create.html', {
      name: data.name || defaultName,
      folder: data.folder,
      folders: gameFolders,
      hasFolders: gameFolders.length > 0,
      type: data.type || 'feature',
      types: itemTypes,
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
        if (!data.name) data.name = game.i18n.format('WOD5E.New', { type: itemTypes[data.type] })
        // Generate a default image depending on the item type
        const itemsList = WOD5E.ItemTypes.getList()
        data.img = itemsList[data.type].img ? itemsList[data.type].img : 'systems/vtm5e/assets/icons/items/item-default.svg'
        // If folder isn't given, delete the field
        if (!data.folder) delete data.folder
        // Choose the default item type if there's only one
        if (itemTypes.length === 1) data.type = itemTypes[0]
        // Render the item after creating it
        return this.create(data, {
          renderSheet: true,
          pack: options.pack || ''
        })
      },
      rejectClose: false,
      options
    })
  }
}
