/* global game, Hooks */

// Mortal
import { MortalActorSheet } from '../actor/mortal-actor-sheet.js'
// Vampire system
import { VampireActorSheet } from '../actor/vampire-actor-sheet.js'
import { GhoulActorSheet } from '../actor/ghoul-actor-sheet.js'
// Hunter system
import { HunterActorSheet } from '../actor/hunter-actor-sheet.js'
// Werewolf system
import { WerewolfActorSheet } from '../actor/werewolf-actor-sheet.js'
// All systems
import { SPCActorSheet } from '../actor/spc-actor-sheet.js'
import { GroupActorSheet } from '../actor/group-actor-sheet.js'

export class ActorTypes {
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
    ActorTypes.initializeLabels()
  }

  static mortal = {
    label: 'WOD5E.Mortal',
    types: ['mortal'],
    sheetClass: MortalActorSheet
  }

  static spc = {
    label: 'WOD5E.SPC.Label',
    types: ['spc'],
    sheetClass: SPCActorSheet
  }

  static vampire = {
    label: 'WOD5E.VTM.Label',
    types: ['vampire'],
    sheetClass: VampireActorSheet
  }

  static ghoul = {
    label: 'WOD5E.VTM.Ghoul',
    types: ['ghoul'],
    sheetClass: GhoulActorSheet
  }

  static hunter = {
    label: 'WOD5E.HTR.Label',
    types: ['hunter'],
    sheetClass: HunterActorSheet
  }

  static werewolf = {
    label: 'WOD5E.WTA.Label',
    types: ['werewolf'],
    sheetClass: WerewolfActorSheet
  }

  static group = {
    label: 'WOD5E.GroupSheet',
    types: ['group'],
    sheetClass: GroupActorSheet
  }
}

// Hook to call onReady when the game is ready
Hooks.once('ready', ActorTypes.onReady)
