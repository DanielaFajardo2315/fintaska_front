import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, DateSelectArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { ViewChild } from '@angular/core';
import { Calendar } from '@fullcalendar/core';
import esLocale from '@fullcalendar/core/locales/es';
import { Task } from '../../interfaces/task.interface';
import { TaskService } from '../../services/task.service';
import { UserService } from '../../services/user';
import { User } from '../../interfaces/user';
import { LoginService } from '../../services/login';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-planner-component',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, RouterOutlet, ReactiveFormsModule],
  templateUrl: './planner.html',
  styleUrl: './planner.css',
})
export class PlannerComponent implements OnInit {
  showNewTask: boolean = false;
  userForm = FormGroup;
  private _taskService = inject(TaskService);
  private _userService = inject(UserService);
  private _loginService = inject(LoginService);
  private _router = inject(Router);
  idUser = this._loginService.infoUser();
  public calendarEvents: EventInput[] = []; //Almacenar los eventos creados en la BD
  selectedDate: DateSelectArg | null = null;

  // Información diligenciada en el formulario de evento
  taskForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    description: new FormControl<string | undefined>(undefined),
    estatus: new FormControl<'pendiente' | 'en progreso' | 'realizada' | undefined>(undefined),
    category: new FormControl<
      'hogar' | 'personal' | 'trabajo' | 'finanzas' | 'social' | 'otros' | undefined
    >(undefined),
    priority: new FormControl<'alta' | 'media' | 'baja' | undefined>(undefined),
    scheduleAt: new FormControl<Date | undefined>(undefined),
  });

  // Información del usuario registrado
  infoUser: User = {
    planner: {
      notifications: [],
      tasks: [],
      board: [],
      finances: [],
    },
    _id: '',
    fullName: '',
    username: '',
    email: '',
    rol: 'usuario',
  };

  // Creación del calendario con opciones
  calendarOptions: CalendarOptions = {
    // Plugins usados
    plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin],
    // Idioma
    locale: esLocale,
    // Vista inicial en mes
    initialView: 'dayGridMonth',
    // Cabecera
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,listWeek',
    },
    selectable: true,
    // Evento al dar click
    eventClick: (eventInfo) => {
      console.log('Click on Event');
    },
    select: this.newTask.bind(this),
    // Configura el manejo de clics (opcional, para interacción)
    navLinks: true,
    // Mostrar eventos
    events: this.calendarEvents,
  };
  ngOnInit(): void {
    this.refreshUserDataAndEvents();
  }

  // Color dependiendo la priorización
  getEventColor(task: Task): string {
    switch (task.estatus) {
      case 'realizada':
        return '#10B981'; // Verde (realizada)
      case 'en progreso':
        return '#F59E0B'; // Ámbar (en progreso)
      case 'pendiente':
        return '#EF4444'; // Rojo (pendiente)
      default:
        return '#3B82F6'; // Azul (por defecto)
    }
  }

  // Cargar las tareas del usuario y transformarlas en formato de FullCalendar
  loadTasks(tasks: Task[]): void {
    console.log(`Cargando ${tasks.length} tareas del usuario`);
    this.calendarEvents = tasks.map((task) => ({
      id: task._id,
      title: task.title,
      start: task.creationDate,
      allDay: true,
      color: this.getEventColor(task),
      extendedProps: {
        description: task.description,
        estatus: task.estatus,
        priority: task.priority,
        category: task.category,
      },
    }));
    this.calendarOptions = {
      ...this.calendarOptions,
      events: this.calendarEvents,
    };
    console.log('Eventos en el calendario del usuario: ', this.calendarEvents);
  }
  refreshUserDataAndEvents(): void {
    if (!this.idUser) {
      console.error('ID de usuario no disponible. No se pueden cargar los datos');
      return;
    }
    this._userService.getUserById(this.idUser).subscribe({
      next: (res: any) => {
        console.log('Datos de usuario por ID cargados: ', res);
        const { password, ...rest } = res.data;
        this.infoUser = { ...rest };
        console.log('User antes de modificar: ', this.infoUser);

        if (this.infoUser.planner && this.infoUser.planner.tasks) {
          const populatedTasks = Array.isArray(this.infoUser.planner.tasks)
            ? (this.infoUser.planner.tasks as Task[])
            : [];
          this.loadTasks(populatedTasks);
        }
      },
      error: (err: any) => {
        console.error('Error al cargar datos de usuario en planeador: ', err);
      },
    });
  }

  // Abrir el modal
  newTask(selectInfo: DateSelectArg): any {
    if (this._router.url === '/'){
      this.showNewTask = false;
    } else {
      this.showNewTask = true;
      this.selectedDate = selectInfo;
    }
  }

  // Cerrar el modal
  closeModal() {
    this.showNewTask = false;
  }

  // Crear evento
  createEvent() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const taskData: Task = {
      _id: '',
      title: this.taskForm.value.title || '',
      description: this.taskForm.value.description || '',
      estatus: this.taskForm.value.estatus || undefined,
      category: this.taskForm.value.category || undefined,
      priority: this.taskForm.value.priority || undefined,
      scheduleAt: this.taskForm.value.scheduleAt || undefined,
      creationDate: this.selectedDate?.start || new Date(),
    };
    console.log('Datos del evento: ', taskData);

    this._taskService.postTask(taskData).subscribe({
      next: (res: any) => {
        console.log('Respuesta completa del servidor:', JSON.stringify(res, null, 2));

        // Asegurarse de que existe el objeto planner y el array de tasks
        if (!this.infoUser.planner) {
          this.infoUser.planner = {
            notifications: [],
            tasks: [],
            board: [],
            finances: [],
          };
        }

        // Obtener el ID de la tarea creada
        let taskId: string | undefined;
        if (typeof res === 'object' && res !== null) {
          taskId =
            res._id || // si el ID está directamente en la respuesta
            res.data?._id;
        }

        if (!taskId) {
          console.error('No se pudo obtener el ID de la tarea creada. Respuesta:', res);
          return;
        }

        // Añadir el ID de la tarea al array de tasks del usuario
        this.infoUser.planner.tasks = [...(this.infoUser.planner.tasks || []), taskId];

        console.log('ID a actualizar:', this.idUser);
        console.log('Datos del usuario a enviar:', this.infoUser);
        // Actualizar el usuario con la nueva tarea
        this._userService.putUser(this.infoUser, this.idUser).subscribe({
          next: (updateRes: any) => {
            console.log('Usuario actualizado con nueva tarea:', updateRes);
            this.closeModal();

            // Limpiar el formulario después de crear
            this.taskForm.reset();

            // TODO: Actualizar calendario con la nueva tarea
            this.refreshUserDataAndEvents();
          },
          error: (updateErr: any) => {
            console.error('Error al actualizar usuario:', updateErr);
          },
        });
        return res;
      },
      error: (err: any) => {
        console.error(err.error.mensaje);
      },
    });
  }
}
