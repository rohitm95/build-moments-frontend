import { Injectable, inject, signal } from '@angular/core';
import { Auth as FirebaseAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc, updateDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

export interface UserProfile {
  firstName: string;
  lastName: string;
  phone: string;
  countryCode: string;
  city: string;
  email: string;
  profilePic?: string;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  readonly auth = inject(FirebaseAuth);
  readonly firestore = inject(Firestore);
  readonly storage = inject(Storage);
  currentUserProfile = signal<UserProfile | null>(null);

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async signup(email: string, password: string, profile: UserProfile) {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    const uid = userCredential.user.uid;
    const userDocRef = doc(this.firestore, `users/${uid}`);
    await setDoc(userDocRef, profile);
    return userCredential;
  }

  logout() {
    return this.auth.signOut();
  }

  getCurrentUserId(): string | null {
    return this.auth.currentUser ? this.auth.currentUser.uid : null;
  }

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const userDocRef = doc(this.firestore, `users/${uid}`);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      const profile = docSnap.data() as UserProfile;
      this.currentUserProfile.set(profile);
      return profile;
    }
    return null;
  }

  async updateUserProfile(uid: string, profile: Partial<UserProfile>): Promise<void> {
    const userDocRef = doc(this.firestore, `users/${uid}`);
    await updateDoc(userDocRef, profile);
    // Update the in-memory signal
    const currentProfile = this.currentUserProfile();
    if (currentProfile) {
      this.currentUserProfile.set({ ...currentProfile, ...profile });
    }
  }

  async uploadProfilePicture(uid: string, file: Blob): Promise<string> {
    const storageRef = ref(this.storage, `profile_pictures/${uid}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  }
}
