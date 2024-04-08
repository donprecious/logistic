import { Document } from 'mongoose';

export interface Order extends Document {
  dropoff: {
    address: string;
    city: string;
    country: string;
    email: string;
    name: string;
    zipcode: string;
    phonenumber: string;
  };
  pickup: {
    address: string;
    city: string;
    country: string;
    email: string;
    phonenumber: string;
    zipcode: string;
    name: string;
  };
  packages: Array<{
    height: number;
    length: number;
    width: number;
    weight: number;
  }>;
  current_status: string;
  delivery_cost: number;
  status_change_history: Array<{
    from_status: string;
    to_status: string;
    date: Date;
  }>;
}
