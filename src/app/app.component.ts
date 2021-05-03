import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { search } from 'scholarly';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  form: FormGroup;
  tagResult: any;
  tagResult2: any;
  authorgResult: any;

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
    this.tagResult = search(this.form.value.tag);

    const scholar = require('google-scholar')
    scholar.search(this.form.value.tag)
      .then(resultsObj => {
        this.tagResult2 = resultsObj;
      });
  }

}
