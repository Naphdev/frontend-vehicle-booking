import { BaseModel } from "./base.model";

export interface Vehicle extends BaseModel  {
  id: string;
  brand: string;
  model: string;
  licensePlate: string;
  type: string; // ประเภทรถ
  status: VehicleStatus;
  color?: string; // สีสำหรับแสดงใน calendar
}
// สถานะ (ว่าง / ใช้งาน / ซ่อม)
export enum VehicleStatus {
  Available = 'available',
  InUse = 'in-use',
  Maintenance = 'maintenance'
}
