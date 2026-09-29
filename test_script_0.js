
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['Geist', 'sans-serif'],
            mono: ['Geist Mono', 'monospace'],
          },
          colors: {
            vdark: '#030303',
            surface: '#0a0a0c',
            subtle: '#121216',
          },
          transitionTimingFunction: {
            'spring': 'cubic-bezier(0.32, 0.72, 0, 1)',
          }
        }
      }
    }
  