import { 
  collection, 
  addDoc, 
  doc, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';

import { db, auth } from '../db/config';

import { StatusDocument, CreateStatusRequest, StatusType } from '../types';

export class StatusService {

  private static readonly COLLECTION_NAME = 'statuses';

  /**
   * Create a new status document in Firestore
   * @param statusData - The status data to create
   * @returns Promise<string | null> - Document ID if successful, null if failed
   */
  static async createStatus(statusData: CreateStatusRequest): Promise<string | null> {
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
        collection(db, StatusService.COLLECTION_NAME), 
        {
          ...statusDocument,
          timestamp: serverTimestamp(), // Use server timestamp for consistency
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
  static getCurrentUserId(): string | null {
    return auth.currentUser?.uid || null;
  }
}