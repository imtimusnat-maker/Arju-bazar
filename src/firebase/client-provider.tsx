'use client';

import React, { useMemo, useEffect, type ReactNode } from 'react';
import { FirebaseProvider, useUser } from '@/firebase/provider';
import { initializeFirebase, initiateAnonymousSignIn } from '@/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

const AppSkeletonLoader = () => {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Header />
            <main className="flex-1 flex items-center justify-center">
                 <div className="container mx-auto max-w-screen-xl px-4 py-8">
                    <div className="space-y-8">
                        <div className="relative w-full aspect-[3/1] rounded-lg bg-muted animate-pulse"></div>
                        <div className="flex justify-center">
                            <div className="h-8 w-1/3 bg-muted rounded-md animate-pulse"></div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="relative aspect-square bg-muted rounded-lg animate-pulse"></div>
                                    <div className="h-4 bg-muted rounded-md w-3/4 mx-auto animate-pulse"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                 </div>
            </main>
            <Footer />
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


export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    return initializeFirebase();
  }, []);

  useEffect(() => {
    const auth = getAuth(firebaseServices.firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // If no user is logged in (after initial check), sign them in anonymously.
      if (!user) {
        initiateAnonymousSignIn(auth);
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
