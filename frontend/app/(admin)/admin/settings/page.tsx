"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Lock,
  Bell,
  Shield,
  Save,
  Camera,
  Loader2,
  AlertCircle,
  CheckCircle,
  Phone,
} from "lucide-react";
import styles from "./page.module.css";
import {
  getCurrentUser,
  updateProfile,
  changePassword,
  UserProfile,
} from "@/shared/lib/api";

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

const sections: SettingsSection[] = [
  { id: "profile", title: "Perfil", icon: User },
  { id: "notifications", title: "Notificaciones", icon: Bell },
  { id: "security", title: "Seguridad", icon: Shield },
];

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Profile form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  
  // Notifications settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [orderNotifications, setOrderNotifications] = useState(true);
  const [inventoryAlerts, setInventoryAlerts] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  
  // Security settings
  const [twoFactor, setTwoFactor] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Cargar datos del usuario
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        setName(user.name || "");
        setEmail(user.email || "");
        setPhone(user.phone || "");
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Error al cargar los datos del usuario");
        // Usar datos por defecto si falla
        setName("Usuario");
        setEmail("usuario@ejemplo.com");
      } finally {
        setLoading(false);
      }
    };

    if (mounted) {
      fetchUser();
    }
  }, [mounted]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateProfile({ name, email, phone });
      showSuccess("Perfil actualizado correctamente");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar perfil");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      showSuccess("Contraseña cambiada correctamente");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cambiar contraseña");
    } finally {
      setSaving(false);
    }
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <Loader2 className={styles.loadingSpinner} />
          <span>Cargando...</span>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return (
          <div className={styles.sectionContent}>
            <h2 className={styles.sectionTitle}>Perfil de Usuario</h2>
            <p className={styles.sectionDescription}>
              Actualiza tu información personal y de contacto
            </p>

            {/* Success message */}
            {success && (
              <div className={styles.successMessage}>
                <CheckCircle size={16} />
                {success}
              </div>
            )}

            {/* Error message */}
            {error && activeSection === "profile" && (
              <div className={styles.errorMessage}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className={styles.avatarSection}>
              <div className={styles.avatar}>
                <span className={styles.avatarText}>
                  {name.charAt(0).toUpperCase()}
                </span>
                <button className={styles.avatarEdit}>
                  <Camera className={styles.avatarEditIcon} />
                </button>
              </div>
              <div className={styles.avatarInfo}>
                <p className={styles.avatarLabel}>Foto de perfil</p>
                <p className={styles.avatarHint}>JPG, PNG o GIF. Máximo 2MB</p>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <User className={styles.formLabelIcon} />
                Nombre completo
              </label>
              <input
                type="text"
                className={styles.formInput}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <Mail className={styles.formLabelIcon} />
                Correo electrónico
              </label>
              <input
                type="email"
                className={styles.formInput}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <Phone className={styles.formLabelIcon} />
                Teléfono
              </label>
              <input
                type="tel"
                className={styles.formInput}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            
            <button
              className={styles.saveButton}
              onClick={handleSaveProfile}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className={styles.spinner} />
              ) : (
                <Save className={styles.saveIcon} />
              )}
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        );

      case "notifications":
        return (
          <div className={styles.sectionContent}>
            <h2 className={styles.sectionTitle}>Notificaciones</h2>
            <p className={styles.sectionDescription}>
              Configura cómo y cuándo quieres recibir notificaciones
            </p>
            
            <div className={styles.toggleGroup}>
              <div className={styles.toggleItem}>
                <div className={styles.toggleInfo}>
                  <span className={styles.toggleLabel}>Notificaciones por email</span>
                  <span className={styles.toggleDescription}>
                    Recibi actualizaciones por correo electrónico
                  </span>
                </div>
                <button
                  className={`${styles.toggle} ${emailNotifications ? styles.toggleActive : ""}`}
                  onClick={() => setEmailNotifications(!emailNotifications)}
                >
                  <span className={styles.toggleKnob} />
                </button>
              </div>
              
              <div className={styles.toggleItem}>
                <div className={styles.toggleInfo}>
                  <span className={styles.toggleLabel}>Notificaciones de pedidos</span>
                  <span className={styles.toggleDescription}>
                    Recibi alertas cuando haya nuevos pedidos
                  </span>
                </div>
                <button
                  className={`${styles.toggle} ${orderNotifications ? styles.toggleActive : ""}`}
                  onClick={() => setOrderNotifications(!orderNotifications)}
                >
                  <span className={styles.toggleKnob} />
                </button>
              </div>
              
              <div className={styles.toggleItem}>
                <div className={styles.toggleInfo}>
                  <span className={styles.toggleLabel}>Alertas de inventario</span>
                  <span className={styles.toggleDescription}>
                    Notificaciones cuando el stock esté bajo
                  </span>
                </div>
                <button
                  className={`${styles.toggle} ${inventoryAlerts ? styles.toggleActive : ""}`}
                  onClick={() => setInventoryAlerts(!inventoryAlerts)}
                >
                  <span className={styles.toggleKnob} />
                </button>
              </div>
              
              <div className={styles.toggleItem}>
                <div className={styles.toggleInfo}>
                  <span className={styles.toggleLabel}>Emails de marketing</span>
                  <span className={styles.toggleDescription}>
                    Ofertas y promociones exclusivas
                  </span>
                </div>
                <button
                  className={`${styles.toggle} ${marketingEmails ? styles.toggleActive : ""}`}
                  onClick={() => setMarketingEmails(!marketingEmails)}
                >
                  <span className={styles.toggleKnob} />
                </button>
              </div>
            </div>
            
            <button className={styles.saveButton} onClick={() => showSuccess("Notificaciones guardadas")}>
              <Save className={styles.saveIcon} />
              Guardar cambios
            </button>
          </div>
        );

      case "security":
        return (
          <div className={styles.sectionContent}>
            <h2 className={styles.sectionTitle}>Seguridad</h2>
            <p className={styles.sectionDescription}>
              Configura las opciones de seguridad de tu cuenta
            </p>

            {/* Success message */}
            {success && (
              <div className={styles.successMessage}>
                <CheckCircle size={16} />
                {success}
              </div>
            )}

            {/* Error message */}
            {error && activeSection === "security" && (
              <div className={styles.errorMessage}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <Lock className={styles.formLabelIcon} />
                Cambiar contraseña
              </label>
              <input
                type="password"
                className={styles.formInput}
                placeholder="Contraseña actual"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <input
                type="password"
                className={styles.formInput}
                placeholder="Nueva contraseña"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ marginTop: "0.5rem" }}
              />
              <input
                type="password"
                className={styles.formInput}
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ marginTop: "0.5rem" }}
              />
            </div>
            
            <div className={styles.toggleGroup}>
              <div className={styles.toggleItem}>
                <div className={styles.toggleInfo}>
                  <span className={styles.toggleLabel}>Autenticación de dos factores</span>
                  <span className={styles.toggleDescription}>
                    Añade una capa extra de seguridad a tu cuenta
                  </span>
                </div>
                <button
                  className={`${styles.toggle} ${twoFactor ? styles.toggleActive : ""}`}
                  onClick={() => setTwoFactor(!twoFactor)}
                >
                  <span className={styles.toggleKnob} />
                </button>
              </div>
            </div>
            
            <button
              className={styles.saveButton}
              onClick={handleChangePassword}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className={styles.spinner} />
              ) : (
                <Save className={styles.saveIcon} />
              )}
              {saving ? "Cambiando..." : "Cambiar contraseña"}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Configuración</h1>
          <p className={styles.pageSubtitle}>
            Gestiona tu cuenta y preferencias
          </p>
        </div>
      </div>

      {/* Settings Layout */}
      <div className={styles.settingsLayout}>
        {/* Sidebar Navigation */}
        <nav className={styles.settingsNav}>
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                className={`${styles.navItem} ${activeSection === section.id ? styles.navItemActive : ""}`}
                onClick={() => setActiveSection(section.id)}
              >
                <Icon className={styles.navIcon} />
                <span>{section.title}</span>
              </button>
            );
          })}
        </nav>

        {/* Content Area */}
        <div className={styles.settingsContent}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
