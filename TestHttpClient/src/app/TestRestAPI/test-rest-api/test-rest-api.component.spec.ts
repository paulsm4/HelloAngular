import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestRestAPIComponent } from './test-rest-api.component';

describe('TestRestAPIComponent', () => {
  let component: TestRestAPIComponent;
  let fixture: ComponentFixture<TestRestAPIComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestRestAPIComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestRestAPIComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
