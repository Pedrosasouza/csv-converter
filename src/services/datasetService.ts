import { Dataset } from '../models/dataset';
import { mockDataset } from '../mocks/datasetMock';

export const getDataset = async (): Promise<Dataset> => {
  return mockDataset;
};
