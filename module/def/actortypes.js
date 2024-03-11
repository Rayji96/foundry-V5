/* global game, Hooks */

import { CoterieActorSheet } from '../actor/coterie-actor-sheet.js'
import { MortalActorSheet } from '../actor/mortal-actor-sheet.js'
import { GhoulActorSheet } from '../actor/ghoul-actor-sheet.js'
import { VampireActorSheet } from '../actor/vampire-actor-sheet.js'
import { HunterActorSheet } from '../actor/hunter-actor-sheet.js'
import { CellActorSheet } from '../actor/cell-actor-sheet.js'
import { SPCActorSheet } from '../actor/spc-actor-sheet.js'
import { WerewolfActorSheet } from '../actor/werewolf-actor-sheet.js'

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

  static coterie = {
    label: 'WOD5E.VTM.Coterie',
    types: ['coterie'],
    sheetClass: CoterieActorSheet
  }

  static cell = {
    label: 'WOD5E.HTR.Cell',
    types: ['cell'],
    sheetClass: CellActorSheet
  }
}

// Hook to call onReady when the game is ready
Hooks.once('ready', ActorTypes.onReady)
