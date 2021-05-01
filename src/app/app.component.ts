import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.createForm();
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      tag: ['', Validators.required],
      author: [''],
      startYear: [''],
      endYear: [''],
      public: true
    })
  }

  submit() {
    // aqui você pode implementar a logica para fazer seu formulário salvar
    console.log(this.form.value);
  }

}
