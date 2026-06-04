import { Injectable, inject } from '@angular/core';
import { Storage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';
import { Firestore, collection, addDoc, getDocs, getDoc, query, orderBy, doc, deleteDoc, updateDoc, serverTimestamp } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface UploadResult {
  progress: number;
  downloadUrl?: string;
  error?: any;
}

export interface MomentData {
  title: string;
  tags: string[];
  files: string[];
}

@Injectable({
  providedIn: 'root',
})
export class Moment {
  readonly storage = inject(Storage);
  readonly firestore = inject(Firestore);

  uploadFile(file: File): Observable<UploadResult> {
    return new Observable((observer) => {
      const storageRef = ref(this.storage, `uploads/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      observer.next({ progress: 0 });

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          observer.next({ progress: Math.round(progress) });
        },
        (error) => {
          observer.error(error);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          observer.next({ progress: 100, downloadUrl });
          observer.complete();
        }
      );
    });
  }

  async createMoment(data: MomentData) {
    const momentsRef = collection(this.firestore, 'moments');
    return addDoc(momentsRef, {
      ...data,
      createdAt: serverTimestamp()
    });
  }

  async getMoments() {
    const momentsRef = collection(this.firestore, 'moments');
    const q = query(momentsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data['title'] || '',
        tags: data['tags'] || [],
        files: data['files'] || [],
        createdAt: data['createdAt']
      };
    });
  }

  async getMoment(id: string) {
    const momentDocRef = doc(this.firestore, `moments/${id}`);
    const snapshot = await getDoc(momentDocRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      return {
        id: snapshot.id,
        title: data['title'] || '',
        tags: data['tags'] || [],
        files: data['files'] || [],
        createdAt: data['createdAt']
      };
    }
    return null;
  }

  async updateMoment(id: string, data: MomentData) {
    const momentDocRef = doc(this.firestore, `moments/${id}`);
    return updateDoc(momentDocRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  }

  async deleteMoment(id: string) {
    const momentDocRef = doc(this.firestore, `moments/${id}`);
    return deleteDoc(momentDocRef);
  }

  async updateMomentTags(id: string, tags: string[]) {
    const momentDocRef = doc(this.firestore, `moments/${id}`);
    return updateDoc(momentDocRef, { tags });
  }
}
