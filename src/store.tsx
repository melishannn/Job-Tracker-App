import React, { createContext, useContext, useEffect, useState } from 'react';
import { JobApplication, Reminder, CompanyNote } from './types';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, writeBatch } from 'firebase/firestore';

interface AppState {
  user: User | null;
  applications: JobApplication[];
  reminders: Reminder[];
  companyNotes: CompanyNote[];
  addApplication: (app: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateApplication: (id: string, app: Partial<JobApplication>) => void;
  deleteApplication: (id: string) => void;
  addReminder: (rem: Omit<Reminder, 'id' | 'createdAt'>) => void;
  updateReminder: (id: string, rem: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  addCompanyNote: (note: Omit<CompanyNote, 'id' | 'updatedAt'>) => void;
  updateCompanyNote: (id: string, note: Partial<CompanyNote>) => void;
  deleteCompanyNote: (id: string) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [companyNotes, setCompanyNotes] = useState<CompanyNote[]>([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      
      if (u) {
        // Sync local storage to Firebase if local storage has data
        const localApps = localStorage.getItem('jt_applications');
        const localRems = localStorage.getItem('jt_reminders');
        const localNotes = localStorage.getItem('jt_companyNotes');
        
        let hasLocalData = false;
        const parsedApps = localApps ? JSON.parse(localApps) : [];
        const parsedRems = localRems ? JSON.parse(localRems) : [];
        const parsedNotes = localNotes ? JSON.parse(localNotes) : [];
        
        if (parsedApps.length > 0 || parsedRems.length > 0 || parsedNotes.length > 0) {
          hasLocalData = true;
          try {
            const batch = writeBatch(db);
            parsedApps.forEach((app: any) => {
              const ref = doc(db, `users/${u.uid}/applications`, app.id);
              batch.set(ref, { ...app, userId: u.uid });
            });
            parsedRems.forEach((rem: any) => {
              const ref = doc(db, `users/${u.uid}/reminders`, rem.id);
              batch.set(ref, { ...rem, userId: u.uid });
            });
            parsedNotes.forEach((note: any) => {
              const ref = doc(db, `users/${u.uid}/companyNotes`, note.id);
              batch.set(ref, { ...note, userId: u.uid });
            });
            await batch.commit();
            localStorage.removeItem('jt_applications');
            localStorage.removeItem('jt_reminders');
            localStorage.removeItem('jt_companyNotes');
          } catch (error) {
            console.error("Local data sync failed", error);
            // Non-fatal, just log it.  The user's local data might not have synced.
          }
        }
      } else {
        // Load from local storage
        const savedApps = localStorage.getItem('jt_applications');
        if (savedApps) setApplications(JSON.parse(savedApps));
        const savedRems = localStorage.getItem('jt_reminders');
        if (savedRems) setReminders(JSON.parse(savedRems));
        const savedNotes = localStorage.getItem('jt_companyNotes');
        if (savedNotes) setCompanyNotes(JSON.parse(savedNotes));
      }
      setIsAuthLoaded(true);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubApps = onSnapshot(collection(db, `users/${user.uid}/applications`), (snapshot) => {
      setApplications(snapshot.docs.map(d => d.data() as JobApplication));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/applications`);
    });
    const unsubRems = onSnapshot(collection(db, `users/${user.uid}/reminders`), (snapshot) => {
      setReminders(snapshot.docs.map(d => d.data() as Reminder));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/reminders`);
    });
    const unsubNotes = onSnapshot(collection(db, `users/${user.uid}/companyNotes`), (snapshot) => {
      setCompanyNotes(snapshot.docs.map(d => d.data() as CompanyNote));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/companyNotes`);
    });
    return () => { unsubApps(); unsubRems(); unsubNotes(); };
  }, [user]);

  // Persist to local storage if not logged in
  useEffect(() => {
    if (!user && isAuthLoaded) {
      localStorage.setItem('jt_applications', JSON.stringify(applications));
    }
  }, [applications, user, isAuthLoaded]);
  
  useEffect(() => {
    if (!user && isAuthLoaded) {
      localStorage.setItem('jt_reminders', JSON.stringify(reminders));
    }
  }, [reminders, user, isAuthLoaded]);
  
  useEffect(() => {
    if (!user && isAuthLoaded) {
      localStorage.setItem('jt_companyNotes', JSON.stringify(companyNotes));
    }
  }, [companyNotes, user, isAuthLoaded]);

  // Actions
  const addApplication = async (app: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newApp: JobApplication = {
      ...app,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    if (user) {
      try {
        await setDoc(doc(db, `users/${user.uid}/applications`, newApp.id), { ...newApp, userId: user.uid });
      } catch (err) { handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/applications`); }
    } else {
      setApplications(prev => [...prev, newApp]);
    }
  };

  const updateApplication = async (id: string, app: Partial<JobApplication>) => {
    if (user) {
      const existing = applications.find(a => a.id === id);
      if (!existing) return;
      const updated = { ...existing, ...app, updatedAt: Date.now(), userId: user.uid };
      try {
        await setDoc(doc(db, `users/${user.uid}/applications`, id), updated);
      } catch (err) { handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/applications/${id}`); }
    } else {
      setApplications(prev => prev.map(a => a.id === id ? { ...a, ...app, updatedAt: Date.now() } : a));
    }
  };

  const deleteApplication = async (id: string) => {
    if (user) {
      try {
        await deleteDoc(doc(db, `users/${user.uid}/applications`, id));
      } catch (err) { handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/applications/${id}`); }
    } else {
      setApplications(prev => prev.filter(a => a.id !== id));
    }
  };

