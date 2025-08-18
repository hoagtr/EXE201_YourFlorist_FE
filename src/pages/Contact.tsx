import React from 'react';
import { MapPin, Phone, Mail, Clock, ArrowRight } from 'lucide-react';

const Contact: React.FC = () => {
  const contactInfo = [
    {
      icon: <MapPin className="text-florist-600" size={24} />,
      title: 'Visit Our Shop',
      details: [
        'Lô E2a-7, Đường D1',
        'Khu Công nghệ cao',
        'Phường Tăng Nhơn Phú, TPHCM'
      ]
    },
    {
      icon: <Phone className="text-florist-600" size={24} />,
      title: 'Call Us',
      details: [
        'Main: (84) 912 051 433',
      ]
    },
    {
      icon: <Mail className="text-florist-600" size={24} />,
      title: 'Email Us',
      details: [
        'General: dungpltse184549@fpt.edu.vn',
        'Orders: dungpltse184549@fpt.edu.vn',
        'Support: dungpltse184549@fpt.edu.vn'
      ]
    },
    {
      icon: <Clock className="text-florist-600" size={24} />,
      title: 'Business Hours',
      details: [
        'Mon - Fri: 9:00 AM - 7:00 PM',
        'Saturday: 9:00 AM - 6:00 PM',
        'Sunday: 10:00 AM - 4:00 PM'
      ]
    }
  ];

  const services = [
    'Wedding Flowers',
    'Event Decorations',
    'Corporate Arrangements',
    'Custom Bouquets',
    'Same-Day Delivery',
    'International Shipping'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-florist-50 via-white to-florist-100">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Contact Us</h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              We’re here to help with orders, custom arrangements, events and more. Reach out and our florists will get back to you within 24 hours.
            </p>
          </div>
        </div>
      </section>

      {/* Contact cards */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactInfo.map((info, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">{info.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{info.title}</h3>
                  <div className="space-y-1">
                    {info.details.map((d, i) => (
                      <p key={i} className="text-gray-600">{d}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Map + CTA */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.6100963026653!2d106.8073080747239!3d10.8411276574896!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752731176b07b1%3A0xb752b24b379bae5e!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBGUFQgVFAuSENN!5e0!3m2!1svi!2s!4v1704535200000!5m2!1svi!2s"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-[380px] lg:h-full"
              title="YourFlorist Location Map"
            />
          </div>

          <div className="rounded-xl border border-gray-200 p-8 shadow-sm bg-white flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Visit Our Studio</h2>
              <p className="text-gray-600 mb-6">
                Stop by to browse bouquets, discuss custom designs, or pick up your order. Parking available on site.
              </p>
              <ul className="list-disc ml-5 space-y-2 text-gray-700">
                <li>Consultations for weddings and events</li>
                <li>Same‑day pickup for selected items</li>
                <li>Friendly floral experts on hand</li>
              </ul>
            </div>
            <div className="mt-8">
              <a
                href="https://maps.google.com/maps?q=Lô+E2a-7,+Đường+D1,+Khu+Công+nghệ+cao,+Phường+Tăng+Nhơn+Phú,+TPHCM"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-5 py-3 rounded-lg bg-florist-500 text-white hover:bg-florist-600 transition-colors"
              >
                Open in Google Maps
                <ArrowRight size={18} className="ml-2" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="bg-florist-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Services</h3>
          <div className="flex flex-wrap gap-3">
            {services.map((s, i) => (
              <span key={i} className="inline-flex items-center px-3 py-1 rounded-full bg-white text-gray-700 border border-florist-200 shadow-sm">
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact; 