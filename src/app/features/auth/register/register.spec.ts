import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Register } from './register';
import { environment } from '../../../../environments/environment';

const payload = { nombre: 'María Niño', correo: 'persona@example.com', password: 'una-clave-segura', rol: 'CIUDADANO' as const };

describe('Registro', () => {
  let fixture: ComponentFixture<Register>;
  let component: Register;
  let http: HttpTestingController;
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Register], providers: [provideHttpClient(), provideHttpClientTesting()] }).compileComponents();
    fixture = TestBed.createComponent(Register); component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController); fixture.detectChanges();
  });
  afterEach(() => http.verify());

  it('rechaza vacíos y solo ofrece roles públicos', () => {
    component.submit();
    expect(component.form.invalid).toBe(true);
    expect(component.form.controls.nombre.touched).toBe(true);
    expect(component.roles.map(r => r.value)).toEqual(['CIUDADANO', 'VOLUNTARIO', 'ENTIDAD']);
    http.expectNone(`${environment.apiUrl}/auth/register`);
  });
  it.each([
    ['nombre', '   '], ['nombre', 'x'.repeat(121)], ['correo', 'incorrecto'],
    ['password', 'corta'], ['password', ' '.repeat(8)], ['password', 'x'.repeat(129)]
  ])('valida %s: %s', (field, value) => {
    component.form.setValue(payload);
    component.form.get(field)!.setValue(value);
    component.submit();
    expect(component.form.invalid).toBe(true);
    http.expectNone(`${environment.apiUrl}/auth/register`);
  });
  it('envía el contrato normalizado, evita doble envío y muestra éxito', () => {
    component.form.setValue({ ...payload, nombre: ' María Niño ', correo: ' PERSONA@EXAMPLE.COM ' });
    component.submit(); component.submit();
    expect(component.pending()).toBe(true);
    const request = http.expectOne(`${environment.apiUrl}/auth/register`);
    expect(request.request.method).toBe('POST'); expect(request.request.body).toEqual(payload);
    request.flush({ id: '00000000-0000-0000-0000-000000000001', nombre: payload.nombre, correo: payload.correo, rol: payload.rol }, { status: 201, statusText: 'Created' });
    fixture.detectChanges();
    expect(component.pending()).toBe(false); expect(component.success()).toBe(true);
    expect(fixture.nativeElement.querySelector('[role=status]').textContent).toContain('creada correctamente');
    expect(component.form.controls.password.value).toBe('');
  });
  it('explica el correo duplicado y permite corregirlo', () => {
    component.form.setValue(payload); component.submit();
    http.expectOne(`${environment.apiUrl}/auth/register`).flush({ detail: { code: 'EMAIL_ALREADY_REGISTERED' } }, { status: 409, statusText: 'Conflict' });
    expect(component.message()).toContain('ya está registrado'); expect(component.pending()).toBe(false);
    expect(component.form.controls.correo.value).toBe(payload.correo);
  });
  it('marca el campo indicado por un error 422', () => {
    component.form.setValue(payload); component.submit();
    http.expectOne(`${environment.apiUrl}/auth/register`).flush({ detail: { code: 'VALIDATION_ERROR', errors: [{ field: 'password', type: 'invalid', message: 'Valor inválido.' }] } }, { status: 422, statusText: 'Unprocessable Entity' });
    expect(component.invalid('password')).toBe(true); expect(component.message()).toContain('Revisa');
  });
  it('explica los fallos de conexión sin mostrar detalles internos', () => {
    component.form.setValue(payload); component.submit();
    http.expectOne(`${environment.apiUrl}/auth/register`).error(new ProgressEvent('error'));
    expect(component.message()).toContain('conectar'); expect(component.pending()).toBe(false);
  });
  it('explica la indisponibilidad temporal y permite reintentar', () => {
    component.form.setValue(payload); component.submit();
    http.expectOne(`${environment.apiUrl}/auth/register`).flush({ detail: { code: 'REGISTRATION_UNAVAILABLE' } }, { status: 503, statusText: 'Service Unavailable' });
    expect(component.message()).toContain('no está disponible temporalmente');
    expect(component.pending()).toBe(false);
    expect(component.form.controls.correo.value).toBe(payload.correo);
  });
});
