import { Injectable, inject } from '@angular/core';
import { Auth, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private auth = inject(Auth);
  private usuarioActual: User | null = null;

  constructor() {}

  usuarioObservable = new Observable<User | null>((subscriber) => {
    return this.auth.onAuthStateChanged((user) => {
      this.usuarioActual = user;
      subscriber.next(user);
    });
  });

  async registro(email: string, password: string, nombre: string) {
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);
    await updateProfile(cred.user, { displayName: nombre });
    this.usuarioActual = cred.user;
    return cred;
  }

  async login(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(this.auth, email, password);
    this.usuarioActual = cred.user;
    return cred;
  }

  getUsuario() {
    return this.usuarioActual;
  }

  async getToken(): Promise<string | null> {
  const user = this.auth.currentUser;
  return user ? await user.getIdToken() : null;
}

  logout() {
    return this.auth.signOut();
  }
}










