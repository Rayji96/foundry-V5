/* global game, Hooks */

export class Disciplines {
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
    Disciplines.initializeLabels()
  }

  static animalism = {
    label: 'WOD5E.VTM.Animalism'
  }

  static auspex = {
    label: 'WOD5E.VTM.Auspex'
  }

  static celerity = {
    label: 'WOD5E.VTM.Celerity'
  }

  static dominate = {
    label: 'WOD5E.VTM.Dominate'
  }

  static fortitude = {
    label: 'WOD5E.VTM.Fortitude'
  }

  static obfuscate = {
    label: 'WOD5E.VTM.Obfuscate'
  }

  static potence = {
    label: 'WOD5E.VTM.Potence'
  }

  static presence = {
    label: 'WOD5E.VTM.Presence'
  }

  static protean = {
    label: 'WOD5E.VTM.Protean'
  }

  static sorcery = {
    label: 'WOD5E.VTM.BloodSorcery'
  }

  static oblivion = {
    label: 'WOD5E.VTM.Oblivion'
  }

  static alchemy = {
    label: 'WOD5E.VTM.ThinBloodAlchemy'
  }

  static rituals = {
    label: 'WOD5E.VTM.Rituals'
  }

  static ceremonies = {
    label: 'WOD5E.VTM.Ceremonies'
  }
}

// Hook to call onReady when the game is ready
Hooks.once('ready', Disciplines.onReady)
