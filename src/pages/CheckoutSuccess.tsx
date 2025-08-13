import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const CheckoutSuccess: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-gray-200 rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mx-auto w-20 h-20 bg-florist-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-12 w-12 text-florist-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Checkout Successful!
            </h2>
            <p className="text-gray-600 max-w-sm mx-auto">
              Thank you for your order. We've received your payment and will process your flowers soon.
            </p>
          </div>
          
          <div className="mt-8 space-y-4">
            <div className="bg-florist-50 border border-florist-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-florist-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-florist-800">
                    Order Confirmed
                  </h3>
                  <div className="mt-1 text-sm text-florist-700">
                    <p>
                      You will receive an email confirmation with your order details and tracking information.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-3">
              <Link
                to="/orders"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-florist-500 hover:bg-florist-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-florist-500 transition-colors"
              >
                View My Orders
              </Link>
              
              <Link
                to="/products"
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-florist-500 transition-colors"
              >
                Continue Shopping
              </Link>
              
              <Link
                to="/"
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-florist-500 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
