import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ViewChild } from '@angular/core';
import { Calendar } from '@fullcalendar/core';

@Component({
  selector: 'app-planner-component',
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './planner.html',
  styleUrl: './planner.css',
})
export class PlannerComponent implements OnInit {
  // calendarOptions: CalendarOptions = {
  //   initialView: 'dayGridMonth',
  //   plugins: [dayGridPlugin]
  // };
  calendarOptions: CalendarOptions = {
    // 1. Incluye los plugins que deseas usar
    plugins: [dayGridPlugin],
    // 2. Define la vista inicial (ej. 'dayGridMonth' para vista de mes)
    initialView: 'dayGridMonth',
    // 4. Configura el manejo de clics (opcional, para interacción)
    dateClick: this.handleDateClick.bind(this), // Usar .bind(this) para mantener el contexto
    navLinks: true,
    navLinkDayClick: function (date, jsEvent) {
      console.log('day', date.toISOString());
    },
  };
  ngOnInit(): void {}

  handleDateClick(arg: any) {
    alert('Fecha clickeada: ' + arg.dateStr);
    // Aquí puedes implementar lógica como abrir un modal
  }
}
