# RoadTrip Convoy - SaaS Development Specification

## 🎯 Project Overview
A web application for organizing road trip convoys where car owners can create trips and invite specific car brands/models to join them for coordinated group drives.

## 🚗 Core Concept
- **Target Users**: Car owners who want to organize or join road trip convoys
- **Value Proposition**: Connect car enthusiasts for coordinated road trips with compatible vehicles
- **Key Feature**: Granular car filtering for trip invitations (e.g., Audi Q5 owner can invite only Q5 and SQ5, or all Audis)

## 📋 Functional Requirements

### 1. User Registration & Authentication
- **Registration Fields**:
  - Full Name
  - Phone Number (for SMS notifications)
  - Car Brand (dropdown: Toyota, Honda, BMW, Mercedes, Audi, Ford, Chevrolet, Nissan, Hyundai, Subaru, etc.)
  - Car Model (dynamic dropdown based on brand selection)
  - Car Type/Category (Sedan, SUV, Hatchback, Truck, Sports Car, Coupe, Convertible, Van)
- **Car Verification**: 
  - Photo upload (minimum 2 photos: exterior and interior/dashboard)
  - Simple verification system for MVP
- **Account Tiers**: Free, Premium Monthly ($10), Premium Yearly ($96 - 20% discount)

### 2. Car Database Structure
```
Brand > Model > Variants
Examples:
- Audi > Q5 > [Q5, SQ5, Q5 Sportback]
- BMW > 3 Series > [320i, 330i, M3]
- Toyota > Camry > [Camry LE, Camry XSE, Camry TRD]
```

### 3. Trip Creation System
- **Trip Details**:
  - Trip Title
  - Destination
  - Departure Date (minimum 3 days in advance)
  - Meeting Point/Address
  - Description
  - Maximum Capacity: 30 cars
- **Advanced Car Selection**:
  - **Option 1**: Select specific models (e.g., only Audi Q5, SQ5)
  - **Option 2**: Select entire brand (e.g., all Audis)
  - **Option 3**: Select by car type (e.g., all SUVs)
  - **Option 4**: Mixed selection (e.g., all BMWs + Toyota Prius + all Sports Cars)
- **Notification System**: Only users with selected car brands/models receive trip notifications

### 4. Trip Browsing & Joining
- **Trip Display**:
  - Trip details card with all information
  - "X/30 spots remaining" indicator
  - Compatible car tags showing what cars can join
  - Organizer information
- **Eligibility Logic**:
  - User can only join if their car matches trip criteria
  - Show "Not Eligible" for incompatible cars
  - Show "Join Trip" button for eligible users
- **Joining Process**: One-click join with SMS confirmation

### 5. User Dashboard/Profile
- **Statistics Display**:
  - Trips Created
  - Trips Joined  
  - Points Earned
  - Current Tier Status
  - Monthly Usage (for free tier limits)
- **Car Information**: Display registered car with photos
- **Tier Management**: Upgrade options and current limits

### 6. Tier System & Limitations
- **Free Tier**:
  - Can join unlimited trips
  - Can create 1 trip per month
  - Receives maximum 2 trip notifications per month
  - Cannot start trips (only join)
- **Premium Tiers**:
  - Unlimited trip creation
  - Unlimited notifications
  - Priority support (future feature)
  - Advanced filtering options (future)

### 7. Notification System (MVP: Simulated)
- SMS notifications to eligible car owners when new trips are created
- Trip reminders 24 hours before departure
- Join confirmations and trip updates

## 🎨 UI/UX Requirements

### Design Principles
- **Simple & Intuitive**: Easy for non-tech-savvy car enthusiasts
- **Mobile-First**: Responsive design for mobile and desktop
- **Car-Themed**: Use automotive colors, icons, and terminology
- **Fun & Engaging**: Vibrant colors, smooth interactions

### Key Pages/Screens
1. **Landing/Registration Page**
2. **Trip Browser** (main dashboard)
3. **Create Trip Form**
4. **User Profile/Dashboard**
5. **Trip Details View**

### Visual Elements
- Gradient backgrounds (automotive-inspired colors)
- Car emojis and icons
- Modern card-based layouts
- Clear CTAs with hover effects
- Progress indicators for multi-step forms

## 🛠 Technical Specifications

### Frontend Technology Stack
- **Framework**: React with hooks (useState, useEffect)
- **Styling**: Tailwind CSS (core utilities only)
- **File Structure**:
  ```
  src/
    components/
      Auth/
      Trips/
      Profile/
      Common/
    pages/
    hooks/
    utils/
    data/
  ```

