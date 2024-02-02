/* global ChatMessage */

export async function _decreaseRage (actor, amount) {
  // Reduce rage for each failure on a rage dice if this is a power that consumes it
  const currentRage = actor.system.rage.value
  const newRageAmount = Math.max(currentRage - amount, 0)

  if (newRageAmount === 0 && currentRage > 0) {
    const chatMessage = `<p class="roll-label uppercase">Lost The Wolf</p>
    <p class="roll-content result-rage result-possible">This actor has 0 rage and has lost the wolf.</p>`

    // Post the message to the chat
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: chatMessage
    })
  }

  // Update the actor with the new amount of rage
  actor.update({ 'system.rage.value': newRageAmount })
}