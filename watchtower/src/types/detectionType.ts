export default interface detectionObject {
  className: string;
  score: number;
  bbox: number[];
  id: number;
  time: string;
}

export interface detectionObjectOptional {
  name?: string;
  score?: number;
  bbox?: number[];
  id?: number;
  time?: string;
}
