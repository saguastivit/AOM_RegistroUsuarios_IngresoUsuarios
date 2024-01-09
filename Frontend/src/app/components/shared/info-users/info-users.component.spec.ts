import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoUsersComponent } from './info-users.component';

describe('InfoUsersComponent', () => {
  let component: InfoUsersComponent;
  let fixture: ComponentFixture<InfoUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InfoUsersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
