import { THEME_COLORS } from '../constants'

// Theme configuration
export const theme = {
  colors: {
    primary: THEME_COLORS.PRIMARY,
    secondary: THEME_COLORS.SECONDARY,
    success: THEME_COLORS.SUCCESS,
    error: THEME_COLORS.ERROR,
    warning: THEME_COLORS.WARNING,
    background: {
      light: '#FFFFFF',
      dark: '#1F2937',
    },
    text: {
      light: '#1F2937',
      dark: '#F9FAFB',
    },
    border: {
      light: '#E5E7EB',
      dark: '#374151',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      none: '1',
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  transitions: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
  },
}

// Theme context
export const ThemeContext = React.createContext({
  theme: 'light',
  toggleTheme: () => {},
})

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = React.useState(() => {
    const savedTheme = localStorage.getItem('theme')
    return savedTheme || 'light'
  })

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  React.useEffect(() => {
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Custom hook to use theme
export const useTheme = () => {
  const context = React.useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Theme utility functions
export const getThemeColor = (color, variant = 'light') => {
  return theme.colors[color]?.[variant] || color
}

export const getThemeSpacing = (size) => {
  return theme.spacing[size] || size
}

export const getThemeBorderRadius = (size) => {
  return theme.borderRadius[size] || size
}

export const getThemeShadow = (size) => {
  return theme.shadows[size] || size
}

export const getThemeTransition = (type) => {
  return theme.transitions[type] || type
}

export const getThemeZIndex = (level) => {
  return theme.zIndex[level] || level
} 