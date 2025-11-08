export interface Task {
  _id?: string;
  title: string;
  description?: string;
  estatus?: 'pendiente' | 'en progreso' | 'realizada';
  category?: 'hogar' | 'personal' | 'trabajo' | 'finanzas' | 'social' | 'otros';
  priority?: 'alta' | 'media' | 'baja' ;
  scheduleAt?: Date; // Usado por el servicio de notificaciones
  creationDate?: Date;
}
