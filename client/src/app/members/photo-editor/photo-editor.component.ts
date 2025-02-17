import { Component, Input, OnInit } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { take } from 'rxjs/operators';
import { AccountService } from 'src/app/_services/account.service';
import { Member } from 'src/app/models/members';
import { User } from 'src/app/models/user';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-photo-editor',
  templateUrl: './photo-editor.component.html',
  styleUrls: ['./photo-editor.component.css']
})
export class PhotoEditorComponent implements OnInit {
  @Input() member?: Member;
  uploader: FileUploader = new FileUploader({});
  hasBaseDropzoneOver = false;
  baseUrl = environment.apiUrl;
  user?: User;

  constructor(private accountService: AccountService) {
    this.accountService.currentUser$.pipe(take(1)).
      subscribe(user => this.user = user);
   }

  ngOnInit(): void {
    this.initializeUploader();
  }

  fileOverBase(event: any){
    this.hasBaseDropzoneOver = event;
  }

  initializeUploader() {
    this.uploader.setOptions({
      url: this.baseUrl + 'users/add-photo',
      authToken: 'Bearer ' + this.user?.token,
      isHTML5 : true,
      allowedFileType: ['image'],
      removeAfterUpload: false,
      autoUpload: false,
      maxFileSize: 10 * 1024 * 1024
    })

    this.uploader.onAfterAddingAll = (file) => {
      file.withCredentials = false
    }

    this.uploader.onSuccessItem = (item, response, status, headers) => {
      if (response) {
        const photo = JSON.parse(response);
        this.member?.photos.push(photo);
      }
    }
  }

}
