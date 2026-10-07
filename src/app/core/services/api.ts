import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
@Injectable({ providedIn: 'root' })
export class Api {
  private readonly http = inject(HttpClient);
  post<T>(path: string, body: unknown): Observable<T> { return this.http.post<T>(`${environment.apiUrl}${path}`, body); }
}
