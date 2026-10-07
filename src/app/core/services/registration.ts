import { inject, Injectable } from '@angular/core';
import { Api } from './api';
import { RegisterRequest, RegisterResponse } from '../models/user';
@Injectable({ providedIn: 'root' })
export class Registration {
  private readonly api = inject(Api);
  register(request: RegisterRequest) { return this.api.post<RegisterResponse>('/auth/register', request); }
}
