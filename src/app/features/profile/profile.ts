import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ImageCropperComponent, ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';
import { Auth, UserProfile } from '../../core/services/auth';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ImageCropperComponent],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  profileForm!: FormGroup;
  currentUserUid: string | null = null;
  profilePicUrl: string | null = null;

  imageChangedEvent: Event | null = null;
  croppedImage: string = '';
  showCropper = false;
  imageToUpload: Blob | null = null;
  isSaving = false;
  isLoading = false;
  errorMessage = '';

  ngOnInit() {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: [''],
      countryCode: [''],
      city: [''],
      email: [{ value: '', disabled: true }],
    });

    this.loadProfile();
  }

  async loadProfile() {
    this.isLoading = true;
    try {
      this.currentUserUid = this.auth.getCurrentUserId();
      if (this.currentUserUid) {
        const profile = await this.auth.getUserProfile(this.currentUserUid);
        if (profile) {
          this.profileForm.patchValue({
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            phone: profile.phone || '',
            countryCode: profile.countryCode || '',
            city: profile.city || '',
            email: profile.email || '',
          });
          this.profilePicUrl = profile.profilePic || null;
        }
      }
    } catch (error: any) {
      this.errorMessage = error.message;
    } finally {
      this.isLoading = false;
    }
  }

  fileChangeEvent(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.imageChangedEvent = event;
      this.showCropper = true;
      this.croppedImage = '';
    }
  }

  imageCropped(event: ImageCroppedEvent) {
    if (event.objectUrl) {
      this.croppedImage = event.objectUrl;
    }
    if (event.blob) {
      this.imageToUpload = event.blob;
    }
  }

  imageLoaded(image: LoadedImage) {
    // show cropper
  }
  cropperReady() {
    // cropper ready
  }
  loadImageFailed() {
    this.errorMessage = 'Failed to load image';
  }

  cancelCrop() {
    this.showCropper = false;
    this.imageChangedEvent = null;
    this.croppedImage = '';
    this.imageToUpload = null;
  }

  confirmCrop() {
    this.showCropper = false;
  }

  async saveProfile() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    
    if (!this.currentUserUid) return;

    this.isSaving = true;
    this.errorMessage = '';

    try {
      let newProfilePicUrl = this.profilePicUrl;

      if (this.imageToUpload) {
        newProfilePicUrl = await this.auth.uploadProfilePicture(this.currentUserUid, this.imageToUpload);
        this.profilePicUrl = newProfilePicUrl;
      }

      const updatedProfile: Partial<UserProfile> = {
        firstName: this.profileForm.get('firstName')?.value,
        lastName: this.profileForm.get('lastName')?.value,
        phone: this.profileForm.get('phone')?.value,
        countryCode: this.profileForm.get('countryCode')?.value,
        city: this.profileForm.get('city')?.value,
      };

      if (newProfilePicUrl) {
        updatedProfile.profilePic = newProfilePicUrl;
      }

      await this.auth.updateUserProfile(this.currentUserUid, updatedProfile);
      this.snackBar.open('Profile updated successfully!', 'Close', { duration: 3000 });
      this.imageToUpload = null; // reset
      this.router.navigate(['/moments']);
    } catch (error: any) {
      this.errorMessage = error.message || 'Error updating profile';
    } finally {
      this.isSaving = false;
    }
  }
}
