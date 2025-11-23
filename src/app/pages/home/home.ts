import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { BoardNote } from '../../components/board-note/board-note';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FinanceService } from '../../services/finance.service';
import { PlannerComponent } from '../../components/planner/planner';
// ----------------------------------------------------
import { FormsModule } from '@angular/forms';
import { LoginService } from '../../services/login';
import { Finance } from '../../interfaces/finance.interface';
import Swal from 'sweetalert2';

interface FinanceSummary {
  ingresos: number;
  gastos: number;
  deudas: number;
  ahorros: number;
}

interface DecodedToken {
  id: string;
  email: string;
  admin: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [BoardNote, RouterLink, CommonModule, RouterModule, PlannerComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private _financeService = inject(FinanceService);
  private _loginService = inject(LoginService);

  // DATOS FINANCIEROS - MISMO FORMATO QUE EN FINANCES
  summary = signal<FinanceSummary>({
    ingresos: 0,
    gastos: 0,
    deudas: 0,
    ahorros: 0,
  });

  // -----------------------------------------------------------------------------------------
  // ------------------------------- TRAER LA INFO COMO EN FINANCES --------------------------
  // -----------------------------------------------------------------------------------------

  // SIGNALS - ESTADO REACTIVO

  // Usuario autenticado
  userId = signal<string>('');

  finances = signal<Finance[]>([]);
  filteredFinances = signal<Finance[]>([]);
  errorMessage = signal<string>('');

  // Estado de UI
  isLoading = signal<boolean>(false);

  // VALORES CALCULADOS (Se calculan automáticamente)

  balance = computed(() => {
    const s = this.summary();
    return s.ingresos - s.gastos - s.deudas;
  });

  hasFinances = computed(() => this.finances().length > 0);

  newFinance: Finance = {
    type: 'ingreso',
    amount: 0,
    paymentMethod: 'efectivo',
    category: 'otros',
    description: '',
    user: '',
    status: 'completado',
  };

  // CICLO DE VIDA

  ngOnInit(): void {
    this.getUserIdFromToken();
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
      console.log('Usuario autenticado:', userId);
    } else {
      console.warn('No hay usuario autenticado');
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
      error: (error: any) => {
        console.error('Error al cargar movimientos:', error);
        this.errorMessage.set('Error al cargar tus movimientos financieros');
        this.isLoading.set(false);
        setTimeout(() => this.errorMessage.set(''), 3000);
      },
    });
  }

  // Formatear moneda colombiana
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  // Clase CSS según el tipo de movimiento
  getAmountClass(type: string): string {
    return type === 'ingreso' || type === 'ahorro' ? 'amount-positive' : 'amount-negative';
  }
}

// INTERFACE (MISMA QUE EN FINANCE.COMPONENT)
interface FinanceSummary {
  ingresos: number;
  gastos: number;
  deudas: number;
  ahorros: number;
}
