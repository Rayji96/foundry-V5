/* global CONFIG, Handlebars, Hooks, Actors, ActorSheet, ChatMessage, Dialog, Items, ItemSheet, Macro, game, ui */

// Import Modules
import { preloadHandlebarsTemplates } from './templates.js'
import { VampireActor } from './actor/actor.js'
import { VampireActorSheet, rollDice } from './actor/actor-sheet.js'
import { VampireItem } from './item/item.js'
import { VampireItemSheet } from './item/item-sheet.js'
import { VampireDie, VampireHungerDie } from './dice/dice.js'

Hooks.once('init', async function () {
  console.log('Initializing Schrecknet...')

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
/*  Add willpower reroll                        */
/* -------------------------------------------- */

// Create context menu option on selection
// TODO: Add condition that it only shows up on willpower-able rolls
Hooks.on("getChatLogEntryContext", function (html, options) {
  options.push({
    name: 'Willpower Reroll',
    icon: '<i class="fas fa-redo"></i>',
    condition: li => {
      // Only show this context menu if the person is GM or author of the message
      const message = game.messages.get(li.attr('data-message-id'))
      
      return game.user.isGM || message.isAuthor
    },
    callback: li => willpowerReroll(li)
  })
})

async function willpowerReroll (roll) {
  const dice = roll.find('.vampiredie')
  let diceRolls = []
  
  // Go through the message's dice and add them to the diceRolls array
  Object.keys(dice).forEach(function(i){
    // This for some reason returns "prevObject" and "length"
    // Fixes will be attempted, but for now solved by just ensuring the index is a number
    if(i > -1){
      diceRolls.push(`<div class="die">${dice[i].outerHTML}</div>`)
    }
  })
  
  // Create dialog for rerolling dice
  const template = `
    <form>
        <div class="window-content">
            <label><b>Select dice to reroll (Max 3)</b></label>
            <hr>
            <span class="dice-tooltip">
              <ol class="dice-rolls willpowerReroll">
                ${diceRolls.join("")}
              </ol>
            </span>
        </div>
    </form>`

  let buttons = {}
  buttons = {
    draw: {
      icon: '<i class="fas fa-check"></i>',
      label: "Reroll",
      callback: roll => rerollDie(roll)
    },
    cancel: {
      icon: '<i class="fas fa-times"></i>',
      label: "Cancel"
    }
  }

  new Dialog({
    title: 'Willpower Reroll',
    content: template,
    buttons: buttons,
    render: html => $('.willpowerReroll .die').on('click', dieSelect),
    default: 'draw'
  }).render(true)
}

// Handles selecting and de-selecting the die
function dieSelect () {
  // If the die isn't already selected and there aren't 3 already selected, add selected to the die
  if(!($(this).hasClass('selected')) && ($('.willpowerReroll .selected').length < 3)){
    $(this).addClass('selected')
  } else {
    $(this).removeClass('selected')
  }
}

// Handles rerolling the number of dice selected
// TODO: Make this function duplicate/replace the previous roll with the new results
// TODO: Make this function able to tick superficial willpower damage
// For now this works well enough as "roll three new dice"
function rerollDie (actor) {
  const diceSelected = $('.willpowerReroll .selected').length

  // If there is at least 1 die selected and aren't any more than 3 die selected, reroll the total number of die and generate a new message.
  if ((diceSelected > 0) && (diceSelected < 4)) {    
    rollDice(diceSelected, actor, 'Willpower Reroll', 0, false)
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
