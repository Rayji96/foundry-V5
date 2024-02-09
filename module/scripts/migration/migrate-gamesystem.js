/* global ui, game */

export const MigrateGamesystem = async function () {
  return new Promise((resolve) => {
    const actorsList = game.actors
    const totalIterations = actorsList.size
    const migrationIDs = []
    let counter = 0

    // Fix localization strings (v3.0.0)
    for (const actor of actorsList) {
      const actorData = actor.system

      // Ignore cell and coterie sheets
      if (actor.type !== 'cell' && actor.type !== 'coterie') {
        // Check if the actor already has gamesystem defined
        if (!actorData.gamesystem) {
          // Define the actor label which we'll derive the gamesystem from
          const actorLabel = actorData.label
          let definedSystem

          // Fill in the gamesystem using the actor's label
          if (actorLabel === 'WOD5E.Ghoul' || actorLabel === 'WOD5E.Vampire') {
            definedSystem = 'vampire'
          } else if (actorLabel === 'WOD5E.Werewolf') {
            definedSystem = 'werewolf'
          } else if (actorLabel === 'WOD5E.Hunter') {
            definedSystem = 'hunter'
          } else {
            definedSystem = 'mortal'
          }

          ui.notifications.info(`Fixing actor ${actor.name}: Adding gamesystem data.`)
          migrationIDs.push(actor.uuid)

          // Update the actor's data with the new information
          actor.update({ gamesystem: definedSystem })
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
