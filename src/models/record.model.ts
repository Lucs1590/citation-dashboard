import { Deserializable } from "./deserializable.model";

export class Record implements Deserializable {
  public name?: string;
  public sex?: string;
  public country?: string;
  public startPosition?: number;
  public endPosition?: number;
  public swim?: number;
  public t1?: number;
  public bike?: number;
  public t2?: number;
  public run?: number;
  public totalTime?: number;
  public program?: string;

  deserialize(input: any): this {
    this.name = input['ATHLETE FIRST'] + ' ' + input['ATHLETE LAST'];
    this.program = input['PROGRAM'];
    this.sex = RegExp('\w*Men\w*').exec(this.program) ? 'Male' : 'Female';
    this.country = input['NATIONALITY'];
    this.startPosition = input['START NUMBER'];
    this.endPosition = isNaN(+input['POSITION']) ? +input['POSITION'] : 150;
    this.swim = toTimeSecond(input['SWIM']);
    this.t1 = toTimeSecond(input['T1']);
    this.bike = toTimeSecond(input['T2']);
    this.t2 = toTimeSecond(input['T2']);
    this.run = toTimeSecond(input['RUN']);
    this.totalTime = toTimeSecond(input['TOTAL TIME']);
    return this;
  }
}

function toTimeSecond(time: string): number {
  const newTime = String(time).split(':')
  if (newTime.length == 1 || newTime == ['00', '00', '00']) {
    return 25200;
  }
  const hour = +newTime[0] * 3600;
  const minute = +newTime[1] * 60;
  const second = +newTime[2];
  return hour + minute + second;
}
