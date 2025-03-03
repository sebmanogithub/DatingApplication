import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { User } from '../models/user';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PresenceService {
  hubUrl = environment.hubUrl;
  private hubConnection?: HubConnection;
  private onlineUsersSource = new BehaviorSubject<string[]>([]);
  onlineUser$ = this.onlineUsersSource.asObservable();

  constructor(private toastr: ToastrService,
    private router: Router
  ) { }

  createHubConnection(user: User) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'presence', {
        accessTokenFactory: () => user.token
      })
      .withAutomaticReconnect()
      .build();

      this.hubConnection
        .start()
        .catch(error => console.log(error));

      this.hubConnection.on('UserIsOnline', username => {
        this.onlineUser$.pipe(take(1)).subscribe(users => {
          this.onlineUsersSource.next([...users, username])
        })
      });

      this.hubConnection.on('UserIsOffline', username => {
        this.onlineUser$.pipe(take(1)).subscribe(users => {
          this.onlineUsersSource.next([...users.filter(x => x !== username)])
        })
      });

      this.hubConnection.on('GetOnlineUsers', (usernames: string[]) => {
        this.onlineUsersSource.next(usernames);
      });

      this.hubConnection.on('NewMessageReceived', ({username, knownAs}) => {
        this.toastr.info(knownAs + ' has sent you a new message!  Click me to see it')
          .onTap
          .pipe(take(1))
          .subscribe(() => 
            this.router.navigateByUrl('/members/' + username + '?tab=Messages'))
      })
  }

  stopHubConnection() {
        this.hubConnection!.stop().catch(error => console.log(error))
  }
}
