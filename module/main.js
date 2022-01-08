/* global CONFIG, Handlebars, Hooks, Actors, ActorSheet, ChatMessage, Dialog, Items, ItemSheet, Macro, game, ui, renderTemplate */

// Import Modules
import { preloadHandlebarsTemplates } from './templates.js'
import { migrateWorld } from './migration.js'
import { VampireActor } from './actor/actor.js'
import { VampireItem } from './item/item.js'
import { VampireItemSheet } from './item/item-sheet.js'
import { VampireDie, VampireHungerDie } from './dice/dice.js'
import { rollDice } from './actor/roll-dice.js'
import { CoterieActorSheet } from './actor/coterie-actor-sheet.js'
import { MortalActorSheet } from './actor/mortal-actor-sheet.js'
import { GhoulActorSheet } from './actor/ghoul-actor-sheet.js'
import { VampireActorSheet } from './actor/vampire-actor-sheet.js'
import {
  prepareSearchableSelection,
  prepareRouseShortcut,
  prepareWillpowerShortcut,
  prepareFrenzyShortcut,
  prepareHumanityShortcut,
  watchPool1Filters,
  watchPool2Filters,
  prepareCustomRollButton
} from './dice/dicebox.js'

const OWNED_PERMISSION = 3

Hooks.once('init', async function () {
  console.log('Initializing Schrecknet...')

  game.settings.register('vtm5e', 'worldVersion', {
    name: 'World Version',
    hint: 'Automatically upgrades data when the system.json is upgraded.',
    scope: 'world',
    config: true,
    default: '1.5',
    type: String
  })

  game.settings.register('vtm5e', 'useChatRoller', {
    name: 'Chat Roller',
    hint: 'Display dice roller in chat window',
    scope: 'world',
    config: true,
    default: false,
    type: Boolean
  })

  game.settings.register('vtm5e', 'chatRollerSortAbilities', {
    name: 'Sort Abilities in Chat Roller',
    hint: 'Sort abilities (Attributes, Skills, Disciplines) alphabetically in the chat roller. Disable to sort in the order on the character sheet (grouping physical, social, and mental).',
    scope: 'client',
    config: true,
    default: true,
    type: Boolean
  })

  game.settings.register('vtm5e', 'automatedWillpower', {
    name: 'Willpower Damage On Willpower Reroll',
    hint: 'If enabled, using the Willpower Reroll (right click on a chat message) feature will deal willpower damage to the associated actor.',
    scope: 'client',
    config: true,
    default: true,
    type: Boolean
  })

  game.settings.register('vtm5e', 'automatedRouse', {
    name: 'Increase Hunger With Rouse Checks',
    hint: 'If enabled, rolling a rouse check and failing will automatically increase the hunger of the associated actor.',
    scope: 'client',
    config: true,
    default: true,
    type: Boolean
  })

  game.settings.register('vtm5e', 'darkTheme', {
    name: 'Dark Theme',
    hint: 'Display sheets using a darker theme on a per-user basis.',
    scope: 'client',
    config: true,
    default: false,
    type: Boolean
  })

  game.vtm5e = {
    VampireActor,
    VampireItem,
    rollItemMacro
  }

  /**
     * Set an initiative formula for the system
     * @type {String}
     */
  CONFIG.Combat.initiative = {
    formula: '1d20'
  }

  // Define custom Entity classes
  CONFIG.Actor.documentClass = VampireActor
  CONFIG.Item.documentClass = VampireItem
  CONFIG.Dice.terms.v = VampireDie
  CONFIG.Dice.terms.h = VampireHungerDie

  // Register sheet application classes
  Actors.unregisterSheet('core', ActorSheet)

  Actors.registerSheet('vtm5e', VampireActorSheet, {
    label: 'Vampire Sheet',
    types: ['vampire', 'character'],
    makeDefault: true
  })
  Actors.registerSheet('vtm5e', GhoulActorSheet, {
    label: 'Ghoul Sheet',
    types: ['ghoul'],
    makeDefault: true
  })
  Actors.registerSheet('vtm5e', MortalActorSheet, {
    label: 'Mortal Sheet',
    types: ['mortal'],
    makeDefault: true
  })
  Actors.registerSheet('vtm5e', CoterieActorSheet, {
    label: 'Coterie Sheet',
    types: ['coterie'],
    makeDefault: true
  })
  Items.unregisterSheet('core', ItemSheet)
  Items.registerSheet('vtm5e', VampireItemSheet, {
    label: 'Item Sheet',
    makeDefault: true
  })

  preloadHandlebarsTemplates()

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

  const capitalize = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
  }

  Handlebars.registerHelper('generateFeatureLabel', function (str) {
    return 'VTM5E.'.concat(capitalize(str))
  })

  Handlebars.registerHelper('generateSkillLabel', function (str) {
    return 'VTM5E.'.concat(str.split(' ').flatMap(word => capitalize(word)).join(''))
  })

  // TODO: there exist math helpers for handlebars
  Handlebars.registerHelper('frenzy', function (willpowerMax, willpowerAgg, willpowerSup, humanity) {
    // Return the result of the stain, or 1 at minimum.
    const stainDice = Math.max((willpowerMax - willpowerAgg - willpowerSup) + Math.floor(humanity / 3), 1)

    return stainDice
  })

  Handlebars.registerHelper('willpower', function (willpowerMax, willpowerAgg, willpowerSup) {
    // Return the result of the willpower, or 1 at minimum.
    const willpowerDice = Math.max((willpowerMax - willpowerAgg - willpowerSup), 1)

    return willpowerDice
  })

  // TODO: there exist math helpers for handlebars
  Handlebars.registerHelper('remorse', function (humanity, stain) {
    // Return the result of the stain, or 1 at minimum.
    const remorseDice = Math.max((10 - humanity - stain), 1)

    return remorseDice
  })

  Handlebars.registerHelper('attrIf', function (attr, value, test) {
    if (value === undefined) return ''
    return value === test ? attr : ''
  })

  Handlebars.registerHelper('visibleDisciplines', function (disciplines) {
    return Object.keys(disciplines).reduce(
      (obj, key) => {
        if (disciplines[key].visible) {
          obj[key] = disciplines[key]
        }
        return obj
      },
      {}
    )
  })

  Handlebars.registerHelper('sortAbilities', function (unordered = {}) {
    if (!game.settings.get('vtm5e', 'chatRollerSortAbilities')) {
      return unordered
    }
    return Object.keys(unordered).sort().reduce(
      (obj, key) => {
        obj[key] = unordered[key]
        return obj
      },
      {}
    )
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
    colorset: 'black',
    fontScale: 0.5,
    system: 'vtm5e'
  })
  dice3d.addColorset({
    name: 'hunger',
    description: 'V5 Hunger Dice',
    category: 'V5',
    foreground: '#fff',
    background: '#450000',
    texture: 'none',
    edge: '#450000',
    material: 'plastic',
    font: 'Arial Black',
    fontScale: {
      d6: 1.1,
      df: 2.5
    }
  }, 'default')
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
    colorset: 'hunger',
    system: 'vtm5e'
  })
})
/* -------------------------------------------- */
/*  Add chat dicebox                            */
/* -------------------------------------------- */
Hooks.on('renderSidebarTab', (app, html) => {
  if (!game.settings.get('vtm5e', 'useChatRoller')) {
    return
  }

  const $chatForm = html.find('#chat-form')
  const template = 'systems/vtm5e/templates/ui/tray.html'
  const ownedCharacters = Array.from(game.actors)
    .filter((c) => c.permission === OWNED_PERMISSION)
  const options = {
    characters: ownedCharacters,
    selectedCharacter: ownedCharacters[0],
    pool1Type: 'abilities',
    pool1: null,
    pool2Type: 'skills',
    pool2: null,
    updateDiceTray: (options) => {
      renderTemplate(template, options).then((c) => {
        if (c.length > 0) {
          const $content = $(c)
          html.find('.dice-tray').remove()
          $chatForm.after($content)

          prepareSearchableSelection('selectedCharacter', $content, options, (event) => game.actors.get(event.target.value))

          prepareSearchableSelection('pool1', $content, options, (event) => event.target.value)

          watchPool1Filters($content, options)
          options.pool1 = options.pool1 && $content.find(`#pool1 option[value=${options.pool1}]`).length > 0 ? options.pool1 : $content.find('#pool1 option').attr('value')
          prepareSearchableSelection('pool2', $content, options, (event) => event.target.value)
          options.pool2 = options.pool2 && $content.find(`#pool2 option[value=${options.pool2}]`).length > 0 ? options.pool2 : $content.find('#pool2 option').attr('value')
          watchPool2Filters($content, options)

          prepareCustomRollButton($content, options)

          prepareRouseShortcut($content, options)
          prepareWillpowerShortcut($content, options)
          prepareFrenzyShortcut($content, options)
          prepareHumanityShortcut($content, options)
        }
      })
    }
  }
  options.updateDiceTray(options)
})

