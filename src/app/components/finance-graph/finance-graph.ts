import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule, BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

interface FinanceSummary {
  ingresos: number;
  gastos: number;
  deudas: number;
  ahorros: number;
}

interface CategoryDistribution {
  category: string;
  amount: number;
}

@Component({
  selector: 'app-finance-graph',
  imports: [CommonModule, NgChartsModule],
  templateUrl: './finance-graph.html',
  styleUrl: './finance-graph.css',
})
export class FinanceGraph {
   // INPUTS desde el componente padre
  @Input() summary: FinanceSummary = {
    ingresos: 0,
    gastos: 0,
    deudas: 0,
    ahorros: 0
  };
  @Input() categoryDistribution: CategoryDistribution[] = [];
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() showTitle: boolean = true;

  // Método para obtener variables CSS
  private getCSSVar(varName: string): string {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim();
  } 
  // Colores desde variables CSS globales
  private get COLORS() {
    return {
      ingresos: this.getCSSVar('--color-verde'),
      gastos: this.getCSSVar('--color-rosa-enca'),
      deudas: this.getCSSVar('--color-lila'),
      ahorros: this.getCSSVar('--color-azul'),
      categories: [
        this.getCSSVar('--home-color'),
        this.getCSSVar('--finance-color'),
        this.getCSSVar('--tablero-color'),
        this.getCSSVar('--planner-color'),
        this.getCSSVar('--color-durazno'),
        this.getCSSVar('--color-lila'),
        this.getCSSVar('--color-azul'),
        this.getCSSVar('--color-lila-enca'),
        this.getCSSVar('--color-amarillo'),
        this.getCSSVar('--color-rosa')
      ]
    };
  }


  // GRÁFICO 1: Ingresos vs Gastos (Pie)
  pieChartData = computed<ChartConfiguration<'pie'>['data']>(() => ({
    labels: ['Ingresos', 'Gastos'],
    datasets: [{
      data: [this.summary.ingresos, this.summary.gastos],
      backgroundColor: [this.COLORS.ingresos, this.COLORS.gastos],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  }));

  pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          font: { size: 12, family: 'Poppins' }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed as number;
            return `${context.label}: ${this.formatCurrency(value)}`;
          }
        }
      }
    }
  };
  // GRÁFICO 2: Distribución de Gastos (Doughnut)
  doughnutChartData = computed<ChartConfiguration<'doughnut'>['data']>(() => ({
    labels: this.categoryDistribution.map(c => this.capitalize(c.category)),
    datasets: [{
      data: this.categoryDistribution.map(c => c.amount),
      backgroundColor: this.COLORS.categories,
      borderWidth: 2,
      borderColor: '#fff'
    }]
  }));

  doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: {
          font: { size: 11, family: 'Poppins' },
          boxWidth: 15
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed as number;
            const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${this.formatCurrency(value)} (${percentage}%)`;
          }
        }
      }
    }
  };

  // Formatear moneda
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  }

  // Capitalizar primera letra
  private capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  // Clases dinámicas según tamaño
  getContainerClass(): string {
    const sizes = {
      small: 'chart-container-small',
      medium: 'chart-container-medium',
      large: 'chart-container-large'
    };
    return sizes[this.size];
  }

}
