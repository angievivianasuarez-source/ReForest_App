import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { ApiError, PublicUserRole } from '../../../core/models/user';
import { Registration } from '../../../core/services/registration';
import { notBlank } from './validators';
@Component({ selector: 'app-register', imports: [ReactiveFormsModule], templateUrl: './register.html', styleUrl: './register.scss' })
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly registration = inject(Registration);
  readonly pending = signal(false);
  readonly message = signal('');
  readonly success = signal(false);
  readonly roles: { value: PublicUserRole; label: string }[] = [
    { value: 'CIUDADANO', label: 'Ciudadano' }, { value: 'VOLUNTARIO', label: 'Voluntario' }, { value: 'ENTIDAD', label: 'Entidad' }
  ];
  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, notBlank, Validators.maxLength(120)]],
    correo: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    password: ['', [Validators.required, notBlank, Validators.minLength(8), Validators.maxLength(128)]],
    rol: ['CIUDADANO' as PublicUserRole, Validators.required]
  });
  submit(): void {
    if (this.pending()) return;
    this.message.set(''); this.success.set(false);
    this.form.patchValue({ nombre: this.form.controls.nombre.value.trim(), correo: this.form.controls.correo.value.trim().toLowerCase() });
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.pending.set(true);
    this.registration.register(this.form.getRawValue()).pipe(finalize(() => this.pending.set(false))).subscribe({
      next: () => { this.success.set(true); this.message.set('Tu cuenta fue creada correctamente.'); this.form.reset(); },
      error: (error: HttpErrorResponse) => {
        const detail = (error.error as ApiError | null)?.detail;
        if (error.status === 409) this.message.set('Este correo ya está registrado. Usa otro correo.');
        else if (error.status === 422) {
          this.message.set('Revisa los datos del formulario e inténtalo de nuevo.');
          for (const item of detail?.errors ?? []) {
            const field = item.field as keyof typeof this.form.controls;
            if (this.form.controls[field]) { this.form.controls[field].setErrors({ server: true }); this.form.controls[field].markAsTouched(); }
          }
        } else if (error.status === 503) this.message.set('El servicio de registro no está disponible temporalmente. Inténtalo de nuevo en unos minutos.');
        else if (error.status === 0) this.message.set('No se pudo conectar con el servidor. Inténtalo de nuevo.');
        else this.message.set('No se pudo crear la cuenta. Inténtalo de nuevo.');
      }
    });
  }
  invalid(field: keyof typeof this.form.controls): boolean { const c = this.form.controls[field]; return c.touched && c.invalid; }
}
