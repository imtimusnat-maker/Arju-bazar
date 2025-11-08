'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  linkWithCredential,
  EmailAuthProvider,
  type User,
  type AuthCredential,
  type UserCredential,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { getSdks } from '@/firebase';

/**
 * Creates an email/password credential for linking.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {AuthCredential} - The credential object.
 */
function getAuthCredential(email: string, password: string): AuthCredential {
    return EmailAuthProvider.credential(email, password);
}

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance);
}

/** 
 * Creates a user profile document in Firestore.
 */
export async function createFirestoreUser(uid: string, data: { email: string | null; phone: string; name: string; address: string; }) {
    const { firestore } = getSdks(getAuth().app);
    const userRef = doc(firestore, 'users', uid);
    // This is now an awaited operation
    await setDoc(userRef, {
        id: uid,
        ...data
    }, { merge: true });
}


/** 
 * Handles user sign-up, linking with an anonymous account if one exists,
 * and creating the Firestore document.
 * Returns the UserCredential on success.
 */
export async function initiateEmailSignUp(authInstance: Auth, email: string, password: string, phone: string): Promise<UserCredential | void> {
  const currentUser = authInstance.currentUser;

  const handleUserCreation = async (user: User) => {
    // Awaits the creation of the firestore document
    await createFirestoreUser(user.uid, {
        email: user.email,
        phone: phone,
        name: '', // Other fields are collected later
        address: '',
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
