/* global ui, game */

export const MigrateSpecialties = async function () {
  return new Promise((resolve) => {
    const actorsList = game.actors
    const totalIterations = actorsList.size
    const migrationIDs = []
    let counter = 0

    // Migrate specialties to their appropriate skills (v4.0.0)
    for (const actor of actorsList) {
      // Variables
      const actorData = actor.system
      const actorInvalidItems = actor.items.invalidDocumentIds
      const actorInvalidItemsList = []

      // Check for invalid items
      if (actorInvalidItems.size > 0) {
        // Add each invalid item on the actor to the list
        for (const invalidID of actorInvalidItems) {
          actorInvalidItemsList.push(actor.items.getInvalid(invalidID))
        }

        // Check for if there's specialties that are invalid
        const invalidSpecialties = actorInvalidItemsList.filter(item => item.type === 'specialty')
        if (invalidSpecialties.length > 0) {
          ui.notifications.info(`Fixing actor ${actor.name}: Migrating specialties data.`)
          migrationIDs.push(actor.uuid)

          invalidSpecialties.map(item => {
            // Define what skill we're using
            const skill = item.system.skill

            // If 'bonuses' doesn't already exist for this skill, create it
            if (!actorData.skills[skill].prototype.hasOwnProperty('bonuses')) {
              actorData.skills[skill].bonuses = []
            }

            // Construct the 'specialty' data together
            const modifiedSpecialty = {
              source: `${item.name}`,
              value: 1,
              paths: [`skills.${skill}`],
              activeWhen: {
                check: 'always'
              }
            }

            // Push the new specialty to the 'bonuses' array
            actorData.skills[skill].bonuses.push(modifiedSpecialty)

            // Remove the item
            actor.items.getInvalid(item._id).delete()

            return item
          })

          // Update the actor data with the new data when finished
          actor.update({ system: actorData, 'items.invalidDocumentIds': actorInvalidItems })
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
