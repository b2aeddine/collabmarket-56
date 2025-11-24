
import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		screens: {
			'xs': '475px',
			'sm': '640px',
			'md': '768px',
			'lg': '1024px',
			'xl': '1280px',
			'2xl': '1536px',
		},
		extend: {
			fontFamily: {
				poppins: ['Poppins', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: '#FF6B9D',
					foreground: '#FFFFFF',
					50: '#FFE8F1',
					100: '#FFD1E3',
					200: '#FFA3C7',
					300: '#FF75AB',
					400: '#FF478F',
					500: '#FF6B9D',
					600: '#E5519A',
					700: '#CC3797',
					800: '#B21D94',
					900: '#990391'
				},
				secondary: {
					DEFAULT: '#FF8E3C',
					foreground: '#FFFFFF',
					50: '#FFF4E6',
					100: '#FFE9CC',
					200: '#FFD399',
					300: '#FFBD66',
					400: '#FFA733',
					500: '#FF8E3C',
					600: '#E67A33',
					700: '#CC662A',
					800: '#B35221',
					900: '#993E18'
				},
				accent: {
					DEFAULT: '#4ECDC4',
					foreground: '#FFFFFF',
					50: '#E6F9F7',
					100: '#CCF3EF',
					200: '#99E7DF',
					300: '#66DBCF',
					400: '#33CFBF',
					500: '#4ECDC4',
					600: '#3BB8B0',
					700: '#28A39C',
					800: '#158E88',
					900: '#027974'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0',
						opacity: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)',
						opacity: '1'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)',
						opacity: '1'
					},
					to: {
						height: '0',
						opacity: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(8px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'fade-in-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(16px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'scale-in': {
					'0%': {
						transform: 'scale(0.96)',
						opacity: '0'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'slide-in-top': {
					'0%': {
						opacity: '0',
						transform: 'translateY(-12px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'slide-in-bottom': {
					'0%': {
						opacity: '0',
						transform: 'translateY(12px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'spin-slow': {
					'0%': {
						transform: 'rotate(0deg)'
					},
					'100%': {
						transform: 'rotate(360deg)'
					}
				},
				'pulse-slow': {
					'0%, 100%': {
						opacity: '1'
					},
					'50%': {
						opacity: '0.6'
					}
				},
				'shimmer': {
					'0%': {
						backgroundPosition: '-200% 0'
					},
					'100%': {
						backgroundPosition: '200% 0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
				'accordion-up': 'accordion-up 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
				'fade-in': 'fade-in 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
				'fade-in-up': 'fade-in-up 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
				'scale-in': 'scale-in 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
				'slide-in-top': 'slide-in-top 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
				'slide-in-bottom': 'slide-in-bottom 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
				'spin-slow': 'spin-slow 1.8s linear infinite',
				'pulse-slow': 'pulse-slow 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'shimmer': 'shimmer 1.8s ease-in-out infinite'
			},
			backgroundImage: {
				'gradient-primary': 'linear-gradient(135deg, #FF6B9D 0%, #FF8E3C 100%)',
				'gradient-secondary': 'linear-gradient(135deg, #4ECDC4 0%, #FF6B9D 100%)',
				'gradient-hero': 'linear-gradient(135deg, #FF6B9D 0%, #FF8E3C 50%, #4ECDC4 100%)',
			}
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;
