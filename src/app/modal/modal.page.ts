import { ModalController } from '@ionic/angular';
import { Component, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.page.html',
  styleUrls: ['./modal.page.scss'],
})

export class ModalPage implements OnInit {
  Categories=['Personnel','Travail','Nature','Voiture']
  constructor(private modalController:ModalController) { }
@Output() Categorie:string;
  ngOnInit() {

  }
  selectCATEGORIE(Categorie):void {
    console.log(this.Categorie);
    this.modalController.dismiss(Categorie);
  }

}
