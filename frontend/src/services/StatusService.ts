import {
  addDoc,
  collection,
  DocumentSnapshot,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  QuerySnapshot,
  serverTimestamp,
  startAfter,
  Unsubscribe,
  where
} from 'firebase/firestore';
import { auth, db } from '../db/config';

import { CreateStatusRequest, StatusDocument, StatusType } from '../types';

export interface StatusQueryOptions {
  orderDirection?: 'asc' | 'desc';
  limitCount?: number;
  sentMessageQuery?: boolean,
  receivedMessageQuery?: boolean,
  startAfterDoc?: DocumentSnapshot | null ;
  filterByUser?: string;
  filterBySession?: string;
}

export interface StatusWithId extends StatusDocument {
  id: string;
}

export class StatusService {

  private static readonly COLLECTION_NAME = 'statuses';
  
  /**
   * Create a new status document in Firestore
   * @param statusData - The status data to create
   * @returns Promise<string | null> - Document ID if successful, null if failed
   */
  static async createStatus(statusData: CreateStatusRequest): Promise<string> {
    try {
      // Get current user
      
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Validate required fields
      if (!statusData.statusType) {
        throw new Error('Status type is required');
      }

      // Validate that either toUserId or sessionId is provided
      if (!statusData.toUserId && !statusData.sessionId) {
        throw new Error('Either toUserId or sessionId must be provided');
      }
      if(statusData.toUserId){
        const realToUserId = this.getUserIdByEmail(statusData.toUserId);
        console.log(realToUserId);
      }

        
      // Prepare the document data
      const statusDocument: Omit<StatusDocument, 'id'> = {
        fromUserId: currentUser.uid,
        statusType: statusData.statusType,
        timestamp: new Date(), // Will be converted to Firestore Timestamp
        ...(statusData.toUserId && { toUserId: statusData.toUserId }),
        ...(statusData.sessionId && { sessionId: statusData.sessionId }),
        ...(statusData.messageText && { messageText: statusData.messageText }),
        ...(statusData.coords && { coords: statusData.coords }),
      };

      console.log('Creating status document:', statusDocument);
      
      // Add document to Firestore
      const docRef = await addDoc(
        collection(db, this.COLLECTION_NAME), 
        {
          ...statusDocument,
          timestamp: serverTimestamp(),
        }
      );

      console.log('Status document created with ID:', docRef.id);
      return docRef.id;

    } catch (error) {
      console.error('Error creating status:', error);
      throw error;
    }
  }

  /**
   * Helper method to validate status type
   * @param statusType - The status type to validate
   * @returns boolean - True if valid
   */
  static isValidStatusType(statusType: string): statusType is StatusType {
    const validTypes: StatusType[] = [
        'arriving', 
        '5-min-left',
        'arrived'
    ];
    return validTypes.includes(statusType as StatusType);
  }

