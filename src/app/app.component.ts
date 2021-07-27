import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import * as bootstrap from "bootstrap";
import { dataset } from 'src/dataset/dataset';
import { contries } from 'src/dataset/countries';
import { Proof } from 'src/models/proof.model';
import { Record } from 'src/models/record.model';
import { Chart, registerables } from 'chart.js';
import Plotly from 'plotly.js-dist';

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
  SwimTimeChart: Chart;
  BikeTimeChart: Chart;
  RunTimeChart: Chart;

  constructor(
    private formBuilder: FormBuilder,
  ) {
    Chart.register(...registerables);
  }


  public get proofsName(): string[] {
    return this._dataset.map(subset => subset?.name);
  }

  public get timeIndicator(): string[] {
    const timeValues = this.currentDataset?.dataset?.map(record => record.totalTime)?.filter(record => record < 7200);
    const avg = (timeValues.reduce((a, b) => a + b, 0) / timeValues.length) || 0;
    return [
      this.secondToTime(Math.min(...timeValues)),
      this.secondToTime(avg),
      this.secondToTime(Math.max(...timeValues))
    ]
  }


  public get top10(): Proof {
    return this.currentDataset.dataset.slice(0, 10);
  }

  public get championInfo(): Record {
    return this.top10[0] as Record;
  }

  ngOnInit(): void {
    this.createForm();
    this._dataset = this.createDataset();
    this.currentDataset = this._dataset[0];
    this._countries = contries;
  }

  ngAfterViewInit(): void {
    new bootstrap.Modal(document.getElementById('modalForm')).toggle()
    this.configureGraphs();
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      name: [null, Validators.required],
      age: [null],
      sex: [null, Validators.required],
      country: [null],
      swim: [null, Validators.required],
      t1: [null, Validators.required],
      bike: [null, Validators.required],
      t2: [null, Validators.required],
      run: [null, Validators.required],
      totalTime: [null],
    })
  }

  private createDataset(): Proof {
    const _dataset = dataset?.map((subset) => {
      return {
        name: subset?.name,
        dataset: subset?.dataset.map(record => new Record().deserialize(record)).sort((a, b) => (a.totalTime - b.totalTime))
      }
    });
    return _dataset.sort((a, b) => ('' + b.name).localeCompare(a.name));
  }

  private configureGraphs(): void {
    this.makeBarGraphs();
    this.makeScatterGraphs();
    this.makeKmeansGraph();
  }

  private makeBarGraphs(): void {
    const swimData = this.currentDataset?.dataset?.map(record => record?.swim);
    const bikeData = this.currentDataset?.dataset?.map(record => record?.bike);
    const runData = this.currentDataset?.dataset?.map(record => record?.run);
    this.SwimTimeChart = this.createBarChart(
      'histoSwimChart',
      ['Until 12min', 'Between 12 and 13min', 'Between 13 and 14min', 'Between 14 and 15min', 'After 15min'],
      this.countBetween(swimData, [720, 780, 840, 900])
    );
    this.BikeTimeChart = this.createBarChart(
      'histoBikeChart',
      ['Until 29min', 'Between 29 and 31min', 'Between 31 and 35min', 'Between 35 and 38min', 'After 38min'],
      this.countBetween(bikeData, [1740, 1860, 2100, 2280])
    );
    this.RunTimeChart = this.createBarChart(
      'histoRunChart',
      ['Until 15min30', 'Between 15min30 and 18min', 'Between 18 and 21min', 'Between 21 and 30min', 'After 30min'],
      this.countBetween(runData, [930, 1080, 1260, 1800])
    );
  }

  private createBarChart(chartName: string, _labels: string[], _values: number[], _tooltips?): Chart {
    // colocar cor como parametro de entrada e mudar de acordo com o usuário inserido
    const ctx = document.getElementById(chartName) as unknown as HTMLCanvasElement;
    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels: _labels,
        datasets: [{
          label: 'Numb. Athletes',
          data: _values,
          backgroundColor: 'rgba(138, 99, 69, 1)',
          borderWidth: 3,
          borderColor: 'rgba(138, 99, 69, 1)',
          hoverBackgroundColor: 'rgba(178, 141, 104, 0.9)'
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          },
          x: {
            offset: true,
            display: false
          }
        }
      }
    });
  }

  private countBetween(input: number[], values: number[]): number[] {
    return [
      input?.filter(value => value < values[0]).length,
      input?.filter(value => value >= values[0] && value <= values[1]).length,
      input?.filter(value => value >= values[1] && value <= values[2]).length,
      input?.filter(value => value >= values[2] && value <= values[3]).length,
      input?.filter(value => value > values[3]).length
    ]
  }

  private makeScatterGraphs(): void { }

  private makeKmeansGraph(): void { }

  public secondToTime(time: number): string {
    return new Date(time * 1000).toISOString().substr(11, 8);
  }

  public changeSelection(value: string): void {
    this.currentDataset = this._dataset.filter(subset => subset.name == value)[0];
    // Insert user data inside currentDataset here
  }

  public submit(): void {
    // Insert user data inside currentDataset here
  }

}
