export interface PowerGridStatus {
  sectorId: string;
  sectorName: string;
  consumptionKw: number;
  peakLoadKw: number;
  renewableSharePercentage: number;
}

export interface WasteBinStatus {
  binId: string;
  location: string;
  fillPercentage: number;
  type: 'general' | 'recycling' | 'compost';
}

export interface SustainabilityReport {
  totalCarbonFootprintKg: number;
  totalEnergyConsumptionKw: number;
  recyclingRatePercentage: number;
  waterConsumptionLiters: number;
  powerGrids: PowerGridStatus[];
  wasteBins: WasteBinStatus[];
}
