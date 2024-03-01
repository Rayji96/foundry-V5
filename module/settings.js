/* global game */

import { resetActors } from './scripts/reset-actors.js'

/**
 * Define all game settings here
 * @return {Promise}
 */
export const loadSettings = async function () {
  game.settings.register('vtm5e', 'worldVersion', {
    name: 'World Version',
    hint: 'Automatically upgrades data when the system.json is upgraded.',
    scope: 'world',
    config: true,
    default: '1.5',
    type: String
  })

  game.settings.register('vtm5e', 'darkTheme', {
    name: 'Dark Theme',
    hint: 'Display sheets using a darker theme on a per-user basis.',
    scope: 'client',
    config: true,
    default: false,
    type: Boolean,
    onChange: (value) => {
      document.body.classList.toggle('dark-theme', value)
    }
  })

  game.settings.register('vtm5e', 'actorBanner', {
    name: 'Enable Character Type Banner',
    hint: 'Display a banner at the top of actor sheets to represent the character type.',
    scope: 'client',
    config: true,
    default: true,
    type: Boolean,
    onChange: () => {
      // Update all current actors
      resetActors()
    }
  })

  /* Chat roller is disabled until it can be fixed
  game.settings.register('vtm5e', 'useChatRoller', {
    name: 'Chat Roller',
    hint: 'Display dice roller in chat window.',
    scope: 'world',
    config: true,
    default: false,
    type: Boolean
  })

  game.settings.register('vtm5e', 'chatRollerSortAbilities', {
    name: 'Sort Abilities in Chat Roller',
    hint: 'Sort abilities (Attributes, Skills, Disciplines, Edges) alphabetically in the chat roller. Disable to sort in the order on the character sheet (grouping physical, social, and mental).',
    scope: 'client',
    config: true,
    default: true,
    type: Boolean
  })
  */

  game.settings.register('vtm5e', 'automatedWillpower', {
    name: 'Automate Willpower Damage',
    hint: 'If enabled, using features that deal willpower damage to the associated actor.',
    scope: 'world',
    config: true,
    default: true,
    type: Boolean
  })

  game.settings.register('vtm5e', 'automatedHunger', {
    name: 'Automate Hunger Increase',
    hint: 'If enabled, rolling Hunger Dice and failing will automatically increase the hunger of the associated actor.',
    scope: 'world',
    config: true,
    default: true,
    type: Boolean
  })

  game.settings.register('vtm5e', 'automatedOblivion', {
    name: 'Automate Oblivion Stains',
    hint: 'If enabled, rolling 1 or 10 on rouse checks on Oblivion discipline powers will grant a stain on the associated actor.',
    scope: 'world',
    config: true,
    default: true,
    type: Boolean
  })

  game.settings.register('vtm5e', 'automatedRage', {
    name: 'Automate Rage Dice',
    hint: 'If enabled, rolling Rage Dice and failing will automatically decrease Rage from the associated actor.',
    scope: 'world',
    config: true,
    default: true,
    type: Boolean
  })
}
