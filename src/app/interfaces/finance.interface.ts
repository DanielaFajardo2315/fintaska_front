export interface Finance {
  _id?: string;
  type: 'ingreso' | 'gasto' | 'deuda' | 'ahorro';
  amount: number;
  paymentMethod: 'efectivo' | 'cuenta ahorros' | 'cuenta nomina' | 'credito';
  category: 'hogar' | 'alimentación' | 'emprendimiento' | 'transporte' | 
            'salud' | 'educación' | 'ocio y entretenimiento' | 
            'cuidado personal' | 'compras' | 'otros';
  description: string;
  scheduleAt?: Date;
  date?: Date;
  status?: 'pendiente' | 'completado';
  user: string;
  
}
