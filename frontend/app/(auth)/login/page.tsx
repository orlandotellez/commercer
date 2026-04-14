'use client';

import { useState } from 'react';
import { Cpu } from 'lucide-react';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate login
    setTimeout(() => {
      setIsLoading(false);
      // Login logic here
      router.push("/admin")

    }, 1000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <Cpu className={styles.logoIcon} />
          </div>
          <h1 className={styles.title}>Iniciar sesión</h1>
          <p className={styles.subtitle}>
            Ingresá tus credenciales para continuar
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}

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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className={styles.forgotPassword}>
            <button type="button" className={styles.forgotLink}>
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

      </div>
    </div>
  );
}
