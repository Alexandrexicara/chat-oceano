import { theme } from '../styles/theme'

export function Header({ children, ...props }) {
  return (
    <header
      style={{
        padding: theme.spacing.lg,
        background: theme.colors.surface,
        borderBottom: `1px solid ${theme.colors.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: theme.shadows.md,
        ...props.style,
      }}
      {...props}
    >
      {children}
    </header>
  )
}

export function Container({ children, ...props }) {
  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: theme.spacing.lg,
        ...props.style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}

export function Card({ children, ...props }) {
  return (
    <div
      style={{
        background: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        border: `1px solid ${theme.colors.border}`,
        boxShadow: theme.shadows.sm,
        transition: 'all 0.3s ease',
        ...props.style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}

export function Button({ children, variant = 'primary', ...props }) {
  const baseStyle = {
    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
    borderRadius: theme.borderRadius.md,
    border: 'none',
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    ...props.style,
  }

  const variants = {
    primary: {
      background: theme.colors.primary,
      color: theme.colors.text,
    },
    secondary: {
      background: theme.colors.surface,
      color: theme.colors.text,
      border: `1px solid ${theme.colors.border}`,
    },
    danger: {
      background: theme.colors.error,
      color: theme.colors.text,
    },
  }

  return (
    <button
      style={{
        ...baseStyle,
        ...variants[variant],
      }}
      {...props}
    >
      {children}
    </button>
  )
}

export function Input({ label, ...props }) {
  return (
    <div style={{ marginBottom: theme.spacing.lg }}>
      {label && (
        <label style={{ display: 'block', marginBottom: theme.spacing.sm, color: theme.colors.textSecondary }}>
          {label}
        </label>
      )}
      <input
        style={{
          width: '100%',
          padding: theme.spacing.md,
          background: theme.colors.surface,
          color: theme.colors.text,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.borderRadius.md,
          fontSize: theme.fonts.sizes.md,
        }}
        {...props}
      />
    </div>
  )
}

export function Badge({ children, variant = 'primary', ...props }) {
  const variants = {
    primary: {
      background: theme.colors.primary,
      color: theme.colors.text,
    },
    success: {
      background: theme.colors.success,
      color: theme.colors.text,
    },
    warning: {
      background: theme.colors.warning,
      color: '#000',
    },
    error: {
      background: theme.colors.error,
      color: theme.colors.text,
    },
  }

  return (
    <span
      style={{
        display: 'inline-block',
        padding: `${theme.spacing.xs} ${theme.spacing.md}`,
        borderRadius: theme.borderRadius.full,
        fontSize: theme.fonts.sizes.sm,
        fontWeight: 'bold',
        ...variants[variant],
        ...props.style,
      }}
      {...props}
    >
      {children}
    </span>
  )
}

export function Loading() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          border: `4px solid ${theme.colors.surface}`,
          borderTop: `4px solid ${theme.colors.secondary}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
