import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class ConfigurationService {

  public Config = {
    // baseApi: "http://localhost:3000/",
    baseApi: "https://vehicle-booking-wcjd.onrender.com/",
    apiVersion: "v1"
  };

}