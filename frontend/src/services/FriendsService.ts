import {
  addDoc,
  and,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from '../db/config';
import { Friend, FriendRequest, UserProfile } from '../types/friends.types';

// Create or update user profile
export const createUserProfile = async (
  userId: string,
  email: string,
  userName: string
): Promise<void> => {
  try {
    const userProfile: Omit<UserProfile, 'id'> = {
      email,
      userName,
      friends: [],
      friendRequests: {
        sent: [],
        received: [],
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'users', userId), userProfile);
    console.log('✅ User profile created:', userId);
  } catch (error) {
    console.error('❌ Failed to create user profile:', error);
    throw new Error('Failed to create user profile');
  }
};

// Get user profile
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as UserProfile;
    }

    return null;
  } catch (error) {
    console.error('❌ Failed to get user profile:', error);
    throw new Error('Failed to get user profile');
  }
};

// Search users by email
export const searchUserByEmail = async (email: string): Promise<UserProfile | null> => {
  try {
    const usersQuery = query(
      collection(db, 'users'),
      where('email', '==', email.toLowerCase())
    );

    const snapshot = await getDocs(usersQuery);

    if (!snapshot.empty) {
      const userDoc = snapshot.docs[0];
      return {
        id: userDoc.id,
        ...userDoc.data(),
      } as UserProfile;
    }

    return null;
  } catch (error) {
    console.error('❌ Failed to search user by email:', error);
    throw new Error('Failed to search user by email');
  }
};

// Send friend request
export const sendFriendRequest = async (
  fromUserId: string,
  toUserId: string
): Promise<string> => {
  try {
    // Get sender's profile
    const senderProfile = await getUserProfile(fromUserId);
    if (!senderProfile) {
      throw new Error('Sender profile not found');
    }

    // Create friend request
    const friendRequest: Omit<FriendRequest, 'id'> = {
      fromUserId,
      toUserId,
      fromUserEmail: senderProfile.email,
      fromUserName: senderProfile.userName,
      status: 'pending',
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'friendRequests'), friendRequest);

    // Update both users' friend request arrays
    await updateDoc(doc(db, 'users', fromUserId), {
      'friendRequests.sent': arrayUnion(docRef.id),
      updatedAt: serverTimestamp(),
    });

    await updateDoc(doc(db, 'users', toUserId), {
      'friendRequests.received': arrayUnion(docRef.id),
      updatedAt: serverTimestamp(),
    });

    console.log('✅ Friend request sent:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Failed to send friend request:', error);
    throw new Error('Failed to send friend request');
  }
};

// Accept friend request
export const acceptFriendRequest = async (
  requestId: string,
  currentUserId: string
): Promise<void> => {
  try {
    const requestDoc = await getDoc(doc(db, 'friendRequests', requestId));
    if (!requestDoc.exists()) {
      throw new Error('Friend request not found');
    }

    const request = requestDoc.data() as FriendRequest;

    // Update friend request status
    await updateDoc(doc(db, 'friendRequests', requestId), {
      status: 'accepted',
      respondedAt: serverTimestamp(),
    });

    // Add each user to the other's friends list
    await updateDoc(doc(db, 'users', request.fromUserId), {
      friends: arrayUnion(request.toUserId),
      'friendRequests.sent': arrayRemove(requestId),
      updatedAt: serverTimestamp(),
    });

    await updateDoc(doc(db, 'users', request.toUserId), {
      friends: arrayUnion(request.fromUserId),
      'friendRequests.received': arrayRemove(requestId),
      updatedAt: serverTimestamp(),
    });

    console.log('✅ Friend request accepted:', requestId);
  } catch (error) {
    console.error('❌ Failed to accept friend request:', error);
    throw new Error('Failed to accept friend request');
  }
};

// Reject friend request
export const rejectFriendRequest = async (
  requestId: string,
  currentUserId: string
): Promise<void> => {
  try {
    const requestDoc = await getDoc(doc(db, 'friendRequests', requestId));
    if (!requestDoc.exists()) {
      throw new Error('Friend request not found');
    }

    const request = requestDoc.data() as FriendRequest;

    // Update friend request status
    await updateDoc(doc(db, 'friendRequests', requestId), {
      status: 'rejected',
      respondedAt: serverTimestamp(),
    });

    // Remove from both users' arrays
    await updateDoc(doc(db, 'users', request.fromUserId), {
      'friendRequests.sent': arrayRemove(requestId),
      updatedAt: serverTimestamp(),
    });

    await updateDoc(doc(db, 'users', request.toUserId), {
      'friendRequests.received': arrayRemove(requestId),
      updatedAt: serverTimestamp(),
    });

    console.log('✅ Friend request rejected:', requestId);
  } catch (error) {
    console.error('❌ Failed to reject friend request:', error);
    throw new Error('Failed to reject friend request');
  }
};

