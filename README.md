# 🚀 Selvin PaulRaj - Full-Stack Developer Portfolio

[![Next.js](https://img.shields.io/badge/Next.js-14.0.4-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

> A modern, responsive, and feature-rich portfolio website showcasing full-stack development expertise with cutting-edge technologies and optimal performance.

## 🌟 Live Demo

**[Visit Portfolio →](https://selvinpaulraj.vercel.app)**

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🏗️ Architecture](#️-architecture)
- [⚡ Performance](#-performance)
- [🚀 Getting Started](#-getting-started)
- [📁 Project Structure](#-project-structure)
- [🔧 Development](#-development)
- [🌐 Deployment](#-deployment)
- [📱 Responsive Design](#-responsive-design)
- [🎨 Theme & Styling](#-theme--styling)
- [📧 Contact Integration](#-contact-integration)
- [🔍 SEO & Analytics](#-seo--analytics)
- [👨‍💻 About the Developer](#-about-the-developer)
- [📄 License](#-license)

## ✨ Features

### 🎯 Core Functionality
- **Interactive Portfolio Sections**: Intro, About, Projects, Skills, Experience, Contact
- **Dynamic Project Showcase**: 3 featured projects with live demos and source code
- **Professional Experience Timeline**: Detailed work history with animations
- **Skills Visualization**: Comprehensive technical skills display
- **Contact Form**: Integrated email functionality with React Email and Resend

### 🎨 User Experience
- **Dark/Light Theme Toggle**: Persistent theme switching with smooth transitions
- **Smooth Animations**: Framer Motion powered interactions and page transitions
- **Responsive Design**: Mobile-first approach with optimal viewing on all devices
- **Interactive Elements**: Hover effects, scroll animations, and dynamic content
- **Performance Optimized**: Image optimization, lazy loading, and code splitting

### 🔧 Technical Features
- **Server-Side Rendering**: Next.js 14 with App Router for optimal SEO
- **TypeScript Integration**: Type-safe development with comprehensive type definitions
- **Modern React Patterns**: Custom hooks, context providers, and functional components
- **Code Quality**: ESLint configuration with Next.js best practices
- **Analytics Integration**: Vercel Analytics and Speed Insights
- **Accessibility**: WCAG compliant with semantic HTML and ARIA labels

## 🛠️ Tech Stack

### Frontend Core
```typescript
- Next.js 14.0.4          // React framework with App Router
- React 18               // UI library with latest features
- TypeScript 5           // Type-safe JavaScript
- Tailwind CSS 3.3       // Utility-first CSS framework
```

### Animation & Interaction
```typescript
- Framer Motion 10.16.16 // Advanced animations and gestures
- React Intersection Observer // Scroll-based animations
- React Vertical Timeline // Experience timeline component
```

### Communication & Forms
```typescript
- React Email 0.0.12     // Email template components
- Resend 2.1.0          // Email delivery service
- React Hot Toast 2.4.1  // Toast notifications
```

### Icons & Assets
```typescript
- React Icons 4.12.0     // Comprehensive icon library
- Next.js Image          // Optimized image loading
- Custom SVG assets      // Performance-optimized graphics
```

### Analytics & Monitoring
```typescript
- Vercel Analytics 1.3.1   // User analytics and insights
- Vercel Speed Insights 1.0.14 // Performance monitoring
- Microsoft Clarity        // User behavior analytics
```

### Development Tools
```typescript
- ESLint 8              // Code linting and quality
- PostCSS 8             // CSS processing
- Autoprefixer 10       // CSS vendor prefixing
```

## 🏗️ Architecture

### Component Architecture
```
├── 📱 App Router (Next.js 14)
│   ├── 🎨 Layout Components
│   │   ├── Header (Navigation)
│   │   ├── Footer (Links & Info)
│   │   └── ThemeSwitch (Dark/Light)
│   ├── 📄 Page Sections
│   │   ├── Intro (Hero Section)
│   │   ├── About (Personal Info)
│   │   ├── Projects (Portfolio)
│   │   ├── Skills (Technical Stack)
│   │   ├── Experience (Timeline)
│   │   └── Contact (Form & Links)
│   └── 🔧 Utility Components
│       ├── SectionHeading
│       ├── SectionDivider
│       └── SubmitBtn
├── 🔄 Context Providers
│   ├── ActiveSectionContext
│   └── ThemeContext
├── 🎯 Custom Hooks
│   ├── useSectionInView
│   └── useActiveSectionContext
└── 📊 Data Layer
    ├── Static Content (lib/data.tsx)
    ├── Type Definitions (lib/types.ts)
    └── Utility Functions (lib/utils.ts)
```

### State Management Pattern
- **Context API**: Global state for theme and active section tracking
- **React Hooks**: Local component state and side effects
- **Custom Hooks**: Reusable stateful logic for section visibility
- **TypeScript**: Compile-time type safety and IntelliSense

## ⚡ Performance

### Optimization Strategies
- **Static Generation**: Pre-rendered pages for instant loading
- **Image Optimization**: Next.js Image component with lazy loading
- **Code Splitting**: Dynamic imports for non-critical components
- **Bundle Analysis**: Optimized bundle size (149kB total)
- **Caching**: Aggressive caching strategies for static assets

### Performance Metrics
```bash
# Build Output
Route (app)                              Size     First Load JS
┌ ○ /                                    18.6 kB         149 kB
└ ○ /_not-found                          869 B          82.8 kB
+ First Load JS shared by all            82 kB
```

### SEO & Meta Optimization
- **Structured Data**: JSON-LD schema for rich snippets
- **Open Graph**: Social media preview optimization
- **Twitter Cards**: Enhanced Twitter sharing experience
- **Meta Tags**: Comprehensive SEO meta information
- **Sitemap**: Automatic sitemap generation

## 🚀 Getting Started

### Prerequisites
```bash
Node.js 18+ and npm or yarn package manager
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/selvin-paul-raj/dev_portfolio.git
cd dev_portfolio
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Required environment variables:
```env
# Email Service (Resend)
RESEND_API_KEY=your_resend_api_key

# Analytics (Optional)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id
```

4. **Run the development server**
```bash
npm run dev
# or
yarn dev
```

5. **Open in browser**
```
http://localhost:3000
```

### Quick Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint checks
```

## 📁 Project Structure

```
dev_portfolio/
├── 📱 app/                    # Next.js App Router
│   ├── favicon.ico           # Site favicon
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout component
│   ├── page.tsx             # Home page component
│   └── profile.jpg          # Profile image
├── 🧩 components/            # React components
│   ├── About.tsx            # About section
│   ├── Contact.tsx          # Contact form
│   ├── Experience.tsx       # Experience timeline
│   ├── Footer.tsx           # Site footer
│   ├── Header.tsx           # Navigation header
│   ├── Intro.tsx            # Hero section
│   ├── Project.tsx          # Individual project card
│   ├── Projects.jsx         # Projects section
│   ├── SectionDivider.tsx   # Visual dividers
│   ├── SectionHeading.tsx   # Section titles
│   ├── Skills.tsx           # Skills display
│   ├── SocialLinks.tsx      # Social media links
│   ├── SubmitBtn.tsx        # Form submit button
│   └── ThemeSwitch.tsx      # Theme toggle
├── 🎯 context/               # React Context providers
│   ├── active-section-context.tsx  # Active section tracking
│   └── theme-context.tsx           # Theme management
├── 📧 email/                 # Email templates
├── 📚 lib/                   # Utility libraries
│   ├── data.tsx             # Static content data
│   ├── hooks.ts             # Custom React hooks
│   ├── types.ts             # TypeScript definitions
│   └── utils.ts             # Utility functions
├── 🖼️ public/               # Static assets
│   ├── aicalculator.png     # Project screenshot
│   ├── speedtype.png        # Project screenshot
│   ├── troothview.png       # Project screenshot
│   ├── SPR_Resume.pdf       # Resume document
│   └── selvinpaulrajK_profile.png  # Profile images
├── 🎬 actions/              # Server actions
│   └── sendEmails.ts        # Email sending logic
├── 🛠️ utils/                # Utility functions
│   └── calculateDuration.js # Date calculations
├── ⚙️ Configuration Files
│   ├── .eslintrc.json       # ESLint configuration
│   ├── .gitignore          # Git ignore patterns
│   ├── next.config.js      # Next.js configuration
│   ├── package.json        # Dependencies and scripts
│   ├── postcss.config.js   # PostCSS configuration
│   ├── tailwind.config.ts  # Tailwind CSS configuration
│   └── tsconfig.json       # TypeScript configuration
```

## 🔧 Development

### Code Quality Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Next.js recommended configuration
- **Prettier**: Code formatting (configured in VS Code settings)
- **Component Architecture**: Functional components with hooks
- **Custom Hooks**: Reusable stateful logic extraction

### Development Workflow
```bash
1. Feature Development
   ├── Create feature branch
   ├── Implement component/feature
   ├── Add TypeScript types
   ├── Test functionality
   └── Run lint checks

2. Testing & Quality
   ├── npm run lint          # Code quality check
   ├── npm run build         # Production build test
   └── Manual testing        # UI/UX verification

3. Deployment
   ├── Merge to main branch
   ├── Automatic Vercel deployment
   └── Production verification
```

### Adding New Sections
```typescript
// 1. Create component in /components
export default function NewSection() {
  const { ref } = useSectionInView("NewSection", 0.5);
  return <section ref={ref} id="newsection">...</section>;
}

// 2. Add to navigation in /lib/data.tsx
export const links = [
  // ... existing links
  {
    name: "NewSection",
    hash: "#newsection",
    icon: <YourIcon />,
  },
];

// 3. Import and use in /app/page.tsx
import NewSection from "@/components/NewSection";
```

## 🌐 Deployment

### Vercel Deployment (Recommended)
The project is optimized for Vercel deployment with automatic:
- **Build Pipeline**: Automatic builds on git push
- **Environment Variables**: Secure environment management
- **Analytics**: Built-in performance monitoring
- **Domain Management**: Custom domain support

### Manual Deployment Steps
```bash
1. Build the application
   npm run build

2. Test production build locally
   npm run start

3. Deploy to Vercel
   npx vercel --prod

4. Configure environment variables
   - RESEND_API_KEY
   - Any additional API keys
```

### Alternative Deployment Platforms
- **Netlify**: Full static site support
- **AWS Amplify**: Enterprise-grade hosting
- **GitHub Pages**: Static deployment option
- **Railway**: Full-stack deployment

## 📱 Responsive Design

### Breakpoint Strategy
```css
/* Mobile First Approach */
sm: '640px'     // Tablets
md: '768px'     // Small laptops
lg: '1024px'    // Laptops
xl: '1280px'    // Desktops
2xl: '1536px'   // Large screens
```

### Component Responsiveness
- **Navigation**: Collapsible mobile menu
- **Project Cards**: Responsive grid layout
- **Timeline**: Adaptive vertical/horizontal layout
- **Images**: Optimized for all screen sizes
- **Typography**: Scalable text hierarchy

## 🎨 Theme & Styling

### Design System
```typescript
// Color Palette
Primary: #805c8b (Purple)
Secondary: #CDECFF (Light Blue)
Background Light: #FAFAF9
Background Dark: #000000
Text Light: #374151
Text Dark: #f3f4f6
```

### Theme Implementation
- **CSS Variables**: Dynamic theme switching
- **Tailwind Classes**: Conditional dark mode classes
- **Local Storage**: Theme preference persistence
- **System Preference**: Automatic OS theme detection

### Animation Library
```typescript
// Framer Motion Configurations
Initial: { opacity: 0, y: 100 }
Animate: { opacity: 1, y: 0 }
Transition: { delay: 0.175 }
```

## 📧 Contact Integration

### Email Service Setup
The contact form uses **Resend** for reliable email delivery:

```typescript
// Required Environment Variables
RESEND_API_KEY=re_xxxxxxxxx

// Email Configuration
From: noreply@yourdomain.com
To: selvinpaulrajk@gmail.com
Template: React Email components
```

### Form Features
- **Validation**: Client-side form validation
- **Toast Notifications**: Success/error feedback
- **Rate Limiting**: Spam prevention
- **Accessibility**: Screen reader compatible

## 🔍 SEO & Analytics

### SEO Optimization
```typescript
// Metadata Configuration
Title: "Selvin PaulRaj | Full-Stack MERN Developer Portfolio"
Description: "Explore the portfolio of Selvin PaulRaj K..."
Keywords: ["Full-stack Developer", "MERN Stack", "React", "Next.js"]
OpenGraph: Social media optimization
StructuredData: JSON-LD schema markup
```

### Analytics Integration
- **Vercel Analytics**: User behavior tracking
- **Speed Insights**: Performance monitoring
- **Microsoft Clarity**: Heatmap and session recordings
- **Google Verification**: Search Console integration

## 👨‍💻 About the Developer

**Selvin PaulRaj K** - Full-Stack MERN Developer

### 🎓 Education
- **B.Tech Information Technology** - DMI College of Engineering (CGPA: 8.4)

### 💼 Professional Experience
- **Founder & CEO** - GenXRverse (Mar 2024 - Present)
- **Python Development Intern** - OCTANET SERVICES PVT LTD
- **Web Development Intern** - VERITECH SOFTWARE IT SERVICES
- **Full Stack Intern** - SERVIMOS TECHNOLOGIES PVT LTD

### 🚀 Featured Projects
1. **AI Calculator** - Next.js 15 + TypeScript + Gemini AI
2. **TroothView** - React + AI Image Verification + Chart.js
3. **Speed Typing** - React + TypeScript + Framer Motion + Jest

### 🛠️ Technical Skills
**Frontend**: HTML5, CSS3, JavaScript, TypeScript, React, Next.js, Tailwind CSS
**Backend**: Node.js, Express.js, Python, Flask
**Database**: MongoDB, MySQL
**Tools**: Git, VS Code, Postman, Vercel
**Other**: Redux, Framer Motion, REST APIs, Responsive Design

### 📱 Connect
- **Website**: [selvinpaulraj.vercel.app](https://selvinpaulraj.vercel.app)
- **LinkedIn**: [selvinpaulrajK](https://linkedin.com/in/selvinpaulrajK)
- **GitHub**: [selvin-paul-raj](https://github.com/selvin-paul-raj)
- **Email**: selvinpaulrajk@gmail.com

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/selvin-paul-raj/dev_portfolio/issues).

### 🌟 Show Your Support

Give a ⭐️ if this project helped you or if you found it interesting!

---

<div align="center">

**Built with ❤️ by [Selvin PaulRaj](https://selvinpaulraj.vercel.app)**

*Showcasing modern web development with Next.js, TypeScript, and cutting-edge technologies*

</div>