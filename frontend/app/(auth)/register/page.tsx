'use client';

import { useState } from 'react';
import { Cpu, Loader2 } from 'lucide-react';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Validar longitud de contraseña
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role: 'customer', // Siempre customer para registro público
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al registrarse');
      }

      // Redireccionar al login después de registro exitoso
      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <Cpu className={styles.logoIcon} />
          </div>
          <h1 className={styles.title}>Crear cuenta</h1>
          <p className={styles.subtitle}>
            Registrate como cliente para continuar
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.field}>
            <label className={styles.label}>Nombre completo</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Juan Pérez"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              className={styles.input}
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Contraseña</label>
            <input
              type="password"
              className={styles.input}
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Confirmar contraseña</label>
            <input
              type="password"
              className={styles.input}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className={styles.spinner} />
                Creando cuenta...
              </>
            ) : (
              'Crear cuenta'
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <span className={styles.footerText}>¿Ya tenés cuenta?</span>
          <button
            type="button"
            className={styles.footerLink}
            onClick={() => router.push('/login')}
          >
            Iniciá sesión
          </button>
        </div>
      </div>
    </div>
  );
}