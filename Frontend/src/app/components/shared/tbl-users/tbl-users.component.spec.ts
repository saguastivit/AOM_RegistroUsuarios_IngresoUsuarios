import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TblUsersComponent } from './tbl-users.component';

describe('TblUsersComponent', () => {
  let component: TblUsersComponent;
  let fixture: ComponentFixture<TblUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TblUsersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TblUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
