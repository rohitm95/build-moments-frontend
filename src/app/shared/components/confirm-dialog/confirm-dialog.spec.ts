import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDialog, ConfirmDialogData } from './confirm-dialog';
import { ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('ConfirmDialog', () => {
  let component: ConfirmDialog;
  let fixture: ComponentFixture<ConfirmDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inject MAT_DIALOG_DATA correctly', () => {
    const testData: ConfirmDialogData = {
      title: 'Delete Item',
      message: 'Are you sure?',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    };
    TestBed.overrideComponent(ConfirmDialog, {
      set: { providers: [{ provide: MAT_DIALOG_DATA, useValue: testData }] }
    });
    fixture = TestBed.createComponent(ConfirmDialog);
    component = fixture.componentInstance;
    
    expect(component.data).toEqual(testData);
  });

  it('should handle optional confirm and cancel text', () => {
    const testData: ConfirmDialogData = {
      title: 'Confirm',
      message: 'Proceed?'
    };
    TestBed.overrideComponent(ConfirmDialog, {
      set: { providers: [{ provide: MAT_DIALOG_DATA, useValue: testData }] }
    });
    fixture = TestBed.createComponent(ConfirmDialog);
    component = fixture.componentInstance;
    
    expect(component.data.confirmText).toBeUndefined();
    expect(component.data.cancelText).toBeUndefined();
  });

  it('should inject MatDialogRef correctly', () => {
    expect(component.dialogRef).toBeTruthy();
    expect(component.dialogRef).toBeInstanceOf(MatDialogRef);
  });

  it('should use OnPush change detection', () => {
    const metadata = (ConfirmDialog as any)['ɵcmp'];
    expect(metadata.changeDetection).toBe(ChangeDetectionStrategy.OnPush);
  });
});
