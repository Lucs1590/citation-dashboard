import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import * as bootstrap from "bootstrap";
import { dataset } from 'src/dataset/dataset';
import { contries } from 'src/dataset/countries';
import { Proof } from 'src/models/proof.model';
import { Record } from 'src/models/record.model';
import { Chart, registerables } from 'chart.js';
import * as clustering from 'density-clustering';

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
  SwimScatterChart: Chart;
  BikeScatterChart: Chart;
  RunScatterChart: Chart;
  KmeansChart: Chart;

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
      this.countBetween(swimData, [720, 780, 840, 900]),
      ['rgba(241,32,18,1)', 'rgba(241,32,18,0.85)']
    );
    this.BikeTimeChart = this.createBarChart(
      'histoBikeChart',
      ['Until 29min', 'Between 29 and 31min', 'Between 31 and 35min', 'Between 35 and 38min', 'After 38min'],
      this.countBetween(bikeData, [1740, 1860, 2100, 2280]),
      ['rgba(255,106,0,1)', 'rgba(255,106,0,0.85)']
    );
    this.RunTimeChart = this.createBarChart(
      'histoRunChart',
      ['Until 15min30', 'Between 15min30 and 18min', 'Between 18 and 21min', 'Between 21 and 30min', 'After 30min'],
      this.countBetween(runData, [930, 1080, 1260, 1800]),
      ['rgba(255,159,0,1)', 'rgba(255,159,0,0.85)']
    );
  }

  private createBarChart(chartName: string, _labels: string[], _values: number[], colors: string[]): Chart {
    // colocar cor como parametro de entrada e mudar de acordo com o usuário inserido
    const ctx = document.getElementById(chartName) as unknown as HTMLCanvasElement;
    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels: _labels,
        datasets: [{
          label: 'Numb. Athletes',
          data: _values,
          backgroundColor: colors[0],
          borderWidth: 3,
          borderColor: colors[0],
          hoverBackgroundColor: colors[1]
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

  private makeScatterGraphs(): void {
    this.SwimScatterChart = this.createScatterChart(
      'totalSwimChart',
      this.generateXYObj(this.currentDataset.dataset, ['totalTime', 'swim'], true),
      ['rgba(241,32,18,1)', 'rgba(241,32,18,0.85)']
    );
    this.BikeScatterChart = this.createScatterChart(
      'totalBikeChart',
      this.generateXYObj(this.currentDataset.dataset, ['totalTime', 'bike'], true),
      ['rgba(255,106,0,1)', 'rgba(255,106,0,0.85)']
    );
    this.RunScatterChart = this.createScatterChart(
      'totalRunChart',
      this.generateXYObj(this.currentDataset.dataset, ['totalTime', 'run'], true),
      ['rgba(255,159,0,1)', 'rgba(255,159,0,0.85)']
    );
  }

  private createScatterChart(chartName: string, _values: { x: number; y: number }[], colors: string[]): Chart {
    const ctx = document.getElementById(chartName) as unknown as HTMLCanvasElement;
    return new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Total x Modality Time',
          data: _values,
          backgroundColor: colors[0],
          borderWidth: 2,
          borderColor: colors[0],
          hoverBackgroundColor: colors[1]
        }]
      },
      options: {
        scales: {
          x: {
            offset: true,
            type: 'linear',
            position: 'bottom'
          }
        }
      }
    });
  }

  private generateXYObj(dataset: Record[], fieldName: string[], removeOutlier?: boolean): { x: number; y: number }[] {
    if (removeOutlier === true) {
      return dataset
        .filter(record => record[fieldName[0]] < 7200)
        .map(record => {
          return { x: record[fieldName[0]], y: record[fieldName[1]] };
        });
    }
    return dataset
      .map(record => {
        return { x: record[fieldName[0]], y: record[fieldName[1]] };
      });
  }

  private makeKmeansGraph(): void {
    const dataset = this.generateXYObj(this.currentDataset.dataset, ['totalTime', 'bike'], false)
      .map(record => Object.values(record));

    const kmeans = new clustering.KMEANS();
    const clusters = kmeans.run(dataset, 5).map(indexList => {
      return indexList.map(index => {
        return { x: dataset[index][0], y: dataset[index][1] };
      });
    });

    this.KmeansChart = this.createKmeansChart(
      'kmeansChart',
      clusters,
      ['rgba(241,32,18,1)', 'rgba(202,0,0,1)', 'rgba(255,106,0,1)', 'rgba(255,159,0,1)', 'rgba(153,153,153,1)'],
      ['rgba(241,32,18,0.85)', 'rgba(202,0,0,0.85)', 'rgba(255,106,0,0.85)', 'rgba(255,159,0,0.85)', 'rgba(153,153,153,0.85)']
    );
  }

  private createKmeansChart(chartName: string, _values: { x: number; y: number }[][], colors1: string[], colors2: string[]): Chart {
    const ctx = document.getElementById(chartName) as unknown as HTMLCanvasElement;
    return new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Group 1',
          data: _values[0],
          backgroundColor: colors1[0],
          borderWidth: 2,
          borderColor: colors1[0],
          hoverBackgroundColor: colors2[0]
        }, {
          label: 'Group 2',
          data: _values[1],
          backgroundColor: colors1[1],
          borderWidth: 2,
          borderColor: colors1[1],
          hoverBackgroundColor: colors2[1]
        }, {
          label: 'Group 3',
          data: _values[2],
          backgroundColor: colors1[2],
          borderWidth: 2,
          borderColor: colors1[2],
          hoverBackgroundColor: colors2[2]
        }, {
          label: 'Group 4',
          data: _values[3],
          backgroundColor: colors1[3],
          borderWidth: 2,
          borderColor: colors1[3],
          hoverBackgroundColor: colors2[3]
        }, {
          label: 'Group 5',
          data: _values[4],
          backgroundColor: colors1[4],
          borderWidth: 2,
          borderColor: colors1[4],
          hoverBackgroundColor: colors2[4]
        },
        ]
      },
      options: {
        scales: {
          x: {
            offset: true,
            type: 'linear',
            position: 'bottom'
          }
        }
      }
    });
  }

  private clearGraphs(): void {
    this.SwimTimeChart?.destroy();
    this.BikeTimeChart?.destroy();
    this.RunTimeChart?.destroy();
    this.SwimScatterChart?.destroy();
    this.BikeScatterChart?.destroy();
    this.RunScatterChart?.destroy();
    this.KmeansChart?.destroy();
  }

  public secondToTime(time: number): string {
    return new Date(time * 1000).toISOString().substr(11, 8);
  }

  public upDownDiff(startPosition: number, endPosition: number): string {
    const result = endPosition - startPosition;
    if (result > 0) {
      return `&#9660; ${Math.abs(result)}`;
    } else if (result < 0) {
      return `&#9650; ${Math.abs(result)}`;
    } else {
      return `&#8212;`;
    }
  }

  public changeSelection(value: string): void {
    this.currentDataset = this._dataset.filter(subset => subset.name == value)[0];
    // Insert user data inside currentDataset here
    this.clearGraphs();
    this.configureGraphs();
  }

  public submit(): void {
    // Insert user data inside currentDataset here
  }

}
