import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';
import { AccountService } from 'src/app/_services/account.service';
import { MembersService } from 'src/app/_services/members.service';
import { Member } from 'src/app/models/members';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-member-edit',
  templateUrl: './member-edit.component.html',
  styleUrls: ['./member-edit.component.css']
})
export class MemberEditComponent implements OnInit {
  member?: Member;
  user?: User;

  constructor(private accountService: AccountService,
    private memberService: MembersService) {
    }

   ngOnInit(): void {
    this.accountService.currentUser$.pipe(take(1)).subscribe(user => {
      if (user) {
        this.user = user;
        this.loadMember();
      }
    });
  }

  loadMember() {
    if (!this.user) return; 

    this.memberService.getMember(this.user.username).subscribe(member => {
      this.member = member;
    });
  }

}
