import { db, doc, updateDoc } from './firebase';

export const sendReaction = async (
  collectionName: string,
  roomId: string,
  senderId: string,
  emoji: string
) => {
  const roomRef = doc(db, collectionName, roomId);
  try {
    await updateDoc(roomRef, {
      lastReaction: {
        emoji,
        senderId,
        timestamp: Date.now(),
      },
    });
  } catch (err) {
    console.error("Failed to send reaction", err);
  }
};
