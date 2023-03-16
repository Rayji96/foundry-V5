/* global Actor, game, renderTemplate, Dialog, FormDataExtended, foundry */

let game: Game;

/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class VampireActor extends Actor {
  /**
   * Augment the basic actor data with additional dynamic data.
   */
  prepareData() {
    super.prepareData();

    // const actorData = this.data
    // const data = actorData.data;
    // const flags = actorData.flags;

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    // if (actorData.type === 'character') this._prepareCharacterData(actorData)
  }
}
