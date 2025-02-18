import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AccountService } from '../_services/account.service';
import { ToastrService } from 'ngx-toastr';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  @Output() cancelRegister = new EventEmitter();
  model: any = {};
  registerForm: FormGroup = new FormGroup({});

  constructor(
    private accountService : AccountService,
    private toaster : ToastrService,
    private fb : FormBuilder) { }

  ngOnInit(): void {
    this.iniatilizeForm();
  }

  iniatilizeForm(){
    this.registerForm = this.fb.group({
      gender: ['male'],
      username: ['',Validators.required],
      knownAs: ['',Validators.required],
      dateOfBirth: ['',Validators.required],
      city: ['',Validators.required],
      country: ['',Validators.required],
      password: ['', [Validators.required, 
                        Validators.minLength(4), Validators.maxLength(8)]],
      confirmPassword: ['', [Validators.required, this.matchValues('password')]]
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

  get usernameControl(): FormControl {
    return this.registerForm.controls["username"] as FormControl;
  }

  get confirmPasswordControl(): FormControl {
    return this.registerForm.controls["confirmPassword"] as FormControl;
  }

  get passwordControl(): FormControl {
    return this.registerForm.controls["password"] as FormControl;
  }

  get knownAsControl(): FormControl {
    return this.registerForm.controls["knownAs"] as FormControl;
  }

  get dateOfBirthControl(): FormControl {
    return this.registerForm.controls["dateOfBirth"] as FormControl;
  }

  get cityControl(): FormControl {
    return this.registerForm.controls["city"] as FormControl;
  }

  get countryControl(): FormControl {
    return this.registerForm.controls["country"] as FormControl;
  }
}
