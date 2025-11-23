import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService } from '../../services/finance.service';
import { LoginService } from '../../services/login';
import { Finance } from '../../interfaces/finance.interface';


interface FinanceSummary {
  ingresos: number;
  gastos: number;
  deudas: number;
  ahorros: number;
}

// interface DecodedToken {
//   id: string;
//   email: string;
//   admin: boolean;
// }

@Component({
  selector: 'app-finances',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './finances.html',
  styleUrl: './finances.css'
})
export class Finances implements OnInit {
  // Servicios inyectados
  private _financeService = inject(FinanceService);
  private _loginService = inject(LoginService);

  // SIGNALS - ESTADO REACTIVO

    // Usuario autenticado
  userId = signal<string>('');

  // Datos financieros
  summary = signal<FinanceSummary>({
    ingresos: 0,
    gastos: 0,
    deudas: 0,
    ahorros: 0
  });
  
  finances = signal<Finance[]>([]);
  filteredFinances = signal<Finance[]>([]);

  // Estado de UI
  isLoading = signal<boolean>(false);
  showNewFinanceForm = signal<boolean>(false);
  showFullTable = signal<boolean>(false);
  showSearchModal = signal<boolean>(false);
  // showCategoriesModal = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  // Filtros
  filterType = signal<string>('todos');
  filterCategory = signal<string>('todos');
  searchText = signal<string>('');

  // FORMULARIO
 
  newFinance: Finance = {
    type: 'ingreso',
    amount: 0,
    paymentMethod: 'efectivo',
    category: 'otros',
    description: '',
    user: '',
    status: 'completado'
  };

  // VALORES CALCULADOS (Se calculan automáticamente)

  balance = computed(() => {
    const s = this.summary();
    return s.ingresos - s.gastos - s.deudas;
  });

  hasFinances = computed(() => this.finances().length > 0);

  // CICLO DE VIDA
 
  ngOnInit(): void {
    this.getUserIdFromToken();
    // this.loadFinances();
    // this.loadSummary();
    //Solo carga si hay userId
    if (this.userId()) {
      this.loadFinances();
    }
  }

  // ==========================================
  // AUTENTICACIÓN
  
  getUserIdFromToken(): void {
   const userId = this._loginService.infoUser();
    
    if (userId) {
      this.userId.set(userId);
      this.newFinance.user = userId;
      console.log('✅ Usuario autenticado:', userId);
    } else {
      console.warn('⚠️ No hay usuario autenticado');
      this.errorMessage.set('Sesión inválida. Por favor inicia sesión nuevamente.');
      setTimeout(() => this._loginService.logout(), 2000);
    }
  }

 
  // CARGAR DATOS DEL BACKEND
  
  loadFinances(): void {
    this.isLoading.set(true);
    const userId = this.userId();
    console.log('🔄 Cargando finanzas del usuario:', userId);

    this._financeService.getFinancesByUser(userId).subscribe({
      next: (response: any) => {
        console.log('📊 Movimientos recibidos:', response);

        //Guardar movimientos
        const movements = response.financialMove || [];
        this.finances.set(movements);
        this.filteredFinances.set([...movements]);

        //Cargar resumen del back
        if (response.summary) {
          this.summary.set(response.summary);
          console.log('📊 Resumen actualizado:', response.summary);
        }
        this.isLoading.set(false);
    }, 
      error: (error:any) => {
        console.error('❌ Error al cargar movimientos:', error);
        this.errorMessage.set('Error al cargar tus movimientos financieros');
        this.isLoading.set(false);
        setTimeout(() => this.errorMessage.set(''), 3000);
      }
    });
  }

  // loadSummary(): void {
  //   // Intentar obtener resumen del backend
  //   this._financeService.getFinancialSummary().subscribe({
  //     next: (response: any) => {
  //       this.calculateSummaryFromLocal();
  //     },
  //     error: (error) => {
  //       console.error('⚠️ Error al cargar resumen, calculando localmente:', error);
  //       this.calculateSummaryFromLocal();
  //     }
  //   });
  // }

  // calculateSummaryFromLocal(): void {
  //   const allFinances = this.finances();
    
  //   const summary = {
  //     ingresos: allFinances
  //       .filter(f => f.type === 'ingreso')
  //       .reduce((sum, f) => sum + f.amount, 0),
      
  //     gastos: allFinances
  //       .filter(f => f.type === 'gasto')
  //       .reduce((sum, f) => sum + f.amount, 0),
      
  //     deudas: allFinances
  //       .filter(f => f.type === 'deuda')
  //       .reduce((sum, f) => sum + f.amount, 0),
      
  //     ahorros: allFinances
  //       .filter(f => f.type === 'ahorro')
  //       .reduce((sum, f) => sum + f.amount, 0)
  //   };

  //   this.summary.set(summary);
  //   console.log('💰 Resumen calculado:', summary);
  // }

