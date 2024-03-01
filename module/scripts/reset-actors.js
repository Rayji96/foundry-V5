/* global game */

/**
 * Function to re-render the actors across the system
 * @param actors                        (Default: All actors) A list of actors to reset the sheets of
 */
export const resetActors = async (actors) => {
  // Get all actors if a list of actors isn't already defined
  if (!actors) {
    actors = [
      game.actors.contents,
      game.scenes.contents.flatMap((scene) => scene.tokens.contents).flatMap((token) => token.actor || [])
    ].flat()
  }

  // Loop through chosen actors
  for (const actor of actors) {
    // Reset and re-render each actor
    actor.reset()
    actor.render()
  }
}
