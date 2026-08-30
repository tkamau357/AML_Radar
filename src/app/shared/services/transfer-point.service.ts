import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TransferPointService {

  selected_susbsidiary: string[]; // this will hold the selected subsidiary

  constructor() {

    //initialize the subsidiary as null 
    this.selected_susbsidiary = [""];
   }
}