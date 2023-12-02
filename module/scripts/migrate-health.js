/* global ui, game */

export const MigrateHealth = async function () {
  return new Promise((resolve) => {
    const actorsList = game.actors
    const totalIterations = actorsList.size
    const migrationIDs = []
    let counter = 0

    // Fix localization strings (v3.0.1)
    for (const actor of actorsList) {
      const actorHealthData = actor.system.health

      // Check if the actor has health (so we ignore group sheets)
      if(actorHealthData) {
        // Check if the actor already has health.value defined
        if (!actorHealthData.value) {
          // Derive the character's "health value" by taking
          // the sum of the current aggravated and superficial
          // damage taken; superficial damage is reduced by half
          // to represent its lesser effect
          const newActorHealthValue = actorHealthData.aggravated + (actorHealthData.superficial/2)

          ui.notifications.info(`Fixing actor ${actor.name}: Updating health data.`)
          migrationIDs.push(actor.uuid)

          // Update the actor's data with the new information
          actor.update({ 'system.health.value':  newActorHealthValue})
        }

        // Increase the counter and continue
        counter++

        // Only resolve when we're finished going through all the actors.
        if (counter === totalIterations) {
          resolve(migrationIDs)
        }
      }
    }
  })
}
