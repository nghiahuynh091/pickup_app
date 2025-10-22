import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../db/config";

import {
    createUserWithEmailAndPassword,
    signInAnonymously as firebaseSignInAnonymously,
    signOut as firebaseSignOut,
    signInWithEmailAndPassword,
    updateProfile
} from "firebase/auth";
import { UserDocument } from "../types";

export class AuthService {
    private static readonly COLLECTION_NAME = 'users';
    
    static async signInAnonymously() {
        await firebaseSignInAnonymously(auth).then((data) => {
            // Signed in..
            console.log('Anonymous sign in successful: ', data.user.uid);
            return {
                success: true,
                user: data.user,
                isAnonymous: true,
            };
        }).catch((error) => {

            const errorMessage = error.message;
            console.error('Anonymous sign in failed: ', error);
            throw new Error(errorMessage || 'Anonymous sign in failed');
            
        });
        
    }
    
    static async signInWithEmail(email:string, password:string) {
        return await signInWithEmailAndPassword(auth,email,password); 
    }
    
    static getCollectionName(){
        return this.COLLECTION_NAME;
    }
    
    static async signUpWithEmail(email: string, password: string, name:string) {
        await createUserWithEmailAndPassword(auth, email, password).then(async ()=>
        {   
            const newUser = auth.currentUser;
            if(newUser){
                
                console.log("update the name");
                await updateProfile(newUser, {displayName:name})
                .then(async () => {
                
                    const userDocument: Omit<UserDocument, 'id'> = {
                        userId: newUser.uid,
                        user_email: newUser.email,
                        created_date: new Date(), // Will be converted to Firestore Timestamp
                        ...(newUser.displayName && {user_name: newUser.displayName }),
                    };
                    console.log('Creating user document:', userDocument);
                    const docRef = await addDoc(
                        collection(db, this.COLLECTION_NAME),
                        {
                            ...userDocument,
                            created_date: serverTimestamp(),
                        }
                    );
                    console.log('User document created with ID:', docRef.id);
                } 
                );

            }
        }
        ).catch( (error) => {
            console.error('Error creating user:', error);
            throw error;

        }).finally(async ()=> await this.signOut())
    }
    
    static async signOut(): Promise<void> {
        return await firebaseSignOut(auth);
    }
}