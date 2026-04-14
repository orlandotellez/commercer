"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Lock,
  Bell,
  Palette,
  Globe,
  Shield,
  Save,
  Camera,
} from "lucide-react";
import styles from "./page.module.css";

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

const sections: SettingsSection[] = [
  { id: "profile", title: "Perfil", icon: User },
  { id: "notifications", title: "Notificaciones", icon: Bell },
  { id: "appearance", title: "Apariencia", icon: Palette },
  { id: "security", title: "Seguridad", icon: Shield },
];

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");
  
  // Profile form state
  const [name, setName] = useState("Admin User");
  const [email, setEmail] = useState("admin@techcomponents.com");
  const [phone, setPhone] = useState("+54 11 1234-5678");
  
  // Notifications settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [orderNotifications, setOrderNotifications] = useState(true);
  const [inventoryAlerts, setInventoryAlerts] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  
  // Appearance settings
  const [theme, setTheme] = useState("dark");
  const [language, setLanguage] = useState("es-AR");
  
  // Security settings
  const [twoFactor, setTwoFactor] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSave = () => {
    alert("Configuración guardada (placeholder)");
  };

  if (!mounted) return null;

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return (
          <div className={styles.sectionContent}>
            <h2 className={styles.sectionTitle}>Perfil de Usuario</h2>
            <p className={styles.sectionDescription}>
              Actualiza tu información personal y de contacto
            </p>
            
            <div className={styles.avatarSection}>
              <div className={styles.avatar}>
                <span className={styles.avatarText}>AU</span>
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
                <Globe className={styles.formLabelIcon} />
                Teléfono
              </label>
              <input
                type="tel"
                className={styles.formInput}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            
            <button className={styles.saveButton} onClick={handleSave}>
              <Save className={styles.saveIcon} />
              Guardar cambios
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
            
            <button className={styles.saveButton} onClick={handleSave}>
              <Save className={styles.saveIcon} />
              Guardar cambios
            </button>
          </div>
        );
        
      case "appearance":
        return (
          <div className={styles.sectionContent}>
            <h2 className={styles.sectionTitle}>Apariencia</h2>
            <p className={styles.sectionDescription}>
              Personaliza la interfaz del dashboard
            </p>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Tema</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioItem}>
                  <input
                    type="radio"
                    name="theme"
                    value="light"
                    checked={theme === "light"}
                    onChange={(e) => setTheme(e.target.value)}
                    className={styles.radioInput}
                  />
                  <span className={styles.radioLabel}>Claro</span>
                </label>
                <label className={styles.radioItem}>
                  <input
                    type="radio"
                    name="theme"
                    value="dark"
                    checked={theme === "dark"}
                    onChange={(e) => setTheme(e.target.value)}
                    className={styles.radioInput}
                  />
                  <span className={styles.radioLabel}>Oscuro</span>
                </label>
                <label className={styles.radioItem}>
                  <input
                    type="radio"
                    name="theme"
                    value="system"
                    checked={theme === "system"}
                    onChange={(e) => setTheme(e.target.value)}
                    className={styles.radioInput}
                  />
                  <span className={styles.radioLabel}>Sistema</span>
                </label>
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <Globe className={styles.formLabelIcon} />
                Idioma
              </label>
              <select
                className={styles.formSelect}
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="es-AR">Español (Argentina)</option>
                <option value="es-ES">Español (España)</option>
                <option value="en-US">English (US)</option>
                <option value="pt-BR">Português (Brasil)</option>
              </select>
            </div>
            
            <button className={styles.saveButton} onClick={handleSave}>
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
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <Lock className={styles.formLabelIcon} />
                Cambiar contraseña
              </label>
              <input
                type="password"
                className={styles.formInput}
                placeholder="Contraseña actual"
              />
              <input
                type="password"
                className={styles.formInput}
                placeholder="Nueva contraseña"
                style={{ marginTop: "0.5rem" }}
              />
              <input
                type="password"
                className={styles.formInput}
                placeholder="Confirmar contraseña"
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
            
            <button className={styles.saveButton} onClick={handleSave}>
              <Save className={styles.saveIcon} />
              Guardar cambios
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
