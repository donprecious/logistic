import * as mongoose from 'mongoose';

export const OrderSchema = new mongoose.Schema(
  {
    dropoff: {
      address: String,
      city: String,
      country: String,
      email: String,
      name: String,
      zipcode: String,
      phonenumber: String,
    },
    pickup: {
      address: String,
      city: String,
      country: String,
      email: String,
      phonenumber: String,
      zipcode: String,
      name: String,
    },
    packages: [
      {
        height: Number,
        length: Number,
        width: Number,
        weight: Number,
      },
    ],
    current_status: { type: String, default: 'CREATED' },
    delivery_cost: Number,
    status_change_history: [
      {
        from_status: String,
        to_status: String,
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

export const OrderModel = mongoose.model('Order', OrderSchema);
