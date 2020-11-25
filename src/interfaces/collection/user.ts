export interface IUser {
  _id?: any;
  name?: string;
  email?: string;
  password?: string;
  type?: string;
  phone?: string;
  services?: string[];
  nota: number;
}

export enum userType {
  usuario = "USER",
  empresa = "BUSINESS",
}
