'use client';
import {
  Auth, // Import Auth type for type hinting
  getAuth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  linkWithCredential,
  EmailAuthProvider,
  type User,
  type AuthCredential,
  type UserCredential,
} from 'firebase/auth';
import { doc, setDoc, Firestore, serverTimestamp, increment } from 'firebase/firestore'; // Import Firestore type
import { getSdks } from '@/firebase';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';

/**
 * Creates an email/password credential for linking.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {AuthCredential} - The credential object.
 */
function getAuthCredential(email: string, password: string): AuthCredential {
    return EmailAuthProvider.credential(email, password);
}

/** Initiate anonymous sign-in (now blocking). */
export async function initiateAnonymousSignIn(authInstance: Auth): Promise<void> {
  await signInAnonymously(authInstance);
}

/** 
 * Creates a user profile document in Firestore.
 * Now accepts the firestore instance directly.
 */
export function createFirestoreUser(firestore: Firestore, uid: string, data: { email: string | null; phone: string; name: string; address: string; }) {
    const userRef = doc(firestore, 'users', uid);
    // This creates the user document upon signup.
    return setDoc(userRef, {
        id: uid,
        email: data.email,
        name: data.name,
        phone: data.phone,
        address: data.address,
        orderCount: 0,
        totalSpent: 0
    }, { merge: true }).catch(error => {
         errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
                path: userRef.path,
                operation: 'create',
                requestResourceData: data,
            })
        );
        // Re-throw the original error if you need to handle it further up the chain
        throw error;
    });
}


/** 
 * Handles user sign-up, linking with an anonymous account if one exists,
 * and creating the Firestore document.
 * Returns the UserCredential on success.
 */
export async function initiateEmailSignUp(authInstance: Auth, email: string, password: string, phone: string, name: string, address: string): Promise<UserCredential> {
  const currentUser = authInstance.currentUser;
  const { firestore } = getSdks(authInstance.app); // Get firestore instance here

  const handleUserCreation = async (user: User) => {
    // Pass the firestore instance directly
    await createFirestoreUser(firestore, user.uid, {
        email: user.email,
        phone,
        name,
        address,
    });
  };

  if (currentUser && currentUser.isAnonymous) {
    const credential = getAuthCredential(email, password);
    const userCredential = await linkWithCredential(currentUser, credential);
    await handleUserCreation(userCredential.user);
    return userCredential;
  } else {
    const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
    await handleUserCreation(userCredential.user);
    return userCredential;
  }
}


/** 
 * Handles user sign-in. If the user is anonymous, it attempts to link.
 * Otherwise, it performs a standard sign-in.
 * Does not use 'await' to be non-blocking.
 */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  const currentUser = authInstance.currentUser;
  
  if (currentUser && currentUser.isAnonymous) {
    // This scenario is less common for sign-in but is handled for completeness.
    // It attempts to link the anonymous account with the sign-in credentials.
    const credential = getAuthCredential(email, password);
    linkWithCredential(currentUser, credential).catch((error) => {
       // If linking fails (e.g., 'auth/credential-already-in-use'), we fall back to a normal sign-in.
       // This can happen if the user already has an account but started a guest session.
       signInWithEmailAndPassword(authInstance, email, password);
    });
  } else {
    // Standard sign-in for non-anonymous or null users.
    signInWithEmailAndPassword(authInstance, email, password);
  }
}
