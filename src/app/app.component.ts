import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import * as bootstrap from "bootstrap";
import { dataset } from 'src/dataset/dataset';
import { contries } from 'src/dataset/countries';
import { Proof } from 'src/models/proof.model';
import { Record } from 'src/models/record.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  form: FormGroup;
  _dataset: Proof;
  _countries: { name: string; code: string; }[];
  currentDataset: { name?: string; dataset?: Record[]; };

  constructor(
    private formBuilder: FormBuilder,
  ) { }


  public get proofsName(): string[] {
    return this._dataset.map(subset => subset?.name);
  }

  ngOnInit(): void {
    this.createForm();
    this._dataset = this.createDataset();
    this.currentDataset = this._dataset[0];
    this._countries = contries;
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
    return _dataset.sort((a, b) => ('' + b.name).localeCompare(a.name));
  }

  public changeSelection(value: string): void {
    this.currentDataset = this._dataset.filter(subset => subset.name == value)[0];
  }

  public submit() {
    /* let scholar = require('google-scholar');
    scholar.search(this.form.value.tag).then(resultsObj => {
      this.tagResult2 = resultsObj;
    }); */
  }

}
