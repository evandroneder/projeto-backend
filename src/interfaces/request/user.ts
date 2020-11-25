import { ObjectId } from "mongodb";

export interface IRequestUpdateUser {
  _id: ObjectId;
  name: string;
  email: string;
  password?: string;
}

export interface IRegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  type: string;
  services?: string[];
}
