/* global game, ui, WOD5E */

import { AutomationMenu } from './menus/automation-menu.js'
import { StorytellerMenu } from './menus/storyteller-menu.js'
import { resetActors } from './scripts/reset-actors.js'

/**
 * Define all game settings here
 * @return {Promise}
 */
export const loadSettings = async function () {
  game.settings.register('vtm5e', 'worldVersion', {
    name: game.i18n.localize('WOD5E.Settings.WorldVersion'),
    hint: game.i18n.localize('WOD5E.Settings.WorldVersionHint'),
    scope: 'world',
    config: true,
    default: '1.5',
    type: String
  })

  game.settings.register('vtm5e', 'darkTheme', {
    name: game.i18n.localize('WOD5E.Settings.DarkTheme'),
    hint: game.i18n.localize('WOD5E.Settings.DarkThemeHint'),
    scope: 'client',
    config: true,
    default: false,
    type: Boolean,
    onChange: (value) => {
      document.body.classList.toggle('dark-theme', value)
    }
  })

  game.settings.register('vtm5e', 'actorBanner', {
    name: game.i18n.localize('WOD5E.Settings.ActorBanner'),
    hint: game.i18n.localize('WOD5E.Settings.ActorBannerHint'),
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

  /*
    Automation Settings
  */

  game.settings.registerMenu('vtm5e', 'automationMenu', {
    name: game.i18n.localize('WOD5E.Settings.AutomationSettings'),
    hint: game.i18n.localize('WOD5E.Settings.AutomationSettingsHint'),
    label: game.i18n.localize('WOD5E.Settings.AutomationSettings'),
    icon: 'fas fa-wrench',
    type: AutomationMenu,
    restricted: true
  })

  game.settings.register('vtm5e', 'disableAutomation', {
    name: game.i18n.localize('WOD5E.Settings.DisableAutomation'),
    hint: game.i18n.localize('WOD5E.Settings.DisableAutomationHint'),
    scope: 'world',
    config: false,
    default: false,
    type: Boolean,
    onChange: async (value) => {
      if (value) {
        await game.settings.set('vtm5e', 'automatedWillpower', false)
        await game.settings.set('vtm5e', 'automatedHunger', false)
        await game.settings.set('vtm5e', 'automatedOblivion', false)
        await game.settings.set('vtm5e', 'automatedRage', false)
      } else {
        await game.settings.set('vtm5e', 'automatedWillpower', true)
        await game.settings.set('vtm5e', 'automatedHunger', true)
        await game.settings.set('vtm5e', 'automatedOblivion', true)
        await game.settings.set('vtm5e', 'automatedRage', true)
      }

      // Re-render the automation window once settings are updated
      const AutomationWindow = Object.values(ui.windows).filter(w => (w.id === 'wod5e-automation'))[0]
      if (AutomationWindow) {
        AutomationWindow.render()
      }
    }
  })

  game.settings.register('vtm5e', 'automatedWillpower', {
    name: game.i18n.localize('WOD5E.Settings.AutomateWillpower'),
    hint: game.i18n.localize('WOD5E.Settings.AutomateWillpowerHint'),
    scope: 'world',
    config: false,
    default: true,
    type: Boolean
  })

  game.settings.register('vtm5e', 'automatedHunger', {
    name: game.i18n.localize('WOD5E.Settings.AutomateHunger'),
    hint: game.i18n.localize('WOD5E.Settings.AutomateHungerHint'),
    scope: 'world',
    config: false,
    default: true,
    type: Boolean
  })

  game.settings.register('vtm5e', 'automatedOblivion', {
    name: game.i18n.localize('WOD5E.Settings.AutomateOblivion'),
    hint: game.i18n.localize('WOD5E.Settings.AutomateOblivionHint'),
    scope: 'world',
    config: false,
    default: true,
    type: Boolean
  })

  game.settings.register('vtm5e', 'automatedRage', {
    name: game.i18n.localize('WOD5E.Settings.AutomateRage'),
    hint: game.i18n.localize('WOD5E.Settings.AutomateRageHint'),
    scope: 'world',
    config: false,
    default: true,
    type: Boolean
  })

  /*
    Storyteller Settings
  */

  // Register the storyteller menu
  game.settings.registerMenu('vtm5e', 'storytellerMenu', {
    name: game.i18n.localize('WOD5E.Settings.StorytellerMenu'),
    hint: game.i18n.localize('WOD5E.Settings.StorytellerMenuHint'),
    label: game.i18n.localize('WOD5E.Settings.StorytellerMenu'),
    icon: 'fas fa-bars',
    type: StorytellerMenu,
    restricted: true
  })

  // Register the modified attributes
  game.settings.register('vtm5e', 'modifiedAttributes', {
    name: game.i18n.localize('WOD5E.Settings.ModifiedAttributes'),
    hint: game.i18n.localize('WOD5E.Settings.ModifiedAttributesHint'),
    scope: 'world',
    config: false,
    default: [],
    type: Array,
    onChange: async () => {
      // Re-render the storyteller menu window once settings are updated
      _rerenderStorytellerWindow()

      // Re-init labels
      WOD5E.Attributes.initializeLabels()

      // Reload actorsheets
      resetActors()
    }
  })

  // Register the custom attributes
  game.settings.register('vtm5e', 'customAttributes', {
    name: game.i18n.localize('WOD5E.Settings.CustomAttributes'),
    hint: game.i18n.localize('WOD5E.Settings.CustomAttributes'),
    scope: 'world',
    config: false,
    default: [],
    type: Array,
    onChange: async (customAttributes) => {
      // Re-render the storyteller menu window once settings are updated
      _rerenderStorytellerWindow()

      // Grab the custom attributes and send them to the function to update the list
      WOD5E.Attributes.addCustom(customAttributes)

      // Re-init labels
      WOD5E.Attributes.initializeLabels()

      // Reload actorsheets
      resetActors()
    }
  })

  // Register the modified skills
  game.settings.register('vtm5e', 'modifiedSkills', {
    name: game.i18n.localize('WOD5E.Settings.ModifiedSkills'),
    hint: game.i18n.localize('WOD5E.Settings.ModifiedSkillsHint'),
    scope: 'world',
    config: false,
    default: [],
    type: Array,
    onChange: async () => {
      // Re-render the storyteller menu window once settings are updated
      _rerenderStorytellerWindow()

      // Re-init labels
      WOD5E.Skills.initializeLabels()

      // Reload actorsheets
      resetActors()
    }
  })

  // Register the custom attributes
  game.settings.register('vtm5e', 'customSkills', {
    name: game.i18n.localize('WOD5E.Settings.CustomSkills'),
    hint: game.i18n.localize('WOD5E.Settings.CustomSkillsHint'),
    scope: 'world',
    config: false,
    default: [],
    type: Array,
    onChange: async (customSkills) => {
      // Re-render the storyteller menu window once settings are updated
      _rerenderStorytellerWindow()

      // Grab the custom skills and send them to the function to update the list
      WOD5E.Skills.addCustom(customSkills)

      // Re-init labels
      WOD5E.Skills.initializeLabels()

      // Reload actorsheets
      resetActors()
    }
  })
}

function _rerenderStorytellerWindow () {
  const storytellerWindow = Object.values(ui.windows).filter(w => (w.id === 'wod5e-storyteller'))[0]

  if (storytellerWindow) {
    storytellerWindow.render()
  }
}
