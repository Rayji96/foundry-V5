/* global game, Hooks */

export class ItemTypes {
  // Function to help with quickly grabbing all the listed values;
  // Will only retrieve objects (definitions)
  static getList () {
    return Object.entries(this)
      .filter(([, value]) => typeof value === 'object' && value !== null && !Array.isArray(value))
      .map(([key, value]) => ({ [key]: value }))
  }

  // Localize the labels
  static initializeLabels () {
    for (const [, value] of Object.entries(this)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        value.label = game.i18n.localize(value.label)
      }
    }
  }

  // Run any necessary compilation on ready
  static onReady () {
    ItemTypes.initializeLabels()
  }

  static feature = {
    label: 'WOD5E.Items.Feature'
  }

  static power = {
    label: 'WOD5E.VTM.Discipline'
  }

  static boon = {
    label: 'WOD5E.Items.Boon'
  }

  static customRoll = {
    label: 'WOD5E.Items.CustomRoll'
  }

  static perk = {
    label: 'WOD5E.HTR.Edge'
  }

  static gift = {
    label: 'WOD5E.WTA.Gift'
  }
}

// Hook to call onReady when the game is ready
Hooks.once('ready', ItemTypes.onReady)
