import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { AccountService } from 'src/app/_services/account.service';
import { MembersService } from 'src/app/_services/members.service';
import { Member } from 'src/app/models/members';
import { Pagination } from 'src/app/models/pagination';
import { User } from 'src/app/models/user';
import { UserParams } from 'src/app/models/userParams';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css']
})
export class MemberListComponent implements OnInit {
  members: Member[] = [];
  pagination!: Pagination;
  userParam!: UserParams;
  user!: User;

  constructor(private memberService : MembersService,
    private accountService: AccountService
  ) { 
    this.accountService.currentUser$.pipe(take(1)).subscribe( user => {
      this.user = user;
      this.userParam = new UserParams(user);
    })
  }

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers() {
    this.memberService.getMembers(this.userParam)
      .subscribe({
        next: response => {
          if (response.result && response.pagination) {
            this.members = response.result;
            this.pagination = response.pagination;
          }
        }
      });
  }

  pageChanged(event: any) {
    if (this.userParam.pageNumber !== event.page) {
      this.userParam.pageNumber = event.page;
      this.loadMembers();
    }
  }
}