  // ==========================================
  // CRUD - CREAR
  // ==========================================
  createFinance(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading.set(true);
    console.log('📤 Creando movimiento:', this.newFinance);

    this._financeService.postFinance(this.newFinance).subscribe({
      next: (response: any) => {
        console.log('✅ Movimiento creado:', response);
        this.successMessage.set(response.message || '¡Movimiento guardado exitosamente!');
        
        // Recargar datos
        this.loadFinances();
        // this.loadSummary();
        
        // Limpiar y cerrar formulario
        this.resetForm();
        this.showNewFinanceForm.set(false);
        
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        console.error('❌ Error al crear movimiento:', error);
        this.errorMessage.set(
          error.error?.mensaje || 'Error al guardar el movimiento. Intenta nuevamente.'
        );
        this.isLoading.set(false);
        setTimeout(() => this.errorMessage.set(''), 3000);
      }
    });
  }

  
  // CRUD - ELIMINAR
  deleteFinance(id: string): void {
    if (!confirm('¿Estás seguro de eliminar este movimiento?')) {
      return;
    }

    console.log('🗑️ Eliminando movimiento:', id);

    this._financeService.deleteFinance(id).subscribe({
      next: (response: any) => {
        console.log('✅ Movimiento eliminado:', response);
        this.successMessage.set('Movimiento eliminado exitosamente');
        
        // Recargar datos
        this.loadFinances();
        // this.loadSummary();
        
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        console.error('❌ Error al eliminar:', error);
        this.errorMessage.set(
          error.error?.mensaje || 'Error al eliminar el movimiento'
        );
        setTimeout(() => this.errorMessage.set(''), 3000);
      }
    });
  }

  // ==========================================
  // FILTROS
  applyFilters(): void {
    const type = this.filterType();
    const category = this.filterCategory();
    const search = this.searchText().toLowerCase();

    const filtered = this.finances().filter(finance => {
      const matchType = type === 'todos' || finance.type === type;
      const matchCategory = category === 'todos' || finance.category === category;
      const matchSearch = !search || finance.description.toLowerCase().includes(search);

      return matchType && matchCategory && matchSearch;
    });

    this.filteredFinances.set(filtered);
    console.log('🔍 Filtros aplicados. Resultados:', filtered.length);
  }

  clearFilters(): void {
    this.filterType.set('todos');
    this.filterCategory.set('todos');
    this.searchText.set('');
    this.filteredFinances.set([...this.finances()]);
    console.log('🔄 Filtros limpiados');
  }

  updateFilterType(value: string): void {
    this.filterType.set(value);
    this.applyFilters();
  }

  updateFilterCategory(value: string): void {
    this.filterCategory.set(value);
    this.applyFilters();
  }

  updateSearchText(value: string): void {
    this.searchText.set(value);
    this.applyFilters();
  }

  
  // VALIDACIÓN
    validateForm(): boolean {
    // Validar monto
    if (this.newFinance.amount <= 0) {
      this.errorMessage.set('El monto debe ser mayor a 0');
      setTimeout(() => this.errorMessage.set(''), 3000);
      return false;
    }

    // Validar descripción
    if (!this.newFinance.description || !this.newFinance.description.trim()) {
      this.errorMessage.set('La descripción es requerida');
      setTimeout(() => this.errorMessage.set(''), 3000);
      return false;
    }

    // Validar usuario
    if (!this.newFinance.user) {
      this.errorMessage.set('Error: Usuario no identificado');
      setTimeout(() => this.errorMessage.set(''), 3000);
      return false;
    }

    return true;
  }

  resetForm(): void {
    this.newFinance = {
      type: 'ingreso',
      amount: 0,
      paymentMethod: 'efectivo',
      category: 'otros',
      description: '',
      user: this.userId(),
      status: 'completado'
    };
    this.errorMessage.set('');
    console.log('🔄 Formulario reseteado');
  }

  // ==========================================
  // UI - TOGGLES
  // ==========================================
  toggleNewFinanceForm(): void {
    this.showNewFinanceForm.update(val => !val);
    if (this.showNewFinanceForm()) {
      this.resetForm();
    }
  }

  toggleFullTable(): void {
    this.showFullTable.update(val => !val);
    if (this.showFullTable()) {
      this.clearFilters();
    }
  }

  toggleSearchModal(): void {
    this.showSearchModal.update(val => !val);
  }

  // toggleCategoriesModal(): void {
  //   this.showCategoriesModal.update(val => !val);
  // }

  // ==========================================
  // UTILIDADES
  // ==========================================
  
  // Obtener últimos 3 movimientos para la tabla pequeña
  getRecentMovements(): Finance[] {
    return this.finances().slice(0, 3);
  }

  // Formatear moneda colombiana
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  }

  // Clase CSS según el tipo de movimiento
  getAmountClass(type: string): string {
    return type === 'ingreso' || type === 'ahorro' 
      ? 'amount-positive' 
      : 'amount-negative';
  }

  // Clase para las filas de la tabla
  getTypeClass(type: string): string {
    const classes: {[key: string]: string} = {
      'ingreso': 'type-ingreso',
      'gasto': 'type-gasto',
      'deuda': 'type-deuda',
      'ahorro': 'type-ahorro'
    };
    return classes[type] || '';
  }
}