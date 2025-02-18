import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AccountService } from '../_services/account.service';
import { ToastrService } from 'ngx-toastr';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  @Output() cancelRegister = new EventEmitter();
  model: any = {};
  registerForm!: FormGroup;

  constructor(
    private accountService : AccountService,
    private toaster : ToastrService) { }

  ngOnInit(): void {
    this.iniatilizeForm();
  }

  iniatilizeForm(){
    this.registerForm = new FormGroup({
      username: new FormControl('',Validators.required),
      password: new FormControl('', [Validators.required, 
                        Validators.minLength(4), Validators.maxLength(8)]),
      confirmPassword: new FormControl('', [Validators.required, this.matchValues('password')])
    })

    this.registerForm.controls.password?.valueChanges.subscribe(() => {
      this.registerForm.controls.confirmPassword?.updateValueAndValidity();
    })
  }

  matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl) => {
      const parent = control.parent as FormGroup;
      if (!parent) return null; // Sécurité pour éviter des erreurs si `parent` est null
  
      return control.value === parent.controls[matchTo]?.value
        ? null 
        : { isMatching: true };
    };
  }

  register(){
    this.accountService.register(this.model).subscribe(response => {
      console.log(response);
      this.cancel();
    }, error =>{
      console.log(error);
      this.toaster.error(error.error);
    })
  }

  cancel(){
    this.cancelRegister.emit(false);
  }
}
