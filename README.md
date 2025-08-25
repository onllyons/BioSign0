# BioSign - UI Prototype

A modern document signing application prototype with biometric authentication capabilities, built with React Native and Expo.

## 🎯 Overview

BioSign is a comprehensive UI prototype demonstrating a document management and digital signing workflow. This prototype showcases modern mobile app design patterns, accessibility features, and user experience best practices for document-centric applications.

## ✨ Features

### 📄 Document Management
- **Document Library**: Browse, search, filter, and sort documents
- **Document Viewer**: Preview documents with pagination
- **Upload Simulation**: Mock file upload with progress indicators
- **Document Details**: Comprehensive document information and activity logs

### ✍️ Digital Signing
- **Signing Workflow**: Multi-step signing process with confirmation
- **Biometric Setup**: Mock biometric enrollment and management
- **Signature Status**: Track signed, pending, and draft documents
- **Activity Timeline**: Complete audit trail of document interactions

### 👤 Profile Management
- **User Profile**: Avatar, contact information, and statistics
- **Profile Editing**: Update name, email, and avatar selection
- **Biometric Settings**: Enable/disable biometric authentication

### ⚙️ Settings & Preferences
- **Theme Control**: Light/dark theme with system theme support
- **User Preferences**: Customizable app behavior settings
- **Developer Options**: Error simulation for testing UI states

### 🎨 Design & UX
- **Modern UI**: Minimalist design inspired by DocuSign, 1Password, and Apple Wallet
- **Micro-interactions**: Haptic feedback, button animations, and loading states
- **Accessibility**: WCAG 2.1 AA compliant with proper labels and contrast
- **Responsive Design**: Optimized for various screen sizes

## 🏗️ Architecture

### Technology Stack
- **Framework**: React Native with Expo
- **Navigation**: Expo Router with tab-based navigation
- **State Management**: React Context for in-memory data store
- **Styling**: StyleSheet with custom theme system
- **Icons**: Ionicons and Lucide React Native
- **Animations**: React Native Animated API

### Project Structure
```
app/
├── (tabs)/                 # Tab-based navigation
│   ├── index.tsx          # Home screen
│   ├── documents/         # Document management
│   ├── profile/           # User profile
│   ├── settings.tsx       # App settings
│   ├── activity.tsx       # Activity timeline
│   └── demo.tsx          # UI component demo
├── _layout.tsx            # Root layout
└── +not-found.tsx         # 404 screen

components/
└── ui/                    # Reusable UI components
    ├── Button.tsx
    ├── Card.tsx
    ├── Input.tsx
    ├── Text.tsx
    └── ...

contexts/
├── ThemeContext.tsx       # Theme management
└── DataContext.tsx        # Data store

hooks/
└── useHaptics.ts         # Haptic feedback
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI (optional)

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Development
- **Web**: Opens automatically in browser
- **Mobile**: Use Expo Go app to scan QR code
- **Simulator**: Use iOS Simulator or Android Emulator

## 📱 Screens & Features

### Home Screen
- Quick actions for document creation and viewing
- Document statistics overview
- Clean, card-based layout

### Documents
- **List View**: Searchable, filterable document library
- **Detail View**: Comprehensive document information
- **Viewer**: Mock document preview with pagination
- **Upload**: Simulated file upload with progress
- **Signing**: Multi-step signing workflow

### Profile
- User information display
- Avatar customization (4 placeholder options)
- Document statistics
- Profile editing modal

### Settings
- **Appearance**: Theme toggle and system theme option
- **Preferences**: User behavior settings
- **Developer**: Error simulation toggle
- **About**: App information and version

### Activity
- Cross-document activity timeline
- Filterable by activity type
- Detailed event information

## 🎨 Design System

### Theme
- **Light/Dark Modes**: Automatic system theme support
- **Color Palette**: Primary, secondary, success, error variants
- **Typography**: 4 text variants with proper hierarchy
- **Spacing**: 8px grid system (xs: 4px to xxl: 48px)

### Components
- **Cards**: Rounded corners with soft shadows
- **Buttons**: 4 variants (primary, secondary, outline, ghost)
- **Inputs**: Focus states with validation
- **Modals**: Bottom sheet style with backdrop
- **Lists**: Interactive items with proper spacing

### Accessibility
- **WCAG 2.1 AA**: Compliant color contrast ratios
- **Screen Readers**: Proper labels and roles
- **Touch Targets**: Minimum 44px with hitSlop
- **Keyboard Navigation**: Full keyboard support

## 🔧 Mock Data

### Documents
- 5 sample documents with realistic data
- Version history and activity logs
- Mixed signing status (signed, pending, draft)

### Activity Events
- Upload, view, sign, share, delete events
- Timestamps and device information
- Cross-document activity feed

### User Preferences
- Theme settings
- Behavioral preferences
- All stored in memory (session-only)

## 🧪 Testing Features

### Error Simulation
- Toggle in Settings → Developer
- Shows error states across the app
- Tests error handling and retry flows

### Loading States
- Skeleton loaders for lists
- Progress indicators for uploads
- Pull-to-refresh animations

### Haptic Feedback
- Simulated haptic responses
- Different intensities for various actions
- Console logging for web development

## 📋 Limitations

This is a **UI prototype** with the following limitations:
- **No Backend**: All data is in-memory only
- **No Persistence**: Data resets on app restart
- **No Real Authentication**: Mock biometric setup
- **No File System**: Simulated document upload/storage
- **No Network**: All operations are local

## 🎯 Use Cases

Perfect for:
- **Design Reviews**: Showcase UI/UX patterns
- **Client Presentations**: Demonstrate app concepts
- **Development Planning**: Reference implementation
- **Accessibility Testing**: Screen reader compatibility
- **User Testing**: Gather feedback on workflows

## 🔮 Future Enhancements

Potential additions for a production version:
- Real backend integration
- Actual biometric authentication
- File system access
- Cloud storage integration
- Push notifications
- Offline support
- Advanced document editing

## 📄 License

This is a UI prototype for demonstration purposes.

---

**BioSign** - Modern document signing made simple.