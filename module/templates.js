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
    'systems/vtm5e/templates/actor/parts/biography.html',
    'systems/vtm5e/templates/actor/parts/blood.html',
    'systems/vtm5e/templates/actor/parts/disciplines.html',
    'systems/vtm5e/templates/actor/parts/exp.html',
    'systems/vtm5e/templates/actor/parts/features.html',
    'systems/vtm5e/templates/actor/parts/frenzy.html',
    'systems/vtm5e/templates/actor/parts/health.html',
    'systems/vtm5e/templates/actor/parts/humanity.html',
    'systems/vtm5e/templates/actor/parts/hunger.html',
    'systems/vtm5e/templates/actor/parts/profile-img.html',
    'systems/vtm5e/templates/actor/parts/other.html',
    'systems/vtm5e/templates/actor/parts/rouse.html',
    'systems/vtm5e/templates/actor/parts/stats.html',
    'systems/vtm5e/templates/actor/parts/willpower.html',

    // Item Sheet Partials
    'systems/vtm5e/templates/item/parts/skills.html',
    'systems/vtm5e/templates/item/parts/disciplines.html',
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
