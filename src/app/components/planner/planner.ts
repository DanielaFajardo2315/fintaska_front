import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
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
import Swal from 'sweetalert2';

@Component({
  selector: 'app-planner-component',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, RouterOutlet, ReactiveFormsModule, DatePipe],
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
  selectedTaskForEdit?: Task;

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
    initialView: 'timeGridWeek',
    // Cabecera
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,listWeek',
    },
    selectable: true,
    // Evento al dar click
    eventClick: this.handleEventClick.bind(this),
    select: this.newTask.bind(this),
    // Configura el manejo de clics (opcional, para interacción)
    navLinks: true,
    // Mostrar eventos
    events: this.calendarEvents,
    droppable: true,
    editable: true,
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
  }
  refreshUserDataAndEvents(): void {
    if (!this.idUser) {
      console.error('ID de usuario no disponible. No se pueden cargar los datos');
      return;
    }
    this._userService.getUserById(this.idUser).subscribe({
      next: (res: any) => {
        const { password, ...rest } = res.data;
        this.infoUser = { ...rest };

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
    if (this._router.url === '/') {
      this.showNewTask = false;
    } else {
      this.taskForm.reset();
      this.selectedTaskForEdit = undefined;

      this.showNewTask = true;
      this.selectedDate = selectInfo;
    }
  }

  // Cerrar el modal
  closeModal() {
    this.showNewTask = false;

    this.selectedTaskForEdit = undefined;
    this.selectedDate = null;
    this.taskForm.reset();
  }

  // Crear evento
  createEvent() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    // Datos recibidos en el formulario
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

    this._taskService.postTask(taskData).subscribe({
      next: (res: any) => {
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

        // Actualizar el usuario con la nueva tarea
        this._userService.putUser(this.infoUser, this.idUser).subscribe({
          next: (updateRes: any) => {
            this.closeModal();

            // Limpiar el formulario después de crear
            this.taskForm.reset();

            // TODO: Actualizar calendario con la nueva tarea
            this.refreshUserDataAndEvents();
          },
          error: (updateErr: any) => {
            console.error(updateErr.error.message);
          },
        });
        console.log('Tarea creada: ', res);
        Swal.fire({
          title: res.mensaje,
          icon: 'success',
          draggable: true,
        });
        return res;
      },
      error: (err: any) => {
        console.error(err.error.mensaje);
      },
    });
  }

  // Cargar la información a editar en el formulario
  loadTaskToEdit(taskEdit: Task) {
    this.selectedTaskForEdit = taskEdit;

    const datePipe = new DatePipe('en-US');
    const formattedDate = datePipe.transform(taskEdit.scheduleAt, 'yyyy-MM-dd');

    this.taskForm.patchValue({
      title: taskEdit.title,
      description: taskEdit.description,
      estatus: taskEdit.estatus,
      category: taskEdit.category,
      priority: taskEdit.priority,
      scheduleAt: formattedDate as any,
    });
  }

  // Manejar click en el formulario para editar o crear
  handleEventClick(clickInfo: any) {
    if (this._router.url === '/') {
      this.showNewTask = false;
    } else {
      const taskId = clickInfo.event.id;
      const taskToEdit = this.infoUser.planner?.tasks?.find((task: any) => task._id === taskId);
  
      if (taskToEdit) {
        this.loadTaskToEdit(taskToEdit as Task);
        this.showNewTask = true;
      } else {
        console.error('Tarea no encontrada para ID ', taskId);
      }
    }
  }

  // Editar evento
  updateEvent() {
    if (this.taskForm.invalid || !this.selectedTaskForEdit) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const idToUpdate = this.selectedTaskForEdit._id;

    if (!idToUpdate) {
      console.error('No se pudo obtener el ID de la tarea seleccionada para la actualización.');
      return;
    }

    // Contrucción de los datos de la tarea a editar
    const taskData: Task = {
      _id: idToUpdate,
      title: this.taskForm.value.title || '',
      description: this.taskForm.value.description || '',
      estatus: this.taskForm.value.estatus || undefined,
      category: this.taskForm.value.category || undefined,
      priority: this.taskForm.value.priority || undefined,
      scheduleAt: this.taskForm.value.scheduleAt
        ? new Date(this.taskForm.value.scheduleAt)
        : new Date(),
      creationDate: this.selectedTaskForEdit?.creationDate,
    };
    Swal.fire({
      title: '¿Deseas guardar los cambios esta tarea?',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      denyButtonText: `No guardar`,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: 'var(--planner-color)',
      cancelButtonColor: 'var(--dangerColor)',
      denyButtonColor: 'var(--text-secondary)',
    }).then((result) => {
      if (result.isConfirmed) {
        this._taskService.putTask(taskData, idToUpdate).subscribe({
          next: (res: any) => {
            console.log('Se actualiza esta tarea: ', res);
            this.refreshUserDataAndEvents();
            this.showNewTask = false;
            Swal.fire(res.mensaje, '', 'success');
          },
          error: (err: any) => {
            console.error(err.error.mensaje);
          },
        });
      } else if (result.isDenied) {
        Swal.fire('No se guardaron los cambios', '', 'info');
        this.showNewTask = false;
      }
    });
  }

  // Eliminar un evento
  deleteEvent(taskDelete: Task) {
    const idForDelete = taskDelete._id;
    if (!idForDelete) {
      console.error('No se obtiene ID  del evento a eliminar');
      return;
    }

    Swal.fire({
      title: '¿Está seguro de eliminar este empleado?',
      text: 'No podrá restaurarlo luego',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--dangerColor)',
      cancelButtonColor: 'var(--planner-color)',
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this._taskService.deleteTask(idForDelete).subscribe({
          next: (res: any) => {
            console.log('Tarea eliminada: ', res);
            Swal.fire({
              title: 'Eliminado',
              text: res.mensaje,
              icon: 'success',
            }).then(() => {
              this.showNewTask = false;
              this.refreshUserDataAndEvents();
            });
          },
          error: (err: any) => {
            console.error(err.error.mensaje);
          },
        });
      }
    });
  }
}
