/* global game, Hooks */

export class ItemTypes {
  // Function to help with quickly grabbing all the listed values;
  // Will only retrieve objects (definitions)
  static getList () {
    return Object.entries(this)
      .filter(([, value]) => typeof value === 'object' && value !== null && !Array.isArray(value))
      .reduce((accumulator, [key, value]) => {
        accumulator[key] = value
        return accumulator
      }, {})
  }

  // Localize the labels
  static initializeLabels () {
    for (const [, value] of Object.entries(this)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        value.label = game.i18n.localize(value.label)
      }

      // Handle which label to display
      if (value.rename) {
        value.displayName = value.rename
      } else {
        value.displayName = value.label
      }
    }
  }

  // Run any necessary compilation on ready
  static onReady () {
    ItemTypes.initializeLabels()
  }

  static feature = {
    label: 'WOD5E.ItemsList.Feature',
    img: 'systems/vtm5e/assets/icons/items/feature.svg'
  }

  static power = {
    label: 'WOD5E.VTM.Discipline',
    img: 'systems/vtm5e/assets/icons/items/discipline.png'
  }

  static boon = {
    label: 'WOD5E.ItemsList.Boon',
    img: 'systems/vtm5e/assets/icons/items/boon.svg'
  }

  static customRoll = {
    label: 'WOD5E.ItemsList.CustomRoll',
    img: 'systems/vtm5e/assets/icons/items/custom-roll.png'
  }

  static perk = {
    label: 'WOD5E.HTR.Edge',
    img: 'systems/vtm5e/assets/icons/items/edge.png'
  }

  static gift = {
    label: 'WOD5E.WTA.Gift',
    img: 'systems/vtm5e/assets/icons/items/gift.png'
  }
}

// Hook to call onReady when the game is ready
Hooks.once('ready', ItemTypes.onReady)