// Get user's friends
export const getUserFriends = async (userId: string): Promise<Friend[]> => {
  try {
    const userProfile = await getUserProfile(userId);
    if (!userProfile || !userProfile.friends.length) {
      return [];
    }

    const friendsQuery = query(
      collection(db, 'users'),
      where('__name__', 'in', userProfile.friends)
    );

    const snapshot = await getDocs(friendsQuery);
    const friends: Friend[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      friends.push({
        id: doc.id,
        email: data.email,
        userName: data.userName,
        avatar: data.avatar,
        status: 'offline', // Default status, can be updated with real-time presence
      });
    });

    return friends;
  } catch (error) {
    console.error('❌ Failed to get user friends:', error);
    throw new Error('Failed to get user friends');
  }
};

// Listen to friend requests (received)
export const listenToFriendRequests = (
  userId: string,
  callback: (requests: FriendRequest[]) => void
) => {
  const requestsQuery = query(
    collection(db, 'friendRequests'),
    and(
      where('toUserId', '==', userId),
      where('status', '==', 'pending')
    )
  );

  return onSnapshot(requestsQuery, (snapshot) => {
    const requests: FriendRequest[] = [];
    snapshot.forEach((doc) => {
      requests.push({
        id: doc.id,
        ...doc.data(),
      } as FriendRequest);
    });

    console.log('📱 Friend requests updated:', requests.length);
    callback(requests);
  }, (error) => {
    console.error('❌ Error listening to friend requests:', error);
  });
};

// Listen to sent friend requests
export const listenToSentFriendRequests = (
  userId: string,
  callback: (requests: FriendRequest[]) => void
) => {
  const sentRequestsQuery = query(
    collection(db, 'friendRequests'),
    and(
      where('fromUserId', '==', userId),
      where('status', '==', 'pending')
    )
  );

  return onSnapshot(sentRequestsQuery, async (snapshot) => {
    try {
      const requests: FriendRequest[] = [];
      
      for (const doc of snapshot.docs) {
        const requestData = doc.data();
        
        // Get recipient's profile to show their name/email
        const recipientProfile = await getUserProfile(requestData.toUserId);
        
        requests.push({
          id: doc.id,
          ...requestData,
          toUserName: recipientProfile?.userName || 'Unknown User',
          toUserEmail: recipientProfile?.email || 'Unknown Email',
        } as FriendRequest);
      }

      console.log('📤 Sent friend requests updated:', requests.length);
      callback(requests);
    } catch (error) {
      console.error('❌ Error processing sent requests:', error);
    }
  }, (error) => {
    console.error('❌ Error listening to sent friend requests:', error);
  });
};

// Listen to user's friends list
export const listenToUserFriends = (
  userId: string,
  callback: (friends: Friend[]) => void
) => {
  const userDocRef = doc(db, 'users', userId);

  return onSnapshot(userDocRef, async (docSnap) => {
    try {
      if (docSnap.exists()) {
        const userData = docSnap.data() as UserProfile;
        
        if (!userData.friends || userData.friends.length === 0) {
          console.log('📱 Friends list updated: 0 friends');
          callback([]);
          return;
        }

        // Get friend details
        const friendsQuery = query(
          collection(db, 'users'),
          where('__name__', 'in', userData.friends)
        );

        const friendsSnapshot = await getDocs(friendsQuery);
        const friends: Friend[] = [];

        friendsSnapshot.forEach((friendDoc) => {
          const data = friendDoc.data();
          friends.push({
            id: friendDoc.id,
            email: data.email,
            userName: data.userName,
            avatar: data.avatar,
            status: 'offline', // Default status
          });
        });

        console.log('📱 Friends list updated:', friends.length);
        callback(friends);
      }
    } catch (error) {
      console.error('❌ Error processing friends update:', error);
    }
  }, (error) => {
    console.error('❌ Error listening to user friends:', error);
  });
};

// Remove friend
export const removeFriend = async (
  currentUserId: string,
  friendId: string
): Promise<void> => {
  try {
    // Remove from both users' friends lists
    await updateDoc(doc(db, 'users', currentUserId), {
      friends: arrayRemove(friendId),
      updatedAt: serverTimestamp(),
    });

    await updateDoc(doc(db, 'users', friendId), {
      friends: arrayRemove(currentUserId),
      updatedAt: serverTimestamp(),
    });

    console.log('✅ Friend removed:', friendId);
  } catch (error) {
    console.error('❌ Failed to remove friend:', error);
    throw new Error('Failed to remove friend');
  }
};