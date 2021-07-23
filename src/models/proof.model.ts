import { Deserializable } from "./deserializable.model";
import { Record } from "./record.model";

export class Proof implements Deserializable {
  public name?: string;
  public dataset?: Array<Record>;


  deserialize(input: any): this {
    this.dataset = input?.map(record => new Record().deserialize(record));
    return Object.assign(this, input);
  }
}
