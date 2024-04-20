/* global Actor, game, renderTemplate, Dialog, FormDataExtended, foundry, WOD5E, CONST */

/**
 * Extend the base ActorDirectory functionality
 * @extends {ActorDirectory}
 */
export class WOD5EActorDirectory extends ActorDirectory {
  constructor (...args) {
    super (...args)

    this.groups = {}
  }

  activateListeners(html) {
    super.activateListeners(html)
  }

  async getData () {
    const data = await super.getData()

    // The structure of the sidebar we're going to be manipulating
    const sidebarStructure = data.tree

    // List of actors in groups
    const actorsInGroups = []

    // Push each cell and coterie into the groupsList
    this.groups = sidebarStructure.entries.filter(actor => actor.type === 'coterie' || actor.type === 'cell')

    // Iterate through each group's members list
    this.groups.forEach(group => {
      const groupMembers = group.system?.members

      // Add group members to actorsInGroups list so we can filter them out later
      groupMembers.forEach(actor => {
        const actorId = fromUuidSync(actor).id

        actorsInGroups.push(actorId)
      })
    })

    return data
  }
}
