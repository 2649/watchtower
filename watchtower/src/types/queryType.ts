export default interface queryOject {
  camera_names: string[];
  start: string;
  end: string;
  objects: string[];
  highlighted: boolean;
  score: number;
}

export interface queryOjectOptional {
  camera_names?: string[];
  start?: string;
  end?: string;
  objects?: string[];
  highlighted?: boolean;
  score?: number;
}
