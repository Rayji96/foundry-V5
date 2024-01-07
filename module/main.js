/* global CONFIG, Hooks, Actors, ActorSheet, ChatMessage, Dialog, Items, ItemSheet, Macro, game, ui, renderTemplate, getProperty */

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
import { WOD5eDice } from './scripts/system-rolls.js'

const OWNED_PERMISSION = 3

Hooks.once('init', async function () {
  console.log('Initializing Schrecknet...')

  loadSettings()

  game.wod5e = {
    ActorInfo,
    ItemInfo,
    rollItemMacro
  }

  /**
     * Set an initiative formula for the system
     * @type {String}
     */
  CONFIG.Combat.initiative = {
    formula: '1d10'
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

  preloadHandlebarsTemplates()

  loadHelpers()
})

Hooks.once('ready', async function () {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on('hotbarDrop', (bar, data, slot) => createVampireMacro(data, slot))
})

Hooks.once('diceSoNiceReady', (dice3d) => {
  loadDiceSoNice(dice3d)
})

/* -------------------------------------------- */
/*  Add willpower reroll                        */
/* -------------------------------------------- */

// Create context menu option on selection
Hooks.on('getChatLogEntryContext', function (html, options) {
  options.push({
    name: game.i18n.localize('WOD5E.WillpowerReroll'),
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

Hooks.once('ready', function () {
  migrateWorld()
})

async function willpowerReroll (roll) {
  // Variables
  const dice = roll.find('.rerollable')
  const diceRolls = []

  // Go through the message's dice and add them to the diceRolls array
  Object.keys(dice).forEach(function (i) {
    // This for some reason returns "prevObject" and "length"
    // Fixes will be attempted, but for now solved by just ensuring the index is a number
    if (i > -1) {
      diceRolls.push(`<div class="die">${dice[i].outerHTML}</div>`)
    }
  })

  // Create dialog for rerolling dice
  // HTML of the dialog
  const template = `
    <form>
        <div class="window-content">
            <label><b>Select dice to reroll (Max 3)</b></label>
            <hr>
            <span class="dice-tooltip">
              <div class="dice-rolls flexrow willpower-reroll">
                ${diceRolls.reverse().join('')}
              </div>
            </span>
        </div>
    </form>`

  // Button defining
  let buttons = {}
  buttons = {
    submit: {
      icon: '<i class="fas fa-check"></i>',
      label: 'Reroll',
      callback: () => rerollDie(roll)
    },
    cancel: {
      icon: '<i class="fas fa-times"></i>',
      label: 'Cancel'
    }
  }

  // Dialog object
  new Dialog({
    title: game.i18n.localize('WOD5E.WillpowerReroll'),
    content: template,
    buttons,
    render: function () {
      $('.willpower-reroll .die').on('click', dieSelect)
    },
    default: 'submit'
  }).render(true)
}

// Handles selecting and de-selecting the die
function dieSelect () {
  // If the die isn't already selected and there aren't 3 already selected, add selected to the die
  if (!($(this).hasClass('selected')) && ($('.willpower-reroll .selected').length < 3)) {
    $(this).addClass('selected')
  } else {
    $(this).removeClass('selected')
  }
}

// Handles rerolling the number of dice selected
// TODO: Make this function duplicate/replace the previous roll with the new results
// For now this works well enough as "roll three new dice"
function rerollDie (roll) {
  // Variables
  const diceSelected = $('.willpower-reroll .selected').length
  const rageDiceSelected = $('.willpower-reroll .selected .rage-dice').length

  // Get the actor associated with the message
  // Theoretically I should error-check this, but there shouldn't be any
  // messages that call for a WillpowerReroll without an associated actor
  const message = game.messages.get(roll.attr('data-message-id'))
  const speaker = game.actors.get(message.speaker.actor)
  const charactertype = getProperty(speaker, 'type', { strict: true })

  // If there is at least 1 die selected and aren't any more than 3 die selected, reroll the total number of die and generate a new message.
  if ((diceSelected > 0) && (diceSelected < 4)) {
    WOD5eDice.Roll({
      basicDice: diceSelected,
      advancedDice: rageDiceSelected,
      label: game.i18n.localize('WOD5E.WillpowerReroll'),
      speaker,
      damageWillpower: true,
      quickRoll: true
    })
  }
}

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
