import { Component } from '@angular/core';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { Photo, PhotoService } from '../photo.service';
@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  Categories=['Personnel','Travail','Nature','Voiture']
  Categorie
  constructor(public photoService: PhotoService, public actionSheetController: ActionSheetController,private modal:ModalController) {

  }
  
  async ngOnInit() {
  
    await this.photoService.loadSaved();
  }
  public async show(photo: Photo, position: number) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Photos',
      buttons: [{
        text: 'Supprimer',
        role: 'destructive',
        icon: 'trash',
        handler: () => {
          this.photoService.deletePicture(photo, position);
        }
      }, {
        text: 'Annuler',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          // Nothing to do, action sheet is automatically closed
         }
      }]
    });
    await actionSheet.present();
  }

}
