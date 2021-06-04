/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function() {
    console.log("Schrecknet : loading subroutines");
    // Define template paths to load
    const templatePaths = [
  
      // Item Sheet Partials
      "systems/vtm5e/templates/item/parts/skills.html",
      "systems/vtm5e/templates/item/parts/attributes.html"      

    ];
  
    // Load the template parts
    return loadTemplates(templatePaths);
  };
