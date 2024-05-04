/* global CONFIG, Hooks, Actors, ActorSheet, ActorDirectory, fromUuidSync, ChatMessage, Items, ItemSheet, Macro, game, ui, CONST */

// Actor sheets
import { ActorInfo } from './actor/actor.js'
import { WOD5EActorDirectory } from './actor/actor-directory.js'
// Item sheets
import { ItemInfo } from './item/item.js'
import { WoDItemSheet } from './item/item-sheet.js'
// FVTT and module functionality
import { preloadHandlebarsTemplates } from './templates.js'
import { loadDiceSoNice } from './dice/dice-so-nice.js'
import { loadHelpers } from './helpers.js'
import { loadSettings } from './settings.js'
// WOD5E functions and classes
import { MortalDie, VampireDie, VampireHungerDie, HunterDie, HunterDesperationDie, WerewolfDie, WerewolfRageDie } from './dice/splat-dice.js'
import { migrateWorld } from './scripts/migration.js'
import { willpowerReroll } from './scripts/willpower-reroll.js'
import { wod5eAPI } from './api/wod5e-api.js'
// WOD5E Definitions
import { Systems } from './def/systems.js'
import { Attributes } from './def/attributes.js'
import { Skills } from './def/skills.js'
import { Features } from './def/features.js'
import { ActorTypes } from './def/actortypes.js'
import { ItemTypes } from './def/itemtypes.js'
import { Disciplines } from './def/disciplines.js'
import { Edges } from './def/edges.js'
import { Renown } from './def/renown.js'
import { WereForms } from './def/were-forms.js'
import { Gifts } from './def/gifts.js'

// Anything that needs to be ran alongside the initialisation of the world
Hooks.once('init', async function () {
  console.log('Initializing Schrecknet...')

  // Some basic info for the gamesystem
  game.wod5e = {
    ActorInfo,
    ItemInfo,
    rollItemMacro
  }

  // Define custom Entity classes
  CONFIG.Actor.documentClass = ActorInfo
  CONFIG.Item.documentClass = ItemInfo
  CONFIG.ui.actors = WOD5EActorDirectory
  CONFIG.Dice.terms.m = MortalDie
  CONFIG.Dice.terms.v = VampireDie
  CONFIG.Dice.terms.g = VampireHungerDie
  CONFIG.Dice.terms.h = HunterDie
  CONFIG.Dice.terms.s = HunterDesperationDie
  CONFIG.Dice.terms.w = WerewolfDie
  CONFIG.Dice.terms.r = WerewolfRageDie

  // Register actor sheet application classes
  Actors.unregisterSheet('core', ActorSheet)
  // Loop through each entry in the actorTypesList and register their sheet classes
  const actorTypesList = ActorTypes.getList()
  for (const entry of actorTypesList) {
    const [, value] = Object.entries(entry)[0]
    const { types, sheetClass } = value

    Actors.registerSheet('vtm5e', sheetClass, {
      types,
      makeDefault: true
    })
  }

  // Register the WoDItemSheet class, used for all items
  Items.unregisterSheet('core', ItemSheet)
  Items.registerSheet('vtm5e', WoDItemSheet, {
    makeDefault: true
  })

  // Make Handlebars templates accessible to the system
  preloadHandlebarsTemplates()

  // Make helpers accessible to the system
  loadHelpers()

  // Load settings into Foundry
  loadSettings()
})

// Anything that needs to run once the world is ready
Hooks.once('ready', async function () {
  // After settings are loaded, check if we need to apply dark theme
  document.body.classList.toggle('dark-theme', game.settings.get('vtm5e', 'darkTheme'))

  // Apply the currently selected language as a CSS class so we can
  // modify elements based on locale if needed
  document.body.classList.add(game.settings.get('core', 'language'))

  // Activate the API
  window.WOD5E = {
    api: {
      Roll: wod5eAPI.Roll,
      RollFromDataset: wod5eAPI.RollFromDataset,
      getBasicDice: wod5eAPI.getBasicDice,
      getAdvancedDice: wod5eAPI.getAdvancedDice,
      getFlavorDescription: wod5eAPI.getFlavorDescription,
      generateLabelAndLocalize: wod5eAPI.generateLabelAndLocalize,
      migrateWorld
    },
    Systems,
    Attributes,
    Skills,
    Features,
    ActorTypes,
    ItemTypes,
    Disciplines,
    Edges,
    Renown,
    Gifts,
    WereForms
  }

  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on('hotbarDrop', (bar, data, slot) => createVampireMacro(data, slot))

  // Migration functions
  migrateWorld()
})

