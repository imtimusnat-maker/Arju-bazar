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
} from 'firebase/auth';

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
 * Handles user sign-up, linking with an anonymous account if one exists.
 * Does not use 'await' to be non-blocking.
 */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  const currentUser = authInstance.currentUser;

  if (currentUser && currentUser.isAnonymous) {
    // If the user is anonymous, link the new credentials to the existing anonymous account.
    const credential = getAuthCredential(email, password);
    linkWithCredential(currentUser, credential).catch((error) => {
      // Handle errors, e.g., 'auth/credential-already-in-use'
      // The onAuthStateChanged error listener in the component will catch and display this.
    });
  } else {
    // If there's no user or the user is not anonymous, create a new account.
    createUserWithEmailAndPassword(authInstance, email, password);
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
