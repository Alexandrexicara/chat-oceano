// 🌊 Tema Oceanos - Paleta de Cores e Estilos

export const theme = {
  colors: {
    primary: '#0066cc',        // Azul oceano
    secondary: '#00a3ff',      // Azul claro
    accent: '#ff6b6b',         // Coral/destaque
    background: '#0a1628',     // Azul escuro
    surface: '#1a2f4d',        // Azul mais claro
    text: '#ffffff',           // Branco
    textSecondary: '#b0c4de',  // Cinza azulado
    success: '#51cf66',        // Verde
    warning: '#ffd43b',        // Amarelo
    error: '#ff6b6b',          // Vermelho
    border: '#2a4365',         // Borda azul
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },

  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '16px',
    xl: '24px',
    full: '999px',
  },

  shadows: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.3)',
    md: '0 4px 16px rgba(0, 102, 204, 0.2)',
    lg: '0 8px 32px rgba(0, 102, 204, 0.3)',
    glow: '0 0 20px rgba(0, 163, 255, 0.4)',
  },

  fonts: {
    family: {
      base: "'Inter', 'Segoe UI', sans-serif",
      heading: "'Poppins', 'Segoe UI', sans-serif",
    },
    sizes: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '20px',
      xl: '24px',
      xxl: '32px',
    },
  },

  animations: {
    wave: `@keyframes wave {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }`,
    float: `@keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }`,
    pulse: `@keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }`,
    shimmer: `@keyframes shimmer {
      0% { background-position: -1000px 0; }
      100% { background-position: 1000px 0; }
    }`,
  },
}

export const globalStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body, #root {
    width: 100%;
    height: 100%;
  }

  body {
    font-family: ${theme.fonts.family.base};
    background: ${theme.colors.background};
    color: ${theme.colors.text};
    line-height: 1.6;
    overflow-x: hidden;
  }

  /* Scrollbar Personalizada */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${theme.colors.surface};
  }

  ::-webkit-scrollbar-thumb {
    background: ${theme.colors.secondary};
    border-radius: ${theme.borderRadius.full};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${theme.colors.primary};
  }

  button {
    font-family: ${theme.fonts.family.base};
    cursor: pointer;
    transition: all 0.3s ease;
  }

  input, textarea, select {
    font-family: ${theme.fonts.family.base};
    background: ${theme.colors.surface};
    color: ${theme.colors.text};
    border: 1px solid ${theme.colors.border};
    padding: ${theme.spacing.md};
    border-radius: ${theme.borderRadius.md};
    transition: all 0.3s ease;
  }

  input:focus, textarea:focus, select:focus {
    outline: none;
    border-color: ${theme.colors.secondary};
    box-shadow: 0 0 0 3px rgba(0, 163, 255, 0.1);
  }
`