### Data Management
- **State Management**: React hooks (no external libraries for MVP)
- **Data Storage**: Local state (no localStorage/sessionStorage due to Claude restrictions)
- **Sample Data**: Include realistic sample trips and users for demo

### Core Components Needed
- `RegistrationForm`
- `TripCreationForm`
- `TripCard`
- `TripBrowser`
- `UserProfile`
- `CarSelector` (hierarchical dropdown)
- `TierManager`
- `NotificationCenter`

## 📊 Data Models

### User Model
```javascript
{
  id: string,
  name: string,
  phone: string,
  carBrand: string,
  carModel: string,
  carType: string,
  photos: string[],
  tier: 'free' | 'premium_monthly' | 'premium_yearly',
  stats: {
    tripsCreated: number,
    tripsJoined: number,
    points: number,
    monthlyTrips: number,
    notificationsReceived: number
  },
  createdAt: string
}
```

### Trip Model
```javascript
{
  id: string,
  organizerId: string,
  organizer: string,
  title: string,
  destination: string,
  departureDate: string,
  meetingPoint: string,
  description: string,
  eligibleCars: {
    brands: string[], // ['Audi', 'BMW']
    models: string[], // ['Q5', 'SQ5', '320i']
    types: string[]   // ['SUV', 'Sports Car']
  },
  participants: string[], // user IDs
  maxCapacity: 30,
  status: 'open' | 'full' | 'completed',
  createdAt: string
}
```

### Car Database Model
```javascript
const carDatabase = {
  'Audi': {
    'Q5': ['Q5', 'SQ5', 'Q5 Sportback'],
    'A4': ['A4', 'S4', 'RS4'],
    'Q7': ['Q7', 'SQ7'],
    // ...
  },
  'BMW': {
    '3 Series': ['320i', '330i', '340i', 'M3'],
    'X5': ['X5', 'X5 M'],
    // ...
  }
  // ...
}
```

## 🚀 Implementation Phases

### Phase 1: MVP Core Features
- [ ] User registration with car details
- [ ] Basic trip creation and browsing
- [ ] Simple car filtering (brand + type level)
- [ ] Join trip functionality
- [ ] User profile with stats
- [ ] Tier system with basic limitations

### Phase 2: Enhanced Features
- [ ] Granular model-level filtering
- [ ] Photo verification system
- [ ] SMS integration
- [ ] Trip completion and rating system
- [ ] Points system with rewards

### Phase 3: Advanced Features
- [ ] Real-time chat during trips
- [ ] Route planning integration
- [ ] Payment processing for premium tiers
- [ ] Mobile app development
- [ ] Advanced analytics

## 🧪 Testing Requirements

### Key Test Scenarios
1. **Registration Flow**: Complete car owner registration
2. **Trip Creation**: Create trip with specific car filters
3. **Eligibility Logic**: Verify only compatible cars can join
4. **Tier Limitations**: Test free tier restrictions
5. **Capacity Management**: Test 30-car limit
6. **Responsive Design**: Test on mobile and desktop

### Sample Data Requirements
- 10+ sample users with diverse car brands/models
- 5+ sample trips with different car requirements
- Mix of free and premium users
- Trips at various capacity levels

## 🔧 Development Notes

### Specific Implementation Details
1. **Car Selection Interface**: 
   - Hierarchical dropdowns: Brand → Model → Variant
   - Checkbox system for trip creation: "All Audis" vs specific models
   - Visual indicators for selection scope

2. **Notification Logic**:
   - When trip is created, query users matching eligible cars
   - Respect tier limits (free users: max 2 notifications/month)
   - Simulate SMS sending for MVP

3. **Eligibility Checking**:
   - User can join if their car matches ANY of the trip's eligible criteria
   - Clear messaging when user is not eligible

4. **Tier Enforcement**:
   - Block trip creation for free users at monthly limit
   - Show upgrade prompts at appropriate times

### Code Quality Requirements
- Clean, readable code with proper commenting
- Responsive design using Tailwind utilities
- Error handling for all user actions
- Loading states and user feedback
- Accessibility considerations

## 🎯 Success Metrics
- User registration completion rate
- Trip creation to join ratio  
- Average participants per trip
- Free to premium conversion rate
- User engagement (return visits)

---

**Note for Claude Code**: This specification is designed for a single-page React application. Focus on creating a clean, functional MVP that demonstrates all core features. Use sample data to populate the application so users can immediately see and test functionality.