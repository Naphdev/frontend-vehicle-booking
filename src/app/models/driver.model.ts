import { BaseModel } from "./base.model";

export interface Driver extends BaseModel  {
  id: string;
  name: string; // ชื่อคนขับ
  status: DriverStatus;
  qrcodeUrl?: string; // URL ของ QR Code
  lineId?: string;
  phone?: string;
}

export enum DriverStatus {
  Active = 'active',
  Inactive = 'inactive',
  OnLeave = 'on-leave'
}
