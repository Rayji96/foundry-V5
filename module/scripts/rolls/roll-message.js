// Import dice face-related variables for icon paths
import { mortalDiceLocation, vampireDiceLocation, werewolfDiceLocation, hunterDiceLocation, normalDiceFaces, hungerDiceFaces, rageDiceFaces, desperationDiceFaces } from '../../dice/icons.js'

  /**
   * Function to help generate the chat message after a roll is made
   *
   * @param roll                      The roll after being handled by Foundry
   * @param system                    (Optional, default "mortal") The gamesystem the roll is coming from
   * @param actor                     The actor that the roll is coming from
   * @param data                      Actor or item data to pass along with the roll
   * @param title                     Title of the roll for the chat message
   * @param flavor                    (Optional, default "") Text that appears in the description of the roll
   */
export async function generateRollMessage ({
  roll,
  system = "mortal",
  actor,
  data,
  title,
  flavor = ""
}) {
  let message

  console.log(roll)

  return message
}