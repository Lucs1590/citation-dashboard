import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import * as bootstrap from "bootstrap";
import { dataset } from 'src/dataset/dataset';
import { contries } from 'src/dataset/countries';
import { Proof } from 'src/models/proof.model';
import { Record } from 'src/models/record.model';
import { Chart } from 'chart.js';
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
  ) { }


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
    // dividir em 5 grupos
    const swimData = this.currentDataset?.dataset?.map(record => record?.swim)?.filter(record => record < 7200);
    const bikeData = this.currentDataset?.dataset?.map(record => record?.bike)?.filter(record => record < 7200);
    const runData = this.currentDataset?.dataset?.map(record => record?.run)?.filter(record => record < 7200);
    this.SwimTimeChart = this.createBarChart('lineSwimChart', ['de x a y', 'de y a z'], swimData);
    this.BikeTimeChart = this.createBarChart('lineBikeChart', ['de x a y', 'de y a z'], bikeData);
    this.RunTimeChart = this.createBarChart('lineRunChart', ['de x a y', 'de y a z'], runData);
  }

  private createBarChart(chartName: string, _labels: string[], _values: number[], _tooltips?): Chart {
    // colocar cor como parametro de entrada e mudar de acordo com o usuário inserido
    const ctx = document.getElementsByClassName(chartName) as unknown as HTMLCanvasElement;
    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels: _labels,
        datasets: [{
          label: 'Time',
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
        // plugins: {
        //   tooltips: {
        //     enabled: true,
        //     mode: 'single',
        //     callbacks: {
        //       title: (tooltipItems: { label: string; value: string; }[]) => {
        //         tooltipItems[0].value = Number(tooltipItems[0].value).toLocaleString('pt-BR') + ' Kg';
        //         return tooltipItems[0].label;
        //       }
        //     }
        //   }
        // }
      }
    });
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
