import { addDoc, collection, doc, getDocs, onSnapshot, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '../db/config'; // Your Firebase config
import { Destination, Hangout, ParticipantStatus } from '../types/session.types';

export const createHangout = async (
  myId: string,
  friendId: string,
  destination: Destination
): Promise<string> => {
  try {
    const hangoutData = {
      participants: [myId, friendId],
      participantInfo: {
        [myId]: { status: 'On My Way', updatedAt: serverTimestamp() },
        [friendId]: { status: 'Idle', updatedAt: serverTimestamp() },
      },
      destination,
      createdAt: serverTimestamp(),
      isActive: true,
      createdBy: myId,
    };
    
    const docRef = await addDoc(collection(db, 'hangouts'), hangoutData);
    console.log('✅ Hangout created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Failed to create hangout:', error);
    throw new Error('Failed to create hangout');
  }
};

export const listenToHangout = (
  hangoutId: string,
  callback: (hangout: Hangout) => void
) => {
  const docRef = doc(db, 'hangouts', hangoutId);
  
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      const hangout: Hangout = {
        id: snapshot.id,
        ...data
      } as Hangout;
      
      console.log('📱 Hangout updated:', hangout);
      callback(hangout);
    } else {
      console.warn('⚠️ Hangout document does not exist:', hangoutId);
    }
  }, (error) => {
    console.error('❌ Error listening to hangout:', error);
  });
};

export const updateMyStatus = async (
  hangoutId: string,
  myId: string,
  newStatus: ParticipantStatus
) => {
  try {
    const docRef = doc(db, 'hangouts', hangoutId);
    await updateDoc(docRef, {
      [`participantInfo.${myId}.status`]: newStatus,
      [`participantInfo.${myId}.updatedAt`]: serverTimestamp(),
    });
    
    console.log('✅ Status updated to:', newStatus);
  } catch (error) {
    console.error('❌ Failed to update status:', error);
    throw new Error('Failed to update status');
  }
};

export const endHangout = async (hangoutId: string) => {
  try {
    const docRef = doc(db, 'hangouts', hangoutId);
    await updateDoc(docRef, {
      isActive: false,
      endedAt: serverTimestamp(),
    });
    
    console.log('✅ Hangout ended:', hangoutId);
  } catch (error) {
    console.error('❌ Failed to end hangout:', error);
    throw new Error('Failed to end hangout');
  }
};

export const listenToUserHangouts = (
  userId: string,
  callback: (hangouts: Hangout[]) => void
) => {
  const hangsQuery = query(
    collection(db, 'hangouts'),
    where('participants', 'array-contains', userId),
    where('isActive', '==', true)
  );
  
  return onSnapshot(hangsQuery, (snapshot) => {
    const hangouts: Hangout[] = [];
    snapshot.forEach((doc) => {
      hangouts.push({
        id: doc.id,
        ...doc.data()
      } as Hangout);
    });
    
    console.log('📱 User hangouts updated:', hangouts.length);
    callback(hangouts);
  }, (error) => {
    console.error('❌ Error listening to user hangouts:', error);
  });
};

export const getActiveHangouts = async (userId: string): Promise<Hangout[]> => {
  try {
    const hangsQuery = query(
      collection(db, 'hangouts'),
      where('participants', 'array-contains', userId),
      where('isActive', '==', true)
    );
    
    const snapshot = await getDocs(hangsQuery);
    const hangouts: Hangout[] = [];
    
    snapshot.forEach((doc) => {
      hangouts.push({
        id: doc.id,
        ...doc.data()
      } as Hangout);
    });
    
    console.log('📱 Active hangouts found:', hangouts.length);
    return hangouts;
  } catch (error) {
    console.error('❌ Failed to get active hangouts:', error);
    throw new Error('Failed to get active hangouts');
  }
};

export const joinExistingHangout = async (hangoutId: string, userId: string) => {
  try {
    const docRef = doc(db, 'hangouts', hangoutId);
    await updateDoc(docRef, {
      [`participantInfo.${userId}.status`]: 'On My Way',
      [`participantInfo.${userId}.updatedAt`]: serverTimestamp(),
    });
    
    console.log('✅ Joined hangout:', hangoutId);
  } catch (error) {
    console.error('❌ Failed to join hangout:', error);
    throw new Error('Failed to join hangout');
  }
};
