/* global game, Hooks */

export class Features {
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
    Features.initializeLabels()
  }

  static background = {
    label: 'WOD5E.Items.Background'
  }

  static merit = {
    label: 'WOD5E.Items.Merit'
  }

  static flaw = {
    label: 'WOD5E.Items.Flaw'
  }

  static boon = {
    label: 'WOD5E.Items.Boon'
  }
}

// Hook to call onReady when the game is ready
Hooks.once('ready', Features.onReady)
