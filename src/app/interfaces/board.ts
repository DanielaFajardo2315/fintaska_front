export interface Board {

 _id: string; // este campo lo añade MongoDB automáticamente
  title: string;
  tag: string[];         // array de etiquetas
  urlFile: string[];     // array de URLs de archivos
  urlImage: string[];    // array de URLs de imágenes
  description?: string;  // opcional si puede no estar
  uploadDate: string;    

}
