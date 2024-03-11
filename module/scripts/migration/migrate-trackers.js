/* global ui, game */

export const MigrateTrackers = async function () {
  const actorsList = game.actors
  const totalIterations = actorsList.size
  const migrationIDs = []

  // If there's nothing to go through, then just resolve and move on.
  if (totalIterations === 0) { return [] }

  // Fix localization strings (v3.0.1)
  for (const actor of actorsList) {
    const actorHealthData = actor.system.health
    const actorWillpowerData = actor.system.willpower

    // Check if the actor has health and willpower (so we ignore group sheets)
    if (actorHealthData && actorWillpowerData) {
      // Check if the actor already has health.value defined
      if (!actorHealthData.value) {
        // Derive the character's "health value" by taking
        // the sum of the current aggravated and superficial
        // damage taken and subtracting the max by that;
        // superficial damage is reduced by half to represent
        // its lesser effect
        const newActorHealthValue = actorHealthData.max - (actorHealthData.aggravated + (actorHealthData.superficial / 2))

        ui.notifications.info(`Fixing actor ${actor.name}: Updating health data.`)
        migrationIDs.push(actor.uuid)

        // Update the actor's data with the new information
        actor.update({ 'system.health.value': newActorHealthValue })
      }

      // Check if the actor already has willpower.value defined
      if (!actorWillpowerData.value) {
        // Derive the character's "willpower value" by taking
        // the sum of the current aggravated and superficial
        // damage taken and subtracting the max by that;
        // superficial damage is reduced by half to represent
        // its lesser effect
        const newActorWillpowerValue = actorWillpowerData.max - (actorWillpowerData.aggravated + (actorWillpowerData.superficial / 2))

        ui.notifications.info(`Fixing actor ${actor.name}: Updating willpower data.`)
        migrationIDs.push(actor.uuid)

        // Update the actor's data with the new information
        actor.update({ 'system.willpower.value': newActorWillpowerValue })
      }
    }
  }

  return migrationIDs
}
