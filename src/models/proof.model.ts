import { Record } from "./record.model";

export type Proof = Array<{ name?: string; dataset?: Array<Record>; }>;