  /**
   * Get current user's UID
   * @returns string | null - Current user UID or null if not authenticated
   */
  static async getUserIdByEmail(email: string): Promise<string | null> {
    try {
      // Assuming you have a 'users' collection with email field
      const userQuery = query(
        collection(db, 'users'), // Make sure this collection exists
        where('user_email', '==', email), // Make sure this field name is correct
        limit(1)
      );
      
      const querySnapshot = await getDocs(userQuery);
      
      if (querySnapshot.empty) {
        console.log('No user found with email:', email);
        return null;
      }
      
      const userDoc = querySnapshot.docs[0];
      // Return the document ID (which should be the UID) or a uid field
      const userData = userDoc.data();
      
      return userData.userId || null; // or userDoc.data().uid if stored as a field
      
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }


  static subscribeToStatuses(
    callback: (statuses: StatusWithId[]) => void,
    options: StatusQueryOptions = {}
  ): Unsubscribe {
    try {
      const {
        orderDirection = 'desc',
        limitCount = 50,
        filterByUser,
        filterBySession,
        sentMessageQuery,
        receivedMessageQuery,
      } = options;

      console.log("Helloooooo",filterByUser);
      
      let statusQuery = query(
        collection(db, this.COLLECTION_NAME), orderBy('timestamp', orderDirection)
      );
      console.log(filterByUser);
      
      if(sentMessageQuery && filterByUser) {
        
        statusQuery = query(statusQuery, where('fromUserId', '==', filterByUser));
      }
      if(receivedMessageQuery && filterByUser) {
        
        statusQuery = query(statusQuery, where('toUserId', '==', filterByUser));
      }
      if(filterBySession){
        statusQuery = query(statusQuery, where('sessionId', '==', filterBySession));
      }

      if(limitCount){
        statusQuery = query(statusQuery, limit(limitCount));
      }
      
      console.log('Setting up real-time listener for statuses...');
      
      const unsubscribe = onSnapshot(
        statusQuery, 
        (snapshot: QuerySnapshot) => {
          const statuses: StatusWithId[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            statuses.push({
              id: doc.id,
              fromUserId: data.fromUserId,
              toUserId: data.toUserId,
              sessionId: data.sessionId,
              statusType: data.statusType as StatusType,
              messageText: data.messageText,
              timestamp: data.timestamp?.toDate() || new Date(),
              coords: data.coords,
            });
          });

          console.log(`Received ${statuses.length} statuses from real-time listener`);
          callback(statuses);
        },
        (error) => {
          console.log('Error in status listener:', error);
        }
      );
      return unsubscribe;
    } catch (error: any){
      console.error('Error setting up status listener:', error);
      throw new Error(error.message || 'Failed to set up status listener');
    }
  }

  // Subscribe to statuses for a specific session (real-time)
  static subscribeToSessionStatuses(
    sessionId: string,
    callback: (statuses: StatusWithId[]) => void,
    orderDirection: 'asc' | 'desc' = 'desc',
    limitCount: number = 20
  ): Unsubscribe {
    return this.subscribeToStatuses(callback, {
      filterBySession: sessionId,
      orderDirection,
      limitCount,
    });
  }

  // Subscribe to statuses from a specific user (real-time)
  static subscribeToUserStatuses(
    userId: string,
    callback: (statuses: StatusWithId[]) => void,
    orderDirection: 'asc' | 'desc' = 'desc',
    limitCount: number = 20, 
    sentMessageQuery?: boolean,
    receivedMessageQuery?: boolean
  ): Unsubscribe {
    return this.subscribeToStatuses(callback, {
      filterByUser: userId,
      orderDirection,
      limitCount,
      sentMessageQuery,
      receivedMessageQuery,
    });
  }

  // Paginated fetch (for loading more data)
  static async fetchStatusesPaginated(
    options: StatusQueryOptions = {}
  ): Promise<{ statuses: StatusWithId[]; lastDoc: DocumentSnapshot | null }> {
    try {
      const {
        orderDirection = 'desc',
        limitCount = 20,
        startAfterDoc,
        filterByUser,
        filterBySession,
      } = options;

      // Build query
      let statusQuery = query(
        collection(db, this.COLLECTION_NAME),
        orderBy('timestamp', orderDirection)
      );

      // Add filters
      if (filterByUser) {
        statusQuery = query(statusQuery, where('fromUserId', '==', filterByUser));
      }

      if (filterBySession) {
        statusQuery = query(statusQuery, where('sessionId', '==', filterBySession));
      }

      // Add pagination
      if (startAfterDoc) {
        statusQuery = query(statusQuery, startAfter(startAfterDoc));
      }

      // Add limit
      statusQuery = query(statusQuery, limit(limitCount));
      
      const snapshot = await getDocs(statusQuery);
      const statuses: StatusWithId[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        statuses.push({
          id: doc.id,
          fromUserId: data.fromUserId,
          toUserId: data.toUserId,
          sessionId: data.sessionId,
          statusType: data.statusType as StatusType,
          messageText: data.messageText,
          timestamp: data.timestamp?.toDate() || new Date(),
          coords: data.coords,
        });
      });

      const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
      
      console.log(`Fetched ${statuses.length} statuses (paginated)`);
      return { statuses, lastDoc };
    } catch (error: any) {
      console.error('Error fetching paginated statuses:', error);
      throw new Error(error.message || 'Failed to fetch statuses');
    }
  }




}