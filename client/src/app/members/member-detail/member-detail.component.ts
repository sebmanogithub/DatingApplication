import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MembersService } from 'src/app/_services/members.service';
import { Member } from 'src/app/models/members';
import { NgxGalleryOptions } from '@kolkov/ngx-gallery';
import { NgxGalleryImage } from '@kolkov/ngx-gallery';
import { NgxGalleryAnimation } from '@kolkov/ngx-gallery';
import { TabDirective, TabsetComponent } from 'ngx-bootstrap/tabs';
import { Message } from 'src/app/models/message';
import { MessageService } from 'src/app/_services/message.service';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit {
  @ViewChild('memberTabs') memberTabs!: TabsetComponent;
  activeTab!: TabDirective;
  messages: Message[] = [];
  member!: Member;
  galleryOptions: NgxGalleryOptions[] = [];
  galleryImages: NgxGalleryImage[] = [];

  constructor(private memberService: MembersService,
    private route: ActivatedRoute,
    private messageService: MessageService) { }

  ngOnInit(): void {
    this.loadMembers();
    this.galleryOptions = [
      {
        width: '500px',
        height: '500px',
        imagePercent: 100,
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide,
        preview: false
      }];
  }

  getImages(): NgxGalleryImage[] {
    const imageUrl = [];
    if (this.member?.photos){
      for (const photo of this.member?.photos)
        {
          imageUrl.push({
            small: photo?.url,
            medium: photo?.url,
            big: photo?.url
          })
        }
    }
    return imageUrl;
  }

  loadMembers() {
    this.memberService.getMember(this.route.snapshot.paramMap.get('username')!)
    .subscribe(member => {
      this.member = member;
      this.galleryImages = this.getImages();
    })
  }

  loadMessages() {
    this.messageService.getMessageThread(this.member.username).subscribe(messages => {
      this.messages = messages;
    })
  }

  onTabActived(data: TabDirective) {
    this.activeTab = data;
    if (this.activeTab.heading === 'Messages'
      && this.messages.length === 0) {
        this.loadMessages();
    }
  }
}
