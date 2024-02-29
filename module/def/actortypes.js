/* global game, Hooks */

export class ActorTypes {
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
    ActorTypes.initializeLabels()
  }

  static mortal = {
    label: 'WOD5E.Mortal'
  }

  static spc = {
    label: 'WOD5E.SPC.Label'
  }

  static vampire = {
    label: 'WOD5E.VTM.Label'
  }

  static ghoul = {
    label: 'WOD5E.VTM.Ghoul'
  }

  static hunter = {
    label: 'WOD5E.HTR.Label'
  }

  static werewolf = {
    label: 'WOD5E.WTA.Label'
  }

  static coterie = {
    label: 'WOD5E.VTM.Coterie'
  }

  static cell = {
    label: 'WOD5E.HTR.Cell'
  }
}

// Hook to call onReady when the game is ready
Hooks.once('ready', ActorTypes.onReady)
