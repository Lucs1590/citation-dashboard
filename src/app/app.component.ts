import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import * as bootstrap from "bootstrap";
import { dataset } from 'src/dataset/dataset';
import { Proof } from 'src/models/proof.model';
import { Record } from 'src/models/record.model';

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
    this.createDataset();
  }

  ngAfterViewInit(): void {
    new bootstrap.Modal(document.getElementById('modalForm')).toggle()
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      name: [null, Validators.required],
      age: [null],
      sex: [null, Validators.required],
      country: [null],
      swim: ['', Validators.required],
      t1: ['', Validators.required],
      bike: ['', Validators.required],
      t2: ['', Validators.required],
      run: ['', Validators.required],
      totalTime: [''],
    })
  }

  private createDataset(): Proof {
    const _dataset = dataset?.map((subset) => {
      return {
        name: subset?.name,
        dataset: subset?.dataset.map(record => new Record().deserialize(record))
      }
    });
    return _dataset;
  }

  public submit() {
    /* let scholar = require('google-scholar');
    scholar.search(this.form.value.tag).then(resultsObj => {
      this.tagResult2 = resultsObj;
    }); */
  }

}