Hooks.once('setup', () => {
  // Forced panning is intrinsically annoying: change default to false
  game.settings.settings.get('core.chatBubblesPan').default = false

  // Improve discoverability of map notes
  game.settings.settings.get('core.notesDisplayToggle').default = true

  // Set Hover by Owner as defaults for Default Token Configuration
  const defaultTokenSettingsDefaults = game.settings.settings.get('core.defaultToken').default
  defaultTokenSettingsDefaults.displayName = CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
  defaultTokenSettingsDefaults.displayBars = CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER

  // Default token dispositions to neutral
  defaultTokenSettingsDefaults.disposition = CONST.TOKEN_DISPOSITIONS.NEUTRAL
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

      // Only show this context menu if there's not any already rerolled dice in the message
      const rerolledDice = li.find('.rerolled').length

      // All must be true to show the reroll dialog
      return (game.user.isGM || message.isAuthor) && (rerollableDice > 0) && (rerolledDice === 0)
    },
    callback: li => willpowerReroll(li)
  })
})

Hooks.on('renderSidebarTab', async (object, html) => {
  if (object instanceof ActorDirectory) {
    // Define the list of groups we're going to be modifying
    const groups = object.groups

    // Define the directory list so that we can modify its structure
    const directoryList = html.find('.directory-list')

    // Iterate through each group and make a "folder-like" element out of them
    groups.forEach(group => {
      const groupElement = $(`[data-entry-id='${group.id}'`)
      const groupMembers = group.system?.members

      // Header element for the "folder"
      const headerElement = `<header class='group-header ${group.system.groupType} flexrow'>
        <h3 class='noborder'>
          <i class='fas fa-folder-open fa-fw'></i>
          ${group.name}
        </h3>
        <a class='create-button open-sheet' data-uuid='Actor.${group.id}' title='` + game.i18n.localize('WOD5E.OpenSheet') + `'>
          <i class="fas fa-user"></i>
        </a>
      </header>`
      const subdirectoryElement = '<ol class="subdirectory"></ol>'

      // Append the above elements to the group element and turn it into a folder
      groupElement.attr('data-uuid', `Actor.${group.id}`)
      groupElement.attr('class', 'directory-item group-item flexcol document')
      // GMs follow the collapsed value, players don't
      if (group.system?.collapsed && game.user.isGM) {
        groupElement.addClass('collapsed')
      }
      groupElement.find('.entry-name, .thumbnail').remove()
      groupElement.append(headerElement)
      groupElement.append(subdirectoryElement)

      // Add an event listener for toggling the group collapse
      groupElement.find('.group-header').click(event => {
        event.preventDefault()

        const collapsed = !group.system.collapsed

        groupElement.toggleClass('collapsed')

        // Players don't have to update the system.collapsed value
        if (game.user.isGM) {
          group.update({ 'system.collapsed': collapsed })
        }
      })

      // Add an event listener for opening the group sheet
      groupElement.find('.open-sheet').click(event => {
        event.preventDefault()
        event.stopPropagation()

        game.actors.get(group.id).sheet.render(true)
      })

      // Move each group member's element to be a child of this group
      // Additionally, we need to give the actor Limited
      if (groupMembers) {
        groupMembers.forEach(actor => {
          const actorId = fromUuidSync(actor).id
          const actorElement = $(`[data-entry-id='${actorId}'`)
          const groupListElement = $(`[data-entry-id='${group.id}'`).find('.subdirectory')[0]
  
          actorElement.appendTo(groupListElement)
        })
      }

      // If Ownership Viewer is enabled, adjust the group sheet's ownership viewer because otherwise it gets wonky by default
      const ownershipViewer = groupElement.children('.ownership-viewer')
      groupElement.find('header.group-header').append(ownershipViewer)

      // Add to the directory list
      groupElement.prependTo(directoryList)
    })
  }
})

// Handle actor updates
Hooks.on('updateActor', (actor) => {
  if (actor.type === 'group') {
    // Re-render the actors directory
    game.actors.render()
  }

  // Only do this if the actor has an associated group with them
  if (actor.system?.group) {
    // Update the group sheet
    game.actors.get(actor.system.group).sheet.render()
  }
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
  console.log(data)
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
