import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Flower, Heart, Award, Users, MapPin, Phone, Mail, Clock, Star } from 'lucide-react';

const About: React.FC = () => {
  const navigate = useNavigate();

  const teamMembers = [
    {
      name: 'Sarah Johnson',
      role: 'Founder & Lead Florist',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
      bio: 'With over 15 years of experience in floral design, Sarah brings creativity and passion to every arrangement.'
    },
    {
      name: 'Michael Chen',
      role: 'Senior Florist',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      bio: 'Specializing in wedding and event arrangements, Michael creates stunning designs that capture special moments.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Customer Experience Manager',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
      bio: 'Emily ensures every customer receives personalized service and finds the perfect flowers for their needs.'
    }
  ];

  const values = [
    {
      icon: <Flower className="text-florist-500" size={32} />,
      title: 'Quality & Freshness',
      description: 'We source only the freshest flowers from local growers and premium suppliers worldwide.'
    },
    {
      icon: <Heart className="text-florist-500" size={32} />,
      title: 'Passion & Creativity',
      description: 'Our team of expert florists brings creativity and passion to every arrangement we create.'
    },
    {
      icon: <Award className="text-florist-500" size={32} />,
      title: 'Excellence',
      description: 'We strive for excellence in every aspect of our service, from design to delivery.'
    },
    {
      icon: <Users className="text-florist-500" size={32} />,
      title: 'Community',
      description: 'We\'re proud to be part of our local community and support local growers and businesses.'
    }
  ];

  const stats = [
    { number: '10+', label: 'Years of Experience' },
    { number: '5000+', label: 'Happy Customers' },
    { number: '1000+', label: 'Events Decorated' },
    { number: '50+', label: 'Flower Varieties' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-florist-50 to-florist-100 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Our Story
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Founded in 2014, YourFlorist has been bringing beauty and joy to our community 
              through carefully crafted floral arrangements and exceptional service.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">How It All Began</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                What started as a small passion project in Sarah's garage has grown into one of the 
                most trusted florist shops in the region. Our journey began with a simple belief: 
                that flowers have the power to transform any moment into something extraordinary.
              </p>
              <p>
                Today, we're proud to serve thousands of customers, creating beautiful arrangements 
                for weddings, corporate events, and everyday moments that matter. Our commitment to 
                quality, creativity, and customer service remains at the heart of everything we do.
              </p>
              <p>
                We work closely with local growers and premium suppliers to ensure we always have 
                the freshest, most beautiful flowers available. Every arrangement is handcrafted by 
                our expert team with attention to detail and a passion for floral design.
              </p>
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1562690868-60bbe7293e94?w=600&h=400&fit=crop"
              alt="Our flower shop"
              className="rounded-lg shadow-lg"
            />
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg">
              <div className="flex items-center space-x-2">
                <Star className="text-yellow-400" size={20} />
                <span className="font-semibold text-gray-900">4.9/5</span>
                <span className="text-gray-600">Customer Rating</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-florist-50 rounded-lg p-8 mb-20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Numbers</h2>
            <p className="text-gray-600">Proud milestones that reflect our commitment to excellence</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-florist-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These core values guide everything we do and help us deliver exceptional experiences to our customers.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our passionate team of florists and customer service experts are here to help you 
              find the perfect flowers for every occasion.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-florist-600 mb-3">{member.role}</p>
                <p className="text-gray-600">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-gray-50 rounded-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Visit Our Shop</h2>
            <p className="text-gray-600">We'd love to meet you in person and help you find the perfect flowers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center space-x-3">
              <MapPin className="text-florist-500" size={24} />
              <div>
                <h3 className="font-semibold text-gray-900">Address</h3>
                <p className="text-gray-600">123 Flower Street<br />Garden City, GC 12345</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="text-florist-500" size={24} />
              <div>
                <h3 className="font-semibold text-gray-900">Phone</h3>
                <p className="text-gray-600">(555) 123-4567</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="text-florist-500" size={24} />
              <div>
                <h3 className="font-semibold text-gray-900">Email</h3>
                <p className="text-gray-600">hello@yourflorist.com</p>
              </div>
            </div>
          </div>
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Clock className="text-florist-500" size={20} />
              <span className="font-semibold text-gray-900">Business Hours</span>
            </div>
            <p className="text-gray-600">
              Monday - Friday: 9:00 AM - 7:00 PM<br />
              Saturday: 9:00 AM - 6:00 PM<br />
              Sunday: 10:00 AM - 4:00 PM
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Experience the Difference?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Browse our collection of beautiful flowers and arrangements, or contact us for custom designs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/products')}
              className="bg-florist-500 text-white px-8 py-3 rounded-lg hover:bg-florist-600 transition-colors"
            >
              Browse Our Collection
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="border border-florist-500 text-florist-500 px-8 py-3 rounded-lg hover:bg-florist-50 transition-colors"
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 