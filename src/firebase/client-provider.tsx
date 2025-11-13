'use client';

import React, { useMemo, useEffect, type ReactNode } from 'react';
import { FirebaseProvider, useUser } from '@/firebase/provider';
import { initializeFirebase, initiateAnonymousSignIn } from '@/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Logo } from '@/components/logo';

const AppSkeletonLoader = () => {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background">
             <div className="animate-pulse flex flex-col items-center gap-4">
                <Logo />
             </div>
        </div>
    );
};

function AuthGate({ children }: { children: ReactNode }) {
  const { isUserLoading } = useUser();

  if (isUserLoading) {
    return <AppSkeletonLoader />;
  }

  return <>{children}</>;
}


export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const firebaseServices = useMemo(() => {
    return initializeFirebase();
  }, []);

  useEffect(() => {
    const auth = getAuth(firebaseServices.firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // If no user is logged in (after initial check), sign them in anonymously.
      if (!user) {
        await initiateAnonymousSignIn(auth);
      }
    });

    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, [firebaseServices.firebaseApp]);

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      <AuthGate>{children}</AuthGate>
    </FirebaseProvider>
  );
}
