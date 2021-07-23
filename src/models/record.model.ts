import { Deserializable } from "./deserializable.model";

export class Record implements Deserializable {
  public name?: string;
  public age?: number;
  public sex?: string;
  public country?: string;
  public swim?: string;
  public t1?: string;
  public bike?: string;
  public t2?: string;
  public run?: string;
  public position?: string;
  public totalTime?: string;
  public program?: string;

  deserialize(input: any): this {
    this.name = input['ATHLETE FIRST'] + input['ATHLETE LAST'];
    this.program = input['PROGRAM'];
    return Object.assign(this, input);
  }
}
