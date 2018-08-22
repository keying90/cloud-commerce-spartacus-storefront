import { ActivatedRoute } from '@angular/router';
import { TestBed, ComponentFixture, async } from '@angular/core/testing';
import { combineReducers, Store, StoreModule } from '@ngrx/store';

import * as fromStore from './../../store';
import * as fromAuthStore from './../../../auth/store';
import { LoginComponent } from './login.component';
import { MaterialModule } from '../../../material.module';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PageType } from '../../../routing/models/page-context.model';
import { MatDialog } from '@angular/material';
import { UserToken } from './../../../auth/models/token-types.model';
import * as fromRouting from '../../../routing/store';

const mockUserToken: UserToken = {
  access_token: 'xxx',
  token_type: 'bearer',
  refresh_token: 'xxx',
  expires_in: 1000,
  scope: ['xxx'],
  userId: 'xxx'
};

const cntx = { id: 'testPageId', type: PageType.CONTENT_PAGE };

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let store: Store<fromStore.UserState>;
  let dialog: MatDialog;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        BrowserAnimationsModule,
        FormsModule,
        StoreModule.forRoot({
          ...fromStore.getReducers(),
          user: combineReducers(fromStore.getReducers()),
          auth: combineReducers(fromAuthStore.getReducers())
        })
      ],
      declarations: [LoginComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              firstChild: {
                routeConfig: {
                  canActivate: [{ GUARD_NAME: 'AuthGuard' }]
                }
              }
            }
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    store = TestBed.get(Store);

    dialog = TestBed.get(MatDialog);
    spyOn(store, 'dispatch').and.callThrough();
    spyOn(dialog, 'open').and.callThrough();
  });

  it('should be created', () => {
    const routerState = {
      state: {
        context: cntx
      }
    };

    const spy = spyOn(store, 'select');
    spy.and.returnValue(of(routerState));

    expect(component).toBeTruthy();
  });

  it('should logout and clear user state', () => {
    const spy = spyOn(store, 'select');
    spy.and.returnValue(of({}));

    component.logout();
    expect(component.isLogin).toEqual(false);
    expect(store.dispatch).toHaveBeenCalledWith(new fromAuthStore.Logout());
    expect(store.dispatch).toHaveBeenCalledWith(
      new fromRouting.Go({
        path: ['/login']
      })
    );
  });

  it('should load user details when token exists', () => {
    spyOn(store, 'select').and.returnValue(of(mockUserToken));

    component.ngOnInit();

    expect(store.dispatch).toHaveBeenCalledWith(
      new fromStore.LoadUserDetails(mockUserToken.userId)
    );
    expect(store.dispatch).toHaveBeenCalledWith(new fromAuthStore.Login());
    component.isLogin = true;
  });
  // Add some UI unit tests once we remove material
});
