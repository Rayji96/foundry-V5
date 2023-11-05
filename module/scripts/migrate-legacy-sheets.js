/* global ui, game */

export const MigrateLegacySheets = async function() {
  return new Promise((resolve, reject) => {
    const invalidActorsList = game.actors.invalidDocumentIds
    const totalIterations = invalidActorsList.size
    let counter = 0
    let migrationIDs = []

    // If there's nothing to go through, then just resolve and move on.
    if (!totalIterations) { resolve() }

    // Collect invalid actors and correct them (v3.0.0)
    for (const id of invalidActorsList) {
      const actor = game.actors.getInvalid(id)

      // Migrate any legacy sheets to vampire sheets
      if (actor.type === 'character') {
        ui.notifications.info(`Fixing actor ${actor.name}: Changing Legacy Sheet to Vampire Sheet.`)

        migrationIDs.push(id)
        actor.update({ type: 'vampire' })
      }
    }

    // Increase the counter and continue
    counter++

    // Only resolve when we're finished going through all the actors.
    if (counter === totalIterations) {
      resolve(migrationIDs)
    }
  })
}
