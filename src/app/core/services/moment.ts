import { Injectable, inject } from '@angular/core';
import { Storage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';
import { Firestore, collection, addDoc, serverTimestamp } from '@angular/fire/firestore';
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
  private storage = inject(Storage);
  private firestore = inject(Firestore);

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
}
