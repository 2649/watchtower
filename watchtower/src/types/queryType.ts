export default interface queryOject {
  cameraNames: string[];
  start: string;
  end: string;
  objects: string[];
  highlighted: boolean;
  score: number;
}

export interface queryOjectOptional {
  cameraNames?: string[];
  start?: string;
  end?: string;
  objects?: string[];
  highlighted?: boolean;
  score?: number;
}
