/* global ui, game */

export const MigrateSpecialties = async function () {
  return new Promise((resolve) => {
    const actorsList = game.actors
    const totalIterations = actorsList.size
    const migrationIDs = []
    let counter = 0

    // Migrate specialties to their appropriate skills (v4.0.0)
    for (const actor of actorsList) {
      let actorData = actor.system
      let actorItems = actor.items

      if (actorItems.filter(item => item.type === 'specialty').length > 0) {
        ui.notifications.info(`Fixing actor ${actor.name}: Migrating specialties data.`)

        actorItems = actorItems.map(item => {
          if (item.type === 'specialty' && item.system && item.system.skill) {
            const skill = item.system.skill
            actorData.skills[skill] = actorData.skills[skill] || { bonuses: [] }
      
            // Modify the 'specialty' data before adding it to 'bonuses'
            const modifiedSpecialty = {
              source: `${item.name}`,
              value: 1,
              paths: [`skills.${skill}`],
              activeWhen: {
                "check": "always"
              }
            }
      
            actorData.skills[skill].bonuses.push(modifiedSpecialty)
            return null // Mark for removal
          }
          return item // Keep other items
        }).filter(Boolean) // Remove null entries

        // Update the actor data with the new data
        actor.update({ system: actorData, items: actorItems })
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
