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
    'systems/vtm5e/templates/actor/parts/biography.html',
    'systems/vtm5e/templates/actor/parts/exp.html',
    'systems/vtm5e/templates/actor/parts/features.html',
    'systems/vtm5e/templates/actor/parts/health.html',
    'systems/vtm5e/templates/actor/parts/profile-img.html',
    'systems/vtm5e/templates/actor/parts/other.html',
    'systems/vtm5e/templates/actor/parts/stats.html',
    'systems/vtm5e/templates/actor/parts/willpower.html',
    'systems/vtm5e/templates/actor/parts/notes.html',

    // Hunter Sheet Partials
    'systems/vtm5e/templates/actor/parts/hunter/danger.html',
    'systems/vtm5e/templates/actor/parts/hunter/despair.html',
    'systems/vtm5e/templates/actor/parts/hunter/desperation.html',
    'systems/vtm5e/templates/actor/parts/hunter/edges.html',

    // Vampire Sheet Partials
    'systems/vtm5e/templates/actor/parts/vampire/disciplines.html',
    'systems/vtm5e/templates/actor/parts/vampire/blood.html',
    'systems/vtm5e/templates/actor/parts/vampire/frenzy.html',
    'systems/vtm5e/templates/actor/parts/vampire/humanity.html',
    'systems/vtm5e/templates/actor/parts/vampire/hunger.html',
    'systems/vtm5e/templates/actor/parts/vampire/rouse.html',

    // Werewolf Sheet Partials
    'systems/vtm5e/templates/actor/parts/werewolf/gifts-rites.html',
    'systems/vtm5e/templates/actor/parts/werewolf/forms.html',
    'systems/vtm5e/templates/actor/parts/werewolf/balance.html',
    'systems/vtm5e/templates/actor/parts/werewolf/frenzy.html',
    'systems/vtm5e/templates/actor/parts/werewolf/rage.html',

    // SPC Sheet Partials
    'systems/vtm5e/templates/actor/parts/spc/standard-dice-pools.html',
    'systems/vtm5e/templates/actor/parts/spc/exceptional-dice-pools.html',
    'systems/vtm5e/templates/actor/parts/spc/generaldifficulty.html',
    'systems/vtm5e/templates/actor/parts/spc/spc-disciplines.html',

    // Item Sheet Partials
    'systems/vtm5e/templates/item/parts/skills.html',
    'systems/vtm5e/templates/item/parts/disciplines.html',
    'systems/vtm5e/templates/item/parts/edges.html',
    'systems/vtm5e/templates/item/parts/attributes.html',

    // Dice Tray Partials
    'systems/vtm5e/templates/ui/parts/select-character.html',
    'systems/vtm5e/templates/ui/parts/pool1-select-attribute.html',
    'systems/vtm5e/templates/ui/parts/pool1-select-skill.html',
    'systems/vtm5e/templates/ui/parts/pool1-select-discipline.html',
    'systems/vtm5e/templates/ui/parts/pool2-select-attribute.html',
    'systems/vtm5e/templates/ui/parts/pool2-select-skill.html',
    'systems/vtm5e/templates/ui/parts/pool2-select-discipline.html',
    'systems/vtm5e/templates/ui/parts/pool2-nothing.html'
  ]

  /* Load the template parts
     That function is part of foundry, not founding it here is normal
  */
  return loadTemplates(templatePaths) // eslint-disable-line no-undef
}