/* -------------------------------------------- */
/*  Add willpower reroll                        */
/* -------------------------------------------- */

// Create context menu option on selection
Hooks.on('getChatLogEntryContext', function (html, options) {
  options.push({
    name: game.i18n.localize('VTM5E.WillpowerReroll'),
    icon: '<i class="fas fa-redo"></i>',
    condition: li => {
      // Only show this context menu if the person is GM or author of the message
      const message = game.messages.get(li.attr('data-message-id'))

      // Only show this context menu if there are re-rollable dice in the message
      const rerollableDice = li.find('.normal-dice').length

      // All must be true to show the reroll dialogue
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
  const dice = roll.find('.normal-dice')
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
    title: game.i18n.localize('VTM5E.WillpowerReroll'),
    content: template,
    buttons: buttons,
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

  // Get the actor associated with the message
  // Theoretically I should error-check this, but there shouldn't be any
  // messages that call for a WillpowerReroll without an associated actor
  const message = game.messages.get(roll.attr('data-message-id'))
  const speaker = game.actors.get(message.data.speaker.actor)

  // If there is at least 1 die selected and aren't any more than 3 die selected, reroll the total number of die and generate a new message.
  if ((diceSelected > 0) && (diceSelected < 4)) {
    rollDice(diceSelected, speaker, game.i18n.localize('VTM5E.WillpowerReroll'), 0, false, false, true)
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
