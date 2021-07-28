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
  userData: Record;

  constructor(
    private formBuilder: FormBuilder,
  ) {
    Chart.register(...registerables);
  }


  public get proofsName(): string[] {
    return this._dataset.map(subset => subset?.name);
  }

  public get timeIndicator(): string[] {
    const timeValues = this.currentDataset?.dataset?.map(record => record?.totalTime)?.filter(record => record < 7200);
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


  public get userDataPosition(): number {
    return this.currentDataset?.dataset?.indexOf(this.userData);
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
      sex: [null],
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
        dataset: subset?.dataset.map(record => new Record().deserialize(record)).sort((a, b) => (a?.totalTime - b?.totalTime))
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
      ['rgba(241,32,18,1)', 'rgba(241,32,18,0.85)'],
      'swim'
    );
    this.BikeScatterChart = this.createScatterChart(
      'totalBikeChart',
      this.generateXYObj(this.currentDataset.dataset, ['totalTime', 'bike'], true),
      ['rgba(255,106,0,1)', 'rgba(255,106,0,0.85)'],
      'bike'
    );
    this.RunScatterChart = this.createScatterChart(
      'totalRunChart',
      this.generateXYObj(this.currentDataset.dataset, ['totalTime', 'run'], true),
      ['rgba(255,159,0,1)', 'rgba(255,159,0,0.85)'],
      'run'
    );
  }

  private createScatterChart(chartName: string, _values: { x: number; y: number }[], colors: string[], modality: string): Chart {
    const ctx = document.getElementById(chartName) as unknown as HTMLCanvasElement;
    const _dataset = this.userData?.[modality] ?
      [{
        label: 'My mark',
        data: [{ x: this.userData?.totalTime ?? 7200, y: this.userData?.[modality] ?? 7200 }],
        backgroundColor: 'rgba(153,153,153,1)',
        borderWidth: 2,
        borderColor: 'rgba(153,153,153,1)',
        hoverBackgroundColor: 'rgba(153,153,153,0.85)'
      }, {
        label: 'Total x Modality Time',
        data: _values,
        backgroundColor: colors[0],
        borderWidth: 2,
        borderColor: colors[0],
        hoverBackgroundColor: colors[1]
      }] :
      [{
        label: 'Total x Modality Time',
        data: _values,
        backgroundColor: colors[0],
        borderWidth: 2,
        borderColor: colors[0],
        hoverBackgroundColor: colors[1]
      }];
    return new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: _dataset
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
    this.currentDataset.dataset.push(this.userData);
    this.currentDataset.dataset.map(record => new Record().deserialize(record)).sort((a, b) => (a?.totalTime - b?.totalTime));
    this.clearGraphs();
    this.configureGraphs();
  }

  public submit(): void {
    if (this.form.invalid) {
      alert('Complete the data correctly!');
    } else {
      this.userData = new Record().deserialize({
        "ATHLETE FIRST": this.form.value.name.split(' ')[0],
        "ATHLETE LAST": this.form.value.name.split(' ').slice(1, this.form.value.name.split(' ').length).join(' '),
        "NATIONALITY": this.form.value.country,
        "START NUMBER": Math.floor(Math.random() * this.currentDataset.dataset.length) + 1,
        "SWIM": this.splitTime(this.form.value.swim),
        "T1": this.splitTime(this.form.value.t1),
        "BIKE": this.splitTime(this.form.value.bike),
        "T2": this.splitTime(this.form.value.t2),
        "RUN": this.splitTime(this.form.value.run),
        "TOTAL TIME": this.sumAll(
          this.form.value.swim,
          this.form.value.t1,
          this.form.value.bike,
          this.form.value.t2,
          this.form.value.run,
        ),
        "PROGRAM": "Elite Men"
      });
      console.log(this.userData);
      this.currentDataset.dataset.push(this.userData);
      this.currentDataset.dataset.map(record => new Record().deserialize(record)).sort((a, b) => (a?.totalTime - b?.totalTime));
      this.clearGraphs();
      this.configureGraphs();
    }
  }

  private splitTime(str: string): string {
    str = str.replace(':', '0');
    return [
      [str[0] ?? '0', str[1] ?? '0'].join(''),
      [str[2] ?? '0', str[3] ?? '0'].join(''),
      [str[4] ?? '0', str[5] ?? '0'].join('')
    ].join(':');
  }

  private sumAll(
    swim: string,
    t1: string,
    bike: string,
    t2: string,
    run: string
  ): string {
    return this.secondToTime(
      this.toTimeSecond(this.splitTime(swim)) +
      this.toTimeSecond(this.splitTime(t1)) +
      this.toTimeSecond(this.splitTime(bike)) +
      this.toTimeSecond(this.splitTime(t2)) +
      this.toTimeSecond(this.splitTime(run))
    )
  }

  private toTimeSecond(time: string): number {
    const newTime = String(time).split(':')
    if (newTime.length == 1 || JSON.stringify(newTime) === JSON.stringify(['00', '00', '00'])) {
      return 7200;
    }
    const hour = +newTime[0] * 3600;
    const minute = +newTime[1] * 60;
    const second = +newTime[2];
    return hour + minute + second;
  }
}
