/* global CONFIG, Hooks, Actors, ActorSheet, ChatMessage, Items, ItemSheet, Macro, game, ui */

// Import Modules
import { preloadHandlebarsTemplates } from './templates.js'
import { migrateWorld } from './scripts/migration.js'
import { ActorInfo } from './actor/actor.js'
import { ItemInfo } from './item/item.js'
import { WoDItemSheet } from './item/item-sheet.js'
import { MortalDie, VampireDie, VampireHungerDie, HunterDie, HunterDesperationDie, WerewolfDie, WerewolfRageDie } from './dice/splat-dice.js'
import { CoterieActorSheet } from './actor/coterie-actor-sheet.js'
import { MortalActorSheet } from './actor/mortal-actor-sheet.js'
import { GhoulActorSheet } from './actor/ghoul-actor-sheet.js'
import { VampireActorSheet } from './actor/vampire-actor-sheet.js'
import { HunterActorSheet } from './actor/hunter-actor-sheet.js'
import { CellActorSheet } from './actor/cell-actor-sheet.js'
import { SPCActorSheet } from './actor/spc-actor-sheet.js'
import { WerewolfActorSheet } from './actor/werewolf-actor-sheet.js'
import { loadDiceSoNice } from './dice/dice-so-nice.js'
import { loadHelpers } from './helpers.js'
import { loadSettings } from './settings.js'
import { willpowerReroll } from './scripts/willpower-reroll.js'
import { wod5eAPI } from './api/wod5e-api.js'

// Anything that needs to be ran alongside the initialisation of the world
Hooks.once('init', async function () {
  console.log('Initializing Schrecknet...')

  loadSettings()

  game.wod5e = {
    ActorInfo,
    ItemInfo,
    rollItemMacro
  }

  // Define custom Entity classes
  CONFIG.Actor.documentClass = ActorInfo
  CONFIG.Item.documentClass = ItemInfo
  CONFIG.Dice.terms.m = MortalDie
  CONFIG.Dice.terms.v = VampireDie
  CONFIG.Dice.terms.g = VampireHungerDie
  CONFIG.Dice.terms.h = HunterDie
  CONFIG.Dice.terms.s = HunterDesperationDie
  CONFIG.Dice.terms.w = WerewolfDie
  CONFIG.Dice.terms.r = WerewolfRageDie

  // Register sheet application classes
  Actors.unregisterSheet('core', ActorSheet)
  Actors.registerSheet('vtm5e', MortalActorSheet, {
    label: 'Mortal Sheet',
    types: ['mortal'],
    makeDefault: true
  })
  Actors.registerSheet('vtm5e', HunterActorSheet, {
    label: 'Hunter Sheet',
    types: ['hunter'],
    makeDefault: true
  })
  Actors.registerSheet('vtm5e', VampireActorSheet, {
    label: 'Vampire Sheet',
    types: ['vampire'],
    makeDefault: true
  })
  Actors.registerSheet('vtm5e', WerewolfActorSheet, {
    label: 'Werewolf Sheet',
    types: ['werewolf'],
    makeDefault: true
  })
  Actors.registerSheet('vtm5e', GhoulActorSheet, {
    label: 'Ghoul Sheet',
    types: ['ghoul'],
    makeDefault: true
  })
  Actors.registerSheet('vtm5e', CellActorSheet, {
    label: 'Cell Sheet',
    types: ['cell'],
    makeDefault: true
  })
  Actors.registerSheet('vtm5e', CoterieActorSheet, {
    label: 'Coterie Sheet',
    types: ['coterie'],
    makeDefault: true
  })
  Actors.registerSheet('vtm5e', SPCActorSheet, {
    label: 'SPC Sheet',
    types: ['spc'],
    makeDefault: true
  })
  Items.unregisterSheet('core', ItemSheet)
  Items.registerSheet('vtm5e', WoDItemSheet, {
    label: 'Item Sheet',
    makeDefault: true
  })

  // Make Handlebars templates accessible to the system
  preloadHandlebarsTemplates()

  // Make helpers accessible to the system
  loadHelpers()
})

// Anything that needs to run once the world is ready
Hooks.once('ready', async function () {
    // Activate the API
    window.WOD5E = {
      api: {
        Roll: wod5eAPI.Roll
      }
    }

  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on('hotbarDrop', (bar, data, slot) => createVampireMacro(data, slot))

  // Migration functions
  migrateWorld()
})

// DiceSoNice functionality
Hooks.once('diceSoNiceReady', (dice3d) => {
  loadDiceSoNice(dice3d)
})

// Display the willpower reroll option in the chat when messages are right clicked
Hooks.on('getChatLogEntryContext', (html, options) => {
  options.push({
    name: game.i18n.localize('WOD5E.Chat.WillpowerReroll'),
    icon: '<i class="fas fa-redo"></i>',
    condition: li => {
      // Only show this context menu if the person is GM or author of the message
      const message = game.messages.get(li.attr('data-message-id'))

      // Only show this context menu if there are re-rollable dice in the message
      const rerollableDice = li.find('.rerollable').length

      // All must be true to show the reroll dialog
      return (game.user.isGM || message.isAuthor) && (rerollableDice > 0)
    },
    callback: li => willpowerReroll(li)
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
  const item = data.system

  // Create the macro command
  const command = `game.wod5e.rollItemMacro("${item.name}");`
  let macro = game.macros.entities.find(m => (m.name === item.name) && (m.command === command))
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: 'script',
      img: item.img,
      command,
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
