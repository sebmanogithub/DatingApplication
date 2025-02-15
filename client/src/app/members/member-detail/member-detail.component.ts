import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MembersService } from 'src/app/_services/members.service';
import { Member } from 'src/app/models/members';
import { NgxGalleryOptions } from '@kolkov/ngx-gallery';
import { NgxGalleryImage } from '@kolkov/ngx-gallery';
import { NgxGalleryAnimation } from '@kolkov/ngx-gallery';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit {
  member?: Member;
  galleryOptions: NgxGalleryOptions[] = [];
  galleryImages: NgxGalleryImage[] = [];

  constructor(private memberService: MembersService,
    private route: ActivatedRoute) { }

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
}
