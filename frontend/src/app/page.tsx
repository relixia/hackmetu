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
    <div style={styles.pageContainer}>
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
      </section>

      {/* Personnel Placement Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Personel Yerleşimi</h2>
      </section>

      {/* Density Analysis Section */}
      <section id="analysis" style={styles.section}>
        <h2 style={styles.sectionTitle}>Yoğunluk Analizi</h2>
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
  pageContainer: {
    fontFamily: '"Roboto", sans-serif',
    backgroundColor: '#121212',
    color: 'white',
    margin: 0,
  },
  nav: {
    backgroundColor: '#1a1a1a',
    padding: '1.5rem 2.5rem',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  navContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  logo: {
    color: '#00ffcc',
    fontSize: '1.8rem',
    fontWeight: 'bold',
  },
  navLinks: {
    listStyle: 'none',
    display: 'flex',
    gap: '2rem',
  },
  navLink: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '1.2rem',
    transition: 'color 0.3s ease',
  },
  navLinkHover: {
    color: '#00ffcc',
  },
  hero: {
    height: '50vh',
    background: 'linear-gradient(135deg, #00bcd4, #4a90e2)',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '0 2rem',
    boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.3)',
    borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
  },
  heroContent: {
    maxWidth: '800px',
  },
  heroTitle: {
    fontSize: '3.5rem',
    marginBottom: '1.5rem',
    fontFamily: '"Orbitron", sans-serif',
    letterSpacing: '1px',
  },
  heroSubtitle: {
    fontSize: '1.6rem',
    marginBottom: '2rem',
  },
  section: {
    padding: '4rem 2rem',
    backgroundColor: '#1a1a1a',
    textAlign: 'center',
    boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
    borderRadius: '10px',
    margin: '2rem auto',
    maxWidth: '90%',
  },
  sectionTitle: {
    fontSize: '2.5rem',
    marginBottom: '1.5rem',
    fontFamily: '"Orbitron", sans-serif',
    color: '#00ffcc',
  },
  inputGroup: {
    display: 'flex',
    gap: '1.5rem',
    justifyContent: 'center',
    marginBottom: '2rem',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    fontSize: '1.1rem',
  },
  input: {
    padding: '0.8rem',
    fontSize: '1rem',
    borderRadius: '8px',
    border: '2px solid #333',
    background: '#222',
    color: '#fff',
    transition: 'border-color 0.3s ease',
  },
  inputFocus: {
    borderColor: '#00ffcc',
  },
  floorSelector: {
    display: 'flex',
    gap: '1.5rem',
    justifyContent: 'center',
    marginBottom: '2rem',
  },
  floorButton: {
    padding: '0.6rem 1.2rem',
    fontSize: '1.1rem',
    backgroundColor: '#00bcd4',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background 0.3s ease',
  },
  activeFloorButton: {
    backgroundColor: '#007a8a',
  },
  floorPlan: {
    display: 'grid',
    gridTemplateColumns: 'repeat(10, 40px)',
    gap: '5px',
    justifyContent: 'center',
    margin: '0 auto',
    width: 'fit-content',
    border: '1px solid #444',
    padding: '15px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
  },
  gridCell: {
    width: '40px',
    height: '40px',
    border: '1px solid #333',
    position: 'relative',
    borderRadius: '5px',
  },
  personnelCell: {
    width: '100%',
    height: '100%',
    backgroundColor: '#00bcd4',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'move',
    borderRadius: '4px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    maxWidth: '500px',
    margin: '0 auto',
  },
  ctaButton: {
    padding: '1rem 2rem',
    fontSize: '1.2rem',
    color: '#00bcd4',
    background: 'transparent',
    border: '2px solid #00bcd4',
    borderRadius: '8px',
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: '2rem',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(10px)',
    color: 'white',
    border: '2px solid rgba(255, 255, 255, 0.1)',
  },
  densityIcon: {
    color: '#00ffcc',
    marginTop: '1rem',
  },
  footer: {
    backgroundColor: '#1a1a1a',
    padding: '2rem',
    textAlign: 'center',
    boxShadow: '0 -4px 8px rgba(0, 0, 0, 0.2)',
  },
  footerText: {
    color: '#bbb',
    fontSize: '1rem',
  },
};
