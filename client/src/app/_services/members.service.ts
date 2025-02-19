import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Member } from '../models/members';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaginatedResult } from '../models/pagination';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  baseUrl = environment.apiUrl;
  members: Member[] = [];
  paginatedResult: PaginatedResult<Member[]> = new PaginatedResult<Member[]>();

  constructor(private http: HttpClient) { }

  getMembers(page?: number, itemsPerPage?: number) {
    let params = new HttpParams();

    if (page != null && itemsPerPage != null)
    {
      params = params.append('pageNumber', page.toString());
      params = params.append('pageSize', itemsPerPage.toString());
      console.log(params);
    }

    return this.http.get<Member[]>(this.baseUrl + 'users', 
          {observe: 'response', params}).pipe(
      map(response => {
        this.paginatedResult.result = response.body;
        const paginationHeader = response.headers.get('Pagination');
        if (paginationHeader) {
          this.paginatedResult.pagination = JSON.parse(paginationHeader);
        }
        console.log(this.paginatedResult);
        return this.paginatedResult;
      })
    )    
  }

  // getMembers() {
  //   if (this.members.length > 0){
  //     return of(this.members);
  //   }
  //   return this.http.get<Member[]>(this.baseUrl + 'users').pipe(
  //     map(members => {
  //       this.members = members;
  //       return members;
  //     })
  //   )    
  // }

  getMember(username : string) {
    const member = this.members.find(x => x.username === username);
    if (member !== undefined){
      return of(member);
    }  
    return this.http.get<Member>(this.baseUrl + 'users/' + username)
  }

  updateMember(member: Member) {
    return this.http.put(this.baseUrl + 'users', member).pipe(
      map(() => {
        const index = this.members.indexOf(member);
        this.members[index] = member;
      })
    )
  }

  setMainPhoto(photoId: number){
    return this.http.put(this.baseUrl + 'users/set-main-photo/' + photoId, {});
  }

  deletePhoto(photoId: number){
    return this.http.delete(this.baseUrl + 'users/delete-photo/' + photoId, {});
  }
}
