import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MembersService } from 'src/app/_services/members.service';
import { Member } from 'src/app/models/members';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit {
  member?: Member

  constructor(private memberService: MembersService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers() {
    this.memberService.getMember(this.route.snapshot.paramMap.get('username')!)
    .subscribe(member => {
      this.member = member
    })
  }
}
