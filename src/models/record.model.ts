import { Deserializable } from "./deserializable.model";

export class Record implements Deserializable {
  public name?: string;
  public sex?: string;
  public country?: string;
  public startPosition?: number;
  public endPosition?: string;
  public swim?: string;
  public t1?: string;
  public bike?: string;
  public t2?: string;
  public run?: string;
  public totalTime?: string;
  public program?: string;

  deserialize(input: any): this {
    this.name = input['ATHLETE FIRST'] + ' ' + input['ATHLETE LAST'];
    this.program = input['PROGRAM'];
    this.sex = RegExp('\w*Men\w*').exec(this.program) ? 'Male' : 'Female';
    this.country = input['NATIONALITY'];
    this.startPosition = input['START NUMBER'];
    this.endPosition = input['POSITION'];
    this.swim = input['SWIM'];
    this.t1 = input['T1'];
    this.bike = input['T2'];
    this.t2 = input['T2'];
    this.run = input['RUN'];
    this.totalTime = input['TOTAL TIME'];
    return this;
  }
}
