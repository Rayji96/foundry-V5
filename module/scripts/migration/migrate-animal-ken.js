/* global ui, game */

export const MigrateAnimalKen = async function () {
  const actorsList = game.actors
  const totalIterations = actorsList.size
  const migrationIDs = []

  // If there's nothing to go through, then just resolve and move on.
  if (totalIterations === 0) { return [] }

  // Fix the Animal Ken skill (v4.0.0)
  for (const actor of actorsList) {
    const actorData = actor.system

    // Handle SPC sheets first
    if (actor.type === 'spc') {
      // Check if the actor has animal ken (the broken skill)
      if (hasProperty(actorData, 'exceptionaldicepools.animal ken')) {
        // Define the new actor skill we'll derive the data from
        actorData.exceptionaldicepools.animalken = actorData.exceptionaldicepools['animal ken']

        // Delete the old skill
        delete actorData.exceptionaldicepools['animal ken']
        await actor.update({ 'system.exceptionaldicepools.-=animal ken': null })

        // Update the actor's data with the new information
        await actor.update({ 'system.exceptionaldicepools': actorData.exceptionaldicepools })

        // Send a notification and push the actor ID to the migration IDs list
        ui.notifications.info(`Fixing actor ${actor.name}: Migrating Animal Ken data.`)
        migrationIDs.push(actor.uuid)
      }
    } else if (actor.type !== 'cell' && actor.type !== 'coterie' && actor.type !== 'group') { // Ignore group sheets
      // Check if the actor has animal ken (the broken skill)
      if (hasProperty(actorData, 'skills.animal ken')) {
        // Define the new actor skill we'll derive the data from
        actorData.skills.animalken = actorData.skills['animal ken']

        // Delete the old skill
        delete actorData.skills['animal ken']
        await actor.update({ 'system.skills.-=animal ken': null })

        // Update the actor's data with the new information
        await actor.update({ 'system.skills': actorData.skills })

        // Send a notification and push the actor ID to the migration IDs list
        ui.notifications.info(`Fixing actor ${actor.name}: Migrating Animal Ken data.`)
        migrationIDs.push(actor.uuid)
      }
    }
  }

  return migrationIDs

  // Quick function to check if a property exists on an object
  function hasProperty (obj, path) {
    return path.split('.').every(prop => prop in obj && (obj = obj[prop]))
  }
}
