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

    // Reorganize the item templates into something usable for the creation form
    const itemTypes = {}
    for (const i in itemTemplateTypes) {
      const itemType = itemTemplateTypes[i]

      // If the item template has a label, add it to the types list
      // Otherwise, default to the item's key
      const itemFromList = WOD5E.ItemTypes.getList().find(obj => itemType in obj)
      itemTypes[itemType] = itemFromList ? itemFromList[itemType].label : itemType
    }

    // Render the document creation form
    const html = await renderTemplate('templates/sidebar/document-create.html', {
      name: data.name || game.i18n.format('DOCUMENT.New', { type: label }),
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
        const form = html[0].querySelector('form')
        const fd = new FormDataExtended(form)
        data = foundry.utils.mergeObject(data, fd.object)
        const itemFromList = WOD5E.ItemTypes.getList().find(obj => data.type in obj)
        data.img = itemFromList[data.type].img ? itemFromList[data.type].img : '/systems/vtm5e/assets/icons/items/item-default.svg'
        if (!data.folder) delete data.folder
        if (itemTypes.length === 1) data.type = itemTypes[0]

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
