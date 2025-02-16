"use client";

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBuilding, faChartBar } from '@fortawesome/free-solid-svg-icons';

export default function Home() {
  const [floors, setFloors] = useState(1);
  const [squareMeters, setSquareMeters] = useState(100);
  const [personnel, setPersonnel] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(1);

  const handleAddPersonnel = (e) => {
    e.preventDefault();
    const newPersonnel = {
      id: personnel.length + 1,
      name: e.target.name.value,
      role: e.target.role.value,
      floor: selectedFloor,
      position: { x: 0, y: 0 }, // Default position
    };
    setPersonnel([...personnel, newPersonnel]);
    e.target.reset();
  };

  const handleDrag = (id, x, y) => {
    const updatedPersonnel = personnel.map((p) =>
      p.id === id ? { ...p, position: { x, y } } : p
    );
    setPersonnel(updatedPersonnel);
  };

  const handleFloorChange = (floor) => {
    setSelectedFloor(floor);
  };

  return (
    <div>
      {/* Navigation Bar */}
      <nav style={styles.nav}>
        <div style={styles.navContainer}>
          <h1 style={styles.logo}>CallCenter Yerleşim</h1>
          <ul style={styles.navLinks}>
            <li><a href="#home" style={styles.navLink}>Ana Sayfa</a></li>
            <li><a href="#placement" style={styles.navLink}>Yerleşim</a></li>
            <li><a href="#analysis" style={styles.navLink}>Analiz</a></li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Call Center Personel Yerleşim Sistemi</h1>
          <p style={styles.heroSubtitle}>Bina ve personel yerleşimini kolayca planlayın.</p>
        </div>
      </section>

      {/* Building Input Section */}
      <section id="placement" style={styles.section}>
        <h2 style={styles.sectionTitle}>Bina Bilgileri</h2>
        <div style={styles.inputGroup}>
          <label style={styles.label}>
            Kat Sayısı:
            <input
              type="number"
              value={floors}
              onChange={(e) => setFloors(Number(e.target.value))}
              style={styles.input}
            />
          </label>
          <label style={styles.label}>
            Metrekare (m²):
            <input
              type="number"
              value={squareMeters}
              onChange={(e) => setSquareMeters(Number(e.target.value))}
              style={styles.input}
            />
          </label>
        </div>
      </section>

      {/* Personnel Placement Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Personel Yerleşimi</h2>
        <div style={styles.floorSelector}>
          {Array.from({ length: floors }, (_, i) => (
            <button
              key={i + 1}
              style={{
                ...styles.floorButton,
                ...(selectedFloor === i + 1 ? styles.activeFloorButton : {}),
              }}
              onClick={() => handleFloorChange(i + 1)}
            >
              Kat {i + 1}
            </button>
          ))}
        </div>
        <div style={styles.floorPlan}>
          {Array.from({ length: squareMeters }, (_, i) => (
            <div key={i} style={styles.gridCell}>
              {personnel
                .filter((p) => p.floor === selectedFloor && p.position.x === i % 10 && p.position.y === Math.floor(i / 10))
                .map((p) => (
                  <div
                    key={p.id}
                    style={styles.personnelCell}
                    draggable
                    onDragEnd={(e) => {
                      const rect = e.target.getBoundingClientRect();
                      const x = Math.floor((rect.left - e.currentTarget.parentElement.getBoundingClientRect().left) / 40);
                      const y = Math.floor((rect.top - e.currentTarget.parentElement.getBoundingClientRect().top) / 40);
                      handleDrag(p.id, x, y);
                    }}
                  >
                    <FontAwesomeIcon icon={faUser} />
                  </div>
                ))}
            </div>
          ))}
        </div>
      </section>

      {/* Personnel Form Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Personel Ekle</h2>
        <form onSubmit={handleAddPersonnel} style={styles.form}>
          <label style={styles.label}>
            Ad:
            <input type="text" name="name" required style={styles.input} />
          </label>
          <label style={styles.label}>
            Rol:
            <input type="text" name="role" required style={styles.input} />
          </label>
          <button type="submit" style={styles.ctaButton}>Personel Ekle</button>
        </form>
      </section>

      {/* Density Analysis Section */}
      <section id="analysis" style={styles.section}>
        <h2 style={styles.sectionTitle}>Yoğunluk Analizi</h2>
        <div style={styles.densityGrid}>
          {Array.from({ length: floors }, (_, i) => (
            <div key={i + 1} style={styles.densityCard}>
              <h3>Kat {i + 1}</h3>
              <p>Personel Sayısı: {personnel.filter((p) => p.floor === i + 1).length}</p>
              <FontAwesomeIcon icon={faChartBar} size="2x" style={styles.densityIcon} />
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>© 2023 CallCenter Yerleşim. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
}

// Styles
const styles = {
  nav: {
    backgroundColor: '#4a6cf7',
    padding: '1rem 2rem',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  navContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  logo: {
    color: 'white',
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  navLinks: {
    listStyle: 'none',
    display: 'flex',
    gap: '2rem',
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '1rem',
  },
  hero: {
    height: '50vh',
    background: 'linear-gradient(135deg, #6e8efb, #4a6cf7)',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '0 2rem',
  },
  heroContent: {
    maxWidth: '800px',
  },
  heroTitle: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  heroSubtitle: {
    fontSize: '1.5rem',
    marginBottom: '2rem',
  },
  section: {
    padding: '4rem 2rem',
    backgroundColor: '#f9f9f9',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: '2.5rem',
    marginBottom: '2rem',
  },
  inputGroup: {
    display: 'flex',
    gap: '2rem',
    justifyContent: 'center',
    marginBottom: '2rem',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    fontSize: '1rem',
  },
  input: {
    padding: '0.5rem',
    fontSize: '1rem',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  floorSelector: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    marginBottom: '2rem',
  },
  floorButton: {
    padding: '0.5rem 1rem',
    fontSize: '1rem',
    backgroundColor: '#4a6cf7',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  activeFloorButton: {
    backgroundColor: '#2a4cb7',
  },
  floorPlan: {
    display: 'grid',
    gridTemplateColumns: 'repeat(10, 40px)',
    gap: '5px',
    justifyContent: 'center',
    margin: '0 auto',
    width: 'fit-content',
    border: '1px solid #ccc',
    padding: '10px',
    backgroundColor: 'white',
  },
  gridCell: {
    width: '40px',
    height: '40px',
    border: '1px solid #ccc',
    position: 'relative',
  },
  personnelCell: {
    width: '100%',
    height: '100%',
    backgroundColor: '#4a6cf7',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'grab',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    maxWidth: '400px',
    margin: '0 auto',
  },
  ctaButton: {
    padding: '1rem 2rem',
    fontSize: '1rem',
    color: '#4a6cf7',
    background: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background 0.3s ease',
  },
  densityGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  densityCard: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  densityIcon: {
    color: '#4a6cf7',
    marginTop: '1rem',
  },
  footer: {
    backgroundColor: '#4a6cf7',
    padding: '2rem',
    textAlign: 'center',
  },
  footerText: {
    color: 'white',
    fontSize: '1rem',
  },
};