/* global CONFIG, Handlebars, Hooks, Actors, ActorSheet, ChatMessage, Items, ItemSheet, Macro, game, ui */

// Import Modules
import { VampireActor } from './actor/actor.js'
import { VampireActorSheet } from './actor/actor-sheet.js'
import { VampireItem } from './item/item.js'
import { VampireItemSheet } from './item/item-sheet.js'
import { VampireDie, VampireHungerDie } from './dice/dice.js'
import {migrateWorld} from './migration.js'

Hooks.once('init', async function () {
  console.log('Initializing Schrecknet...')

  game.vtm5e = {
    VampireActor,
    VampireItem,
    rollItemMacro,
    migrateWorld

  }

  /**
     * Set an initiative formula for the system
     * @type {String}
     */
  CONFIG.Combat.initiative = {
    formula: '1d20'
  }

  // Define custom Entity classes
  CONFIG.Actor.entityClass = VampireActor
  CONFIG.Item.entityClass = VampireItem
  CONFIG.Dice.terms.v = VampireDie
  CONFIG.Dice.terms.h = VampireHungerDie

  // Register sheet application classes
  Actors.unregisterSheet('core', ActorSheet)
  Actors.registerSheet('vtm5e', VampireActorSheet, { makeDefault: true })
  Items.unregisterSheet('core', ItemSheet)
  Items.registerSheet('vtm5e', VampireItemSheet, { makeDefault: true })

  // If you need to add Handlebars helpers, here are a few useful examples:
  Handlebars.registerHelper('concat', function () {
    let outStr = ''
    for (const arg in arguments) {
      if (typeof arguments[arg] !== 'object') {
        outStr += arguments[arg]
      }
    }
    return outStr
  })

  Handlebars.registerHelper('or', function (bool1, bool2) {
    return bool1 || bool2
  })

  Handlebars.registerHelper('and', function (bool1, bool2) {
    return bool1 && bool2
  })

  Handlebars.registerHelper('toLowerCase', function (str) {
    return str.toLowerCase()
  })

  Handlebars.registerHelper('toUpperCaseFirstLetter', function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  })

  // TODO: There's gotta be a better way lol
  Handlebars.registerHelper('generateFeatureLabel', function (str) {
    return (str === 'merit' ? 'VTM5E.Merit' : 'VTM5E.Flaw')
  })

  // TODO: there exist math helpers for handlebars
  Handlebars.registerHelper('frenzy', function (willpowerMax, willpowerAgg, willpowerSup, humanity) {
    return ((willpowerMax - willpowerAgg - willpowerSup) + Math.floor(humanity / 3))
  })

  // TODO: there exist math helpers for handlebars
  Handlebars.registerHelper('remorse', function (humanity, stain) {
    return (10 - humanity - stain)
  })

  Handlebars.registerHelper('numLoop', function (num, options) {
    let ret = ''

    for (let i = 0, j = num; i < j; i++) {
      ret = ret + options.fn(i)
    }

    return ret
  })

  Handlebars.registerHelper('getDisciplineName', function (key, roll = false) {
    const disciplines = {
      animalism: 'VTM5E.Animalism',
      auspex: 'VTM5E.Auspex',
      celerity: 'VTM5E.Celerity',
      dominate: 'VTM5E.Dominate',
      fortitude: 'VTM5E.Fortitude',
      obfuscate: 'VTM5E.Obfuscate',
      potence: 'VTM5E.Potence',
      presence: 'VTM5E.Presence',
      protean: 'VTM5E.Protean',
      sorcery: 'VTM5E.BloodSorcery',
      oblivion: 'VTM5E.Oblivion',
      alchemy: 'VTM5E.ThinBloodAlchemy',
      rituals: 'VTM5E.Rituals',
      ceremonies: 'VTM5E.Ceremonies'
    }
    if (roll) {
      if (key === 'rituals') {
        return disciplines.sorcery
      } else if (key === 'ceremonies') {
        return disciplines.oblivion
      }
    }
    return disciplines[key]
  })
})

Hooks.once('ready', async function () {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on('hotbarDrop', (bar, data, slot) => createVampireMacro(data, slot))
  if ( !game.user.isGM ) return;
  // const currentVersion = game.settings.get("dnd5e", "systemMigrationVersion");
  // const NEEDS_MIGRATION_VERSION = "1.2.1";
  // const COMPATIBLE_MIGRATION_VERSION = 0.80;
  // const needsMigration = currentVersion && isNewerVersion(NEEDS_MIGRATION_VERSION, currentVersion);
  // if ( !needsMigration ) return;

  // Perform the migration
  // if ( currentVersion && isNewerVersion(COMPATIBLE_MIGRATION_VERSION, currentVersion) ) {
  //   const warning = `Your DnD5e system data is from too old a Foundry version and cannot be reliably migrated to the latest version. The process will be attempted, but errors may occur.`;
  //   ui.notifications.error(warning, {permanent: true});
  // }
  migrateWorld();


})

Hooks.once('diceSoNiceReady', (dice3d) => {
  dice3d.addSystem({ id: 'vtm5e', name: 'VtM5e' }, true)
  dice3d.addDicePreset({
    type: 'dv',
    labels: [
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/normal-success-dsn.png',
      'systems/vtm5e/assets/images/normal-success-dsn.png',
      'systems/vtm5e/assets/images/normal-success-dsn.png',
      'systems/vtm5e/assets/images/normal-success-dsn.png',
      'systems/vtm5e/assets/images/normal-crit-dsn.png'
    ],
    colorset: 'white',
    fontScale: 0.5,
    system: 'vtm5e'
  })
  dice3d.addDicePreset({
    type: 'dh',
    labels: [
      'systems/vtm5e/assets/images/bestial-fail-dsn.png',
      'systems/vtm5e/assets/images/red-fail-dsn.png',
      'systems/vtm5e/assets/images/red-fail-dsn.png',
      'systems/vtm5e/assets/images/red-fail-dsn.png',
      'systems/vtm5e/assets/images/red-fail-dsn.png',
      'systems/vtm5e/assets/images/red-success-dsn.png',
      'systems/vtm5e/assets/images/red-success-dsn.png',
      'systems/vtm5e/assets/images/red-success-dsn.png',
      'systems/vtm5e/assets/images/red-success-dsn.png',
      'systems/vtm5e/assets/images/red-crit-dsn.png'
    ],
    colorset: 'black',
    system: 'vtm5e'
  })
})

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createVampireMacro (data, slot) {
  if (data.type !== 'Item') return
  if (!('data' in data)) return ui.notifications.warn('You can only create macro buttons for owned Items')
  const item = data.data

  // Create the macro command
  const command = `game.vtm5e.rollItemMacro("${item.name}");`
  let macro = game.macros.entities.find(m => (m.name === item.name) && (m.command === command))
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: 'script',
      img: item.img,
      command: command,
      flags: { 'vtm5e.itemMacro': true }
    })
  }
  game.user.assignHotbarMacro(macro, slot)
  return false
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemName
 * @return {Promise}
 */
function rollItemMacro (itemName) {
  const speaker = ChatMessage.getSpeaker()
  let actor
  if (speaker.token) actor = game.actors.tokens[speaker.token]
  if (!actor) actor = game.actors.get(speaker.actor)
  const item = actor ? actor.items.find(i => i.name === itemName) : null
  if (!item) return ui.notifications.warn(`Your controlled Actor does not have an item named ${itemName}`)

  // Trigger the item roll
  return item.roll()
}
