import { Component, OnInit } from '@angular/core';
import { MembersService } from 'src/app/_services/members.service';
import { Member } from 'src/app/models/members';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css']
})
export class MemberListComponent implements OnInit {
  members: Member[] = [];

  constructor(private memberService : MembersService) { }

  ngOnInit(): void {
    console.log("init");
    this.loadMembers();
  }

  loadMembers() {
    this.memberService.getMembers().subscribe(members => {
      this.members = members;
    });
  }
}
