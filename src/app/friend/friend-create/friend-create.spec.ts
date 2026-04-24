import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FriendCreate } from './friend-create';

describe('FriendCreate', () => {
  let component: FriendCreate;
  let fixture: ComponentFixture<FriendCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FriendCreate],
    }).compileComponents();

    fixture = TestBed.createComponent(FriendCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
