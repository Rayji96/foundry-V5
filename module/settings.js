/* global game */

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
    type: Boolean
  })

  game.settings.register('vtm5e', 'actorBanner', {
    name: 'Enable Character Type Banner',
    hint: 'Display a banner at the top of actor sheets to represent the character type.',
    scope: 'client',
    config: true,
    default: true,
    type: Boolean
  })

  game.settings.register('vtm5e', 'useChatRoller', {
    // TODO: fix Chat Roller
    name: 'Chat Roller',
    hint: 'Display dice roller in chat window. WARNING: Currently not working properly with Hunter changes.',
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

  game.settings.register('vtm5e', 'automatedWillpower', {
    name: 'Willpower Damage On Willpower Reroll',
    hint: 'If enabled, using the Willpower Reroll (right click on a chat message) feature will deal willpower damage to the associated actor.',
    scope: 'world',
    config: true,
    default: true,
    type: Boolean
  })

  game.settings.register('vtm5e', 'automatedRouse', {
    name: 'Increase Hunger With Rouse Checks',
    hint: 'If enabled, rolling a rouse check and failing will automatically increase the hunger of the associated actor.',
    scope: 'world',
    config: true,
    default: true,
    type: Boolean
  })

  game.settings.register('vtm5e', 'automatedRage', {
    name: 'Automate Rage Dice',
    hint: 'If enabled, rolling Rage Dice or performing actions that require Rage Dice will automatically subtract Rage from the associated actor.',
    scope: 'world',
    config: true,
    default: true,
    type: Boolean
  })
}