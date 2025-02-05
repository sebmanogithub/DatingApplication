import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { User } from '../models/user';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  baseUrl = 'https://localhost:5001/api/';
  //Un ReplaySubject conserve une ou plusieurs valeurs dans le temps 
  // et les rejoue pour les abonnés.
  // Usage : Permet de stocker et de diffuser l'état actuel de l'utilisateur
  // connecté à travers l'application.
  private currentUserSource = new ReplaySubject<User>(1);
  //Rend les données de currentUserSource accessibles aux composants ou services 
  //abonnés. Le $ indique que c'est un Observable
  currentUser$ = this.currentUserSource.asObservable();
  constructor(private http: HttpClient) { }

  // pipe : Permet de chaîner des opérateurs RxJS pour traiter les données de la réponse.
  // map : Transforme la réponse de l'API avant qu'elle ne soit transmise à l'abonné.
  login(model: any) {
    return this.http.post<User>(this.baseUrl + 'account/login', model).pipe(
      map((response: User) => {
        const user = response;
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          //L'utilisateur est émis via le ReplaySubject 
          // permettant aux abonnés de recevoir ces informations.
          this.currentUserSource.next(user);
        }
      })
    )
  }

  setCurrentUser(user: User){
    this.currentUserSource.next(user);
  }

  logout() {
    localStorage.removeItem('user');
    this.currentUserSource.next({} as User);
  }
}
