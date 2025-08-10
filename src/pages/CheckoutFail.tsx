import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';

const CheckoutFail: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <XCircle className="mx-auto h-16 w-16 text-red-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Order Failed
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We're sorry, but there was an issue processing your order. Please try again.
          </p>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Status:</span>
                <span className="text-sm text-red-600 font-medium">Failed</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Time:</span>
                <span className="text-sm text-gray-900">{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Common reasons for failure:
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Insufficient funds</li>
                  <li>Invalid payment information</li>
                  <li>Network connectivity issues</li>
                  <li>Server temporarily unavailable</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
                      <button
              onClick={() => navigate('/checkout')}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-florist-500 hover:bg-florist-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-florist-500"
            >
            Try Again
          </button>
          <button
            onClick={() => navigate('/cart')}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Return to Cart
          </button>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Still having issues? <button className="text-florist-600 hover:text-florist-500">Contact our support team</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutFail;
