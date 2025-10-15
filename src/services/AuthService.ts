import { auth} from "../db/config";

import { signInAnonymously } from "firebase/auth";

export class AuthService {
    static async signInAnonymously() {
        await signInAnonymously(auth).then((data) => {
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
}