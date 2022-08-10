/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  console.log('Schrecknet : loading subroutines')
  // Define template paths to load
  const templatePaths = [
    // Actor Sheet Partials
    'systems/wod5e/templates/actor/parts/biography.html',
    'systems/wod5e/templates/actor/parts/blood.html',
    'systems/wod5e/templates/actor/parts/danger.html',
    'systems/wod5e/templates/actor/parts/despair.html',
    'systems/wod5e/templates/actor/parts/desperation.html',
    'systems/wod5e/templates/actor/parts/disciplines.html',
    'systems/wod5e/templates/actor/parts/edges.html',
    'systems/wod5e/templates/actor/parts/exp.html',
    'systems/wod5e/templates/actor/parts/features.html',
    'systems/wod5e/templates/actor/parts/frenzy.html',
    'systems/wod5e/templates/actor/parts/health.html',
    'systems/wod5e/templates/actor/parts/humanity.html',
    'systems/wod5e/templates/actor/parts/hunger.html',
    'systems/wod5e/templates/actor/parts/profile-img.html',
    'systems/wod5e/templates/actor/parts/other.html',
    'systems/wod5e/templates/actor/parts/rouse.html',
    'systems/wod5e/templates/actor/parts/stats.html',
    'systems/wod5e/templates/actor/parts/willpower.html',
    'systems/wod5e/templates/actor/parts/standard-dice-pools.html',
    'systems/wod5e/templates/actor/parts/exceptional-dice-pools.html',
    'systems/wod5e/templates/actor/parts/generaldifficulty.html',
    'systems/wod5e/templates/actor/parts/notes.html',
    'systems/wod5e/templates/actor/parts/spc-disciplines.html',

    // Item Sheet Partials
    'systems/wod5e/templates/item/parts/skills.html',
    'systems/wod5e/templates/item/parts/disciplines.html',
    'systems/wod5e/templates/item/parts/edges.html',
    'systems/wod5e/templates/item/parts/attributes.html',

    // Dice Tray Partials
    'systems/wod5e/templates/ui/parts/select-character.html',
    'systems/wod5e/templates/ui/parts/pool1-select-attribute.html',
    'systems/wod5e/templates/ui/parts/pool1-select-skill.html',
    'systems/wod5e/templates/ui/parts/pool1-select-discipline.html',
    'systems/wod5e/templates/ui/parts/pool2-select-attribute.html',
    'systems/wod5e/templates/ui/parts/pool2-select-skill.html',
    'systems/wod5e/templates/ui/parts/pool2-select-discipline.html',
    'systems/wod5e/templates/ui/parts/pool2-nothing.html'
  ]

  /* Load the template parts
     That function is part of foundry, not founding it here is normal
  */
  return loadTemplates(templatePaths) // eslint-disable-line no-undef
}
