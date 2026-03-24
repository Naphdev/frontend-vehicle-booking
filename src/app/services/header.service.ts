import { Injectable } from "@angular/core";
import { HttpHeaders } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class HeaderService {

  BuildRequestHeaders() {
    return new HttpHeaders({
      "Content-Type": "application/json"
    });
  }

}