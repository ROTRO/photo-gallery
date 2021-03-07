import { ModalPage } from './modal/modal.page';
import { Injectable, Input, Output } from '@angular/core';
import { Plugins, CameraResultType, Capacitor, FilesystemDirectory, CameraPhoto, CameraSource } from '@capacitor/core';
import { ModalController, PickerController, Platform } from '@ionic/angular';

const { Camera, Filesystem, Storage } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  public photos: Photo[] = [];
  private PHOTO_STORAGE: string = "photos";
  private platform: Platform;

  constructor(platform: Platform,public modalController: ModalController) {
    this.platform = platform;
   }
   @Input() firstName: string;
   Categorie:string;
   async presentModal() {
    const modal = await this.modalController.create({
      component: ModalPage,
      mode:'ios',
      cssClass: 'my-custom-class'
    
    });
    modal.onDidDismiss()
    .then(async(data)=>{
      this.Categorie= data['data'];
      console.log(this.Categorie);
      this.savedImageFile = await this.savePicture(this.capturedPhoto,this.Categorie);
 
      console.log(this.Categorie);
     
      // Add new photo to Photos array
      console.log(this.Categorie);
      this.photos.unshift(this.savedImageFile);
      console.log(this.Categorie);
      // Cache all photo data for future retrieval
      Storage.set({
        key: this.PHOTO_STORAGE,
        value: JSON.stringify(this.photos),
        
      });
     
    })
    return await modal.present();
  }

  public async loadSaved() {

    // Retrieve cached photo array data
    const photoList = await Storage.get({ key: this.PHOTO_STORAGE });
    this.photos = JSON.parse(photoList.value) || [];
console.log(this.photos.length)
    // If running on the web...
    if (!this.platform.is('hybrid')) {
      // Display the photo by reading into base64 format
      for (let photo of this.photos) {
        // Read each saved photo's data from the Filesystem
        const readFile = await Filesystem.readFile({
            path: photo.filepath,
            directory: FilesystemDirectory.Data
        });
      
        // Web platform only: Load the photo as base64 data
        photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
        console.log(photo.category);
      }
    }
  }
  savedImageFile
  capturedPhoto
  public async addNewToGallery() {
    // Take a photo
  
    this.capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri, // file-based data; provides best performance
      source: CameraSource.Camera, // automatically take a new photo with the camera
      quality: 100 // highest quality (0 to 100)
    });
    await  this.presentModal().finally(async()=>{
      console.log(this.Categorie);
       
    });
   
  }

  // Save picture to file on device
  private async savePicture(cameraPhoto: CameraPhoto,Chosencategory) {
    // Convert photo to base64 format, required by Filesystem API to save
    const base64Data = await this.readAsBase64(cameraPhoto);
    await console.log('here');
    // Write the file to the data directory
    const fileName = new Date().getTime() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: FilesystemDirectory.Data
    });
await console.log('here');
    if (this.platform.is('hybrid')) {
      // Display the new image by rewriting the 'file://' path to HTTP
      // Details: https://ionicframework.com/docs/building/webview#file-protocol
      return {
        filepath: savedFile.uri,
        webviewPath: Capacitor.convertFileSrc(savedFile.uri),
        category:Chosencategory
      };
    }
    else {
      // Use webPath to display the new image instead of base64 since it's 
      // already loaded into memory
      return {
        filepath: fileName,
        webviewPath: cameraPhoto.webPath,
        category:Chosencategory
      };
    }
  }
 
  
  // Read camera photo into base64 format based on the platform the app is running on
  private async readAsBase64(cameraPhoto: CameraPhoto) {
    // "hybrid" will detect Cordova or Capacitor
    await console.log('here');
    if (this.platform.is('hybrid')) {
      // Read the file into base64 format
      const file = await Filesystem.readFile({
        path: cameraPhoto.path
      });

      return file.data;
    }
    else {
      // Fetch the photo, read as a blob, then convert to base64 format
      const response = await fetch(cameraPhoto.webPath!);
      const blob = await response.blob();
      await console.log('here');
      return await this.convertBlobToBase64(blob) as string;  
    }
    
  }

  // Delete picture by removing it from reference data and the filesystem
  public async deletePicture(photo: Photo, position: number) {
    // Remove this photo from the Photos reference data array
    this.photos.splice(position, 1);

    // Update photos array cache by overwriting the existing photo array
    Storage.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos)
    });

    // delete photo file from filesystem
    const filename = photo.filepath.substr(photo.filepath.lastIndexOf('/') + 1);
    await Filesystem.deleteFile({
      path: filename,
      directory: FilesystemDirectory.Data
    });
  }

  convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    console.log('here');
    reader.onerror = reject;
    reader.onload = () => {
        resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

  
}

export interface Photo {
  filepath: string;
  webviewPath: string;
  category:string;
}
