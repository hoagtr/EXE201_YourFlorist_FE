# YourFlorist - Flower Shop Application

A modern, responsive flower shop application built with React, TypeScript, and Tailwind CSS.

## Features

- **Product Catalog**: Browse and search through beautiful flower arrangements
- **Bouquet Details**: View detailed information about each bouquet including flower compositions
- **Shopping Cart**: Add products to cart and manage quantities
- **User Authentication**: Secure login and registration system
- **Order Management**: Track your orders and view order history
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Bouquet API Integration

The application now integrates with the custom florist bouquet API to provide detailed information about each flower arrangement:

### API Endpoint
- **GET** `/custom-florist/api/v1/bouquets/{id}` - Retrieve detailed bouquet information

### Bouquet Data Structure
Each bouquet includes:
- Basic information (name, description, price, image)
- Category details (name, description)
- Flower compositions with quantities and constraints
- Active status and availability

### Features
- **Automatic Fallback**: If a bouquet is not found, the system falls back to regular product lookup
- **Rich Display**: Shows flower composition details, category information, and pricing
- **Seamless Integration**: Works with existing cart and checkout functionality

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Start the development server: `npm start`

### Environment Variables
Create a `.env` file with:
```
REACT_APP_API_URL=https://flourist-gkf7c9aefxcxb4ck.eastasia-01.azurewebsites.net/custom-florist/api/v1
```

## Usage

1. **Browse Products**: Navigate to the products page to see all available flower arrangements
2. **View Details**: Click on any product to see detailed information including flower compositions
3. **Add to Cart**: Use the quantity selector and add products to your shopping cart
4. **Checkout**: Complete your purchase with the streamlined checkout process

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **State Management**: React Context API
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Build Tool**: Create React App

## Project Structure

```
src/
├── components/          # Reusable UI components
├── context/            # React Context providers
├── pages/              # Page components
├── services/           # API service layer
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## API Integration

The application integrates with multiple API endpoints:
- **Authentication**: User login, registration, and profile management
- **Products**: Product catalog and details
- **Bouquets**: Detailed bouquet information with compositions
- **Categories**: Product categorization
- **Orders**: Order creation and management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
