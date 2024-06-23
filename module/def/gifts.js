/* global game, Hooks */

export class Gifts {
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
    Gifts.initializeLabels()
  }

  static native = {
    label: 'WOD5E.WTA.Native'
  }

  static ragabash = {
    label: 'WOD5E.WTA.Ragabash'
  }

  static theurge = {
    label: 'WOD5E.WTA.Theurge'
  }

  static philodox = {
    label: 'WOD5E.WTA.Philodox'
  }

  static galliard = {
    label: 'WOD5E.WTA.Galliard'
  }

  static ahroun = {
    label: 'WOD5E.WTA.Ahroun'
  }

  static blackfury = {
    label: 'WOD5E.WTA.BlackFury'
  }

  static bonegnawer = {
    label: 'WOD5E.WTA.BoneGnawer'
  }

  static childrenofgaia = {
    label: 'WOD5E.WTA.ChildrenOfGaia'
  }

  static galestalker = {
    label: 'WOD5E.WTA.Galestalker'
  }

  static ghostcouncil = {
    label: 'WOD5E.WTA.GhostCouncil'
  }

  static glasswalker = {
    label: 'WOD5E.WTA.GlassWalker'
  }

  static hartwarden = {
    label: 'WOD5E.WTA.HartWarden'
  }

  static redtalon = {
    label: 'WOD5E.WTA.RedTalon'
  }

  static shadowlord = {
    label: 'WOD5E.WTA.ShadowLord'
  }

  static silentstrider = {
    label: 'WOD5E.WTA.SilentStrider'
  }

  static silverfang = {
    label: 'WOD5E.WTA.SilverFang'
  }

  static rite = {
    label: 'WOD5E.WTA.Rite'
  }
}

// Hook to call onReady when the game is ready
Hooks.once('ready', Gifts.onReady)
