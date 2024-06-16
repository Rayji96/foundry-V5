/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  console.log('Schrecknet : loading subroutines')

  // Define template paths to load
  const templatePaths = [
    // Base Sheet Partials
    'systems/vtm5e/templates/actor/parts/biography.hbs',
    'systems/vtm5e/templates/actor/parts/exp.hbs',
    'systems/vtm5e/templates/actor/parts/features.hbs',
    'systems/vtm5e/templates/actor/parts/health.hbs',
    'systems/vtm5e/templates/actor/parts/profile-img.hbs',
    'systems/vtm5e/templates/actor/parts/other.hbs',
    'systems/vtm5e/templates/actor/parts/stats.hbs',
    'systems/vtm5e/templates/actor/parts/willpower.hbs',
    'systems/vtm5e/templates/actor/parts/notes.hbs',
    'systems/vtm5e/templates/actor/parts/skill-dialog.hbs',
    'systems/vtm5e/templates/actor/parts/specialty-display.hbs',

    // Hunter Sheet Partials
    'systems/vtm5e/templates/actor/parts/hunter/danger.hbs',
    'systems/vtm5e/templates/actor/parts/hunter/despair.hbs',
    'systems/vtm5e/templates/actor/parts/hunter/desperation.hbs',
    'systems/vtm5e/templates/actor/parts/hunter/edges.hbs',

    // Vampire Sheet Partials
    'systems/vtm5e/templates/actor/parts/vampire/disciplines.hbs',
    'systems/vtm5e/templates/actor/parts/vampire/blood.hbs',
    'systems/vtm5e/templates/actor/parts/vampire/frenzy.hbs',
    'systems/vtm5e/templates/actor/parts/vampire/humanity.hbs',
    'systems/vtm5e/templates/actor/parts/vampire/hunger.hbs',
    'systems/vtm5e/templates/actor/parts/vampire/rouse.hbs',

    // Werewolf Sheet Partials
    'systems/vtm5e/templates/actor/parts/werewolf/gifts-rites.hbs',
    'systems/vtm5e/templates/actor/parts/werewolf/wolf.hbs',
    'systems/vtm5e/templates/actor/parts/werewolf/balance.hbs',
    'systems/vtm5e/templates/actor/parts/werewolf/frenzy.hbs',
    'systems/vtm5e/templates/actor/parts/werewolf/rage-button.hbs',
    'systems/vtm5e/templates/actor/parts/werewolf/rage-value.hbs',
    'systems/vtm5e/templates/actor/parts/werewolf/renown.hbs',
    'systems/vtm5e/templates/actor/parts/werewolf/forms.hbs',

    // SPC Sheet Partials
    'systems/vtm5e/templates/actor/parts/spc/standard-dice-pools.hbs',
    'systems/vtm5e/templates/actor/parts/spc/exceptional-dice-pools.hbs',
    'systems/vtm5e/templates/actor/parts/spc/generaldifficulty.hbs',
    'systems/vtm5e/templates/actor/parts/spc/spc-disciplines.hbs',

    // Group Sheet Partials
    'systems/vtm5e/templates/actor/parts/group/type-selector.hbs',
    'systems/vtm5e/templates/actor/parts/group/group-members.hbs',
    'systems/vtm5e/templates/actor/parts/group/description.hbs',

    // Item Sheet Partials
    'systems/vtm5e/templates/item/parts/skills.hbs',
    'systems/vtm5e/templates/item/parts/disciplines.hbs',
    'systems/vtm5e/templates/item/parts/edges.hbs',
    'systems/vtm5e/templates/item/parts/attributes.hbs',
    'systems/vtm5e/templates/item/parts/gifts.hbs',
    'systems/vtm5e/templates/item/parts/renown.hbs',
    'systems/vtm5e/templates/item/parts/bonuses.hbs',
    'systems/vtm5e/templates/item/parts/bonus-display.hbs',
    'systems/vtm5e/templates/item/parts/macro.hbs',

    // Dice Tray Partials
    //'systems/vtm5e/templates/ui/parts/select-character.hbs',
    //'systems/vtm5e/templates/ui/parts/pool1-select-attribute.hbs',
    //'systems/vtm5e/templates/ui/parts/pool1-select-skill.hbs',
    //'systems/vtm5e/templates/ui/parts/pool1-select-discipline.hbs',
    //'systems/vtm5e/templates/ui/parts/pool2-select-attribute.hbs',
    //'systems/vtm5e/templates/ui/parts/pool2-select-skill.hbs',
    //'systems/vtm5e/templates/ui/parts/pool2-select-discipline.hbs',
    //'systems/vtm5e/templates/ui/parts/pool2-nothing.hbs',

    // Roll dialog Partials
    'systems/vtm5e/templates/ui/parts/roll-dialog-base.hbs',
    'systems/vtm5e/templates/ui/parts/situational-modifiers.hbs',
    'systems/vtm5e/templates/ui/mortal-roll-dialog.hbs',
    'systems/vtm5e/templates/ui/vampire-roll-dialog.hbs',
    'systems/vtm5e/templates/ui/werewolf-roll-dialog.hbs',
    'systems/vtm5e/templates/ui/hunter-roll-dialog.hbs',

    // Chat Message Partials
    'systems/vtm5e/templates/chat/roll-message.hbs',
    'systems/vtm5e/templates/chat/willpower-damage.hbs',
    'systems/vtm5e/templates/chat/willpower-reroll.hbs',

    // Menu Partials
    'systems/vtm5e/templates/ui/automation-menu.hbs',
    'systems/vtm5e/templates/ui/storyteller-menu.hbs',
    'systems/vtm5e/templates/ui/parts/storyteller-menu/modification-menu.hbs',
    'systems/vtm5e/templates/ui/parts/storyteller-menu/custom-menu.hbs',
    'systems/vtm5e/templates/ui/select-dialog.hbs'
  ]

  /* Load the template parts
  */
  return loadTemplates(templatePaths) // eslint-disable-line no-undef
}
