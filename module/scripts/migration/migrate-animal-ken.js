/* global ui, game */

export const MigrateAnimalKen = async function () {
  return new Promise((resolve) => {
    const actorsList = game.actors
    const totalIterations = actorsList.size
    const migrationIDs = []
    let counter = 0

    // Fix the Animal Ken skill (v4.0.0)
    for (const actor of actorsList) {
      const actorData = actor.system

      // Handle SPC sheets first
      if (actor.type === 'spc') {
        // Check if the actor already has animalken (the fixed skill)
        if (actorData.exceptionaldicepools['animal ken']) {
          // Define the new actor skill we'll derive the data from
          actorData.exceptionaldicepools.animalken = actorData.exceptionaldicepools['animal ken']
          // Delete the old skill
          delete actorData.exceptionaldicepools['animal ken']

          // Send a notification and push the actor ID to the migration IDs list
          ui.notifications.info(`Fixing actor ${actor.name}: Migrating Animal Ken data.`)
          migrationIDs.push(actor.uuid)

          // Update the actor's data with the new information
          actor.update({ 'exceptionaldicepools':  actorData.exceptionaldicepools})
        }
      } else if (actor.type !== 'cell' && actor.type !== 'coterie') { // Ignore cell and coterie sheets
        // Check if the actor already has animalken (the fixed skill)
        if (actorData.skills['animal ken']) {
          // Define the new actor skill we'll derive the data from
          actorData.skills.animalken = actorData.skills['animal ken']
          // Delete the old skill
          delete actorData.skills['animal ken']

          // Send a notification and push the actor ID to the migration IDs list
          ui.notifications.info(`Fixing actor ${actor.name}: Migrating Animal Ken data.`)
          migrationIDs.push(actor.uuid)

          // Update the actor's data with the new information
          actor.update({ 'skills': actorData.skills })
        }
      }

      // Increase the counter and continue
      counter++

      // Only resolve when we're finished going through all the actors.
      if (counter === totalIterations) {
        resolve(migrationIDs)
      }
    }
  })
}
