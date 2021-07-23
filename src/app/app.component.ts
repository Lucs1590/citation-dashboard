import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import * as bootstrap from "bootstrap";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.createForm();
  }

  ngAfterViewInit(): void {
    new bootstrap.Modal(document.getElementById('modalForm')).toggle()
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      age: [null],
      sex: [null],
      country: [''],
      swim: [''],
      t1: [''],
      bike: [''],
      t2: [''],
      run: [''],
      position: [0],
      totalTime: [''],
      program: ['']
    })
  }

  submit() {
    /* let scholar = require('google-scholar');
    scholar.search(this.form.value.tag).then(resultsObj => {
      this.tagResult2 = resultsObj;
    }); */
  }

}