  const addReminder = async (rem: Omit<Reminder, 'id' | 'createdAt'>) => {
    const newRem: Reminder = {
      ...rem,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    if (user) {
      try {
        await setDoc(doc(db, `users/${user.uid}/reminders`, newRem.id), { ...newRem, userId: user.uid });
      } catch (err) { handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/reminders`); }
    } else {
      setReminders(prev => [...prev, newRem]);
    }
  };

  const updateReminder = async (id: string, rem: Partial<Reminder>) => {
    if (user) {
      const existing = reminders.find(a => a.id === id);
      if (!existing) return;
      const updated = { ...existing, ...rem, userId: user.uid };
      try {
        await setDoc(doc(db, `users/${user.uid}/reminders`, id), updated);
      } catch (err) { handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/reminders/${id}`); }
    } else {
      setReminders(prev => prev.map(r => r.id === id ? { ...r, ...rem } : r));
    }
  };

  const deleteReminder = async (id: string) => {
    if (user) {
      try {
        await deleteDoc(doc(db, `users/${user.uid}/reminders`, id));
      } catch (err) { handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/reminders/${id}`); }
    } else {
      setReminders(prev => prev.filter(r => r.id !== id));
    }
  };

  const addCompanyNote = async (note: Omit<CompanyNote, 'id' | 'updatedAt'>) => {
    const newNote: CompanyNote = {
      ...note,
      id: crypto.randomUUID(),
      updatedAt: Date.now(),
    };
    if (user) {
      try {
        await setDoc(doc(db, `users/${user.uid}/companyNotes`, newNote.id), { ...newNote, userId: user.uid });
      } catch (err) { handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/companyNotes`); }
    } else {
      setCompanyNotes(prev => [...prev, newNote]);
    }
  };

  const updateCompanyNote = async (id: string, note: Partial<CompanyNote>) => {
    if (user) {
      const existing = companyNotes.find(a => a.id === id);
      if (!existing) return;
      const updated = { ...existing, ...note, updatedAt: Date.now(), userId: user.uid };
      try {
        await setDoc(doc(db, `users/${user.uid}/companyNotes`, id), updated);
      } catch (err) { handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/companyNotes/${id}`); }
    } else {
      setCompanyNotes(prev => prev.map(n => n.id === id ? { ...n, ...note, updatedAt: Date.now() } : n));
    }
  };

  const deleteCompanyNote = async (id: string) => {
    if (user) {
      try {
        await deleteDoc(doc(db, `users/${user.uid}/companyNotes`, id));
      } catch (err) { handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/companyNotes/${id}`); }
    } else {
      setCompanyNotes(prev => prev.filter(n => n.id !== id));
    }
  };

  const value = {
    user,
    applications,
    reminders,
    companyNotes,
    addApplication,
    updateApplication,
    deleteApplication,
    addReminder,
    updateReminder,
    deleteReminder,
    addCompanyNote,
    updateCompanyNote,
    deleteCompanyNote,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
};
