import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Flower, Heart, Award, Users, MapPin, Phone, Mail, Clock, Star } from 'lucide-react';

const About: React.FC = () => {
  const navigate = useNavigate();

  const teamMembers = [
    {
      name: 'Phạm Lê Thành Dũng',
      role: 'CEO',
      image: 'https://scontent.fsgn2-6.fna.fbcdn.net/v/t39.30808-6/475568506_594519550031147_5757941264677618393_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeHuP_F0xCymP_IWQ2rmQg2ICfQWK-T0px4J9BYr5PSnHvKpEJI-c2lVj2zMEjkz593ftvmq6MbQSFssOo6whJe3&_nc_ohc=dwol7gPikX8Q7kNvwH31TzE&_nc_oc=AdkPra78vR7T4jOBN7SeIas3UF1oHlt33UwErazuy8Jz2yPxMw2qGXFCnISrwRXOyIo&_nc_zt=23&_nc_ht=scontent.fsgn2-6.fna&_nc_gid=1snoeLN6zm9tcMinxPrP_A&oh=00_AfVGTovtueHINAJTuaHh9lT5RAnV31lXr9KYnK5UknObtw&oe=68993A72'
    },
    {
      name: 'Trương Nguyễn Đăng Khoa ',
      role: 'COO',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face'
    },
    {
      name: 'Trần Minh Hoàng',
      role: 'IT System Administrator',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
    },
    {
      name: 'Trần Anh Toàn',
      role: 'Sales Manager',
      image: 'https://scontent.fsgn2-11.fna.fbcdn.net/v/t39.30808-6/485830085_3839499696312943_1887980360961012277_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeGiXmW9JfoMi7MBu0wNAYPQQIg8jsMSMdNAiDyOwxIx0x2f74ppcwS-hcWkOg-S1AHcNCC-dbl0QNW5W72U__bs&_nc_ohc=UAdsZn6OkjQQ7kNvwHJQ1Fv&_nc_oc=AdmnMW7PvDLUJKuzZ8WrYE09hdDfo_jfDCBo6jZD2H8DJEVPXgrLouvrfcPpjouR3DIBVFA3q7_DeQ8HiFmIzHLp&_nc_zt=23&_nc_ht=scontent.fsgn2-11.fna&_nc_gid=3nfeMCgTIhj1CsrPs0yM9g&oh=00_AfWq_C-lT65iEI5eAZLy2fa27_tRG8a0cjNi0J_L20YXHg&oe=68992DC9'
    },
    {
      name: 'Phạm Thế Hiển',
      role: 'Marketing Manager',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face'
    }
  ];

  const values = [
    {
      icon: <Flower className="text-florist-500" size={32} />,
      title: 'Personalization & Quality',
      description: 'We provide fresh, premium flowers with complete customization options to create your perfect arrangement.'
    },
    {
      icon: <Heart className="text-florist-500" size={32} />,
      title: 'Emotional Connection',
      description: 'Every bouquet tells a story. We help you express your deepest emotions through personalized floral designs.'
    },
    {
      icon: <Award className="text-florist-500" size={32} />,
      title: 'Innovation & Excellence',
      description: 'Our cutting-edge customization platform combines technology with traditional florist expertise.'
    },
    {
      icon: <Users className="text-florist-500" size={32} />,
      title: 'Customer Empowerment',
      description: 'We believe customers should have full control over their floral experience, from selection to final arrangement.'
    }
  ];

  const stats = [
    { number: '2025', label: 'Year Founded' },
    { number: '1000+', label: 'Custom Arrangements' },
    { number: '500+', label: 'Happy Customers' },
    { number: '100+', label: 'Flower Varieties' }
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
              Founded in 2025, YourFlorist was born from the vision to help customers create personalized floral arrangements that tell their unique stories and express their deepest emotions.
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
                What started as an innovative idea in 2025 has evolved into a revolutionary platform that empowers customers to customize every detail of their floral arrangements. Our journey began with a simple belief: that every bouquet should tell a personal story and convey the exact emotions you want to express.
              </p>
              <p>
                Today, we're proud to offer a unique customization experience where customers can handpick each flower, color, and arrangement style to create something truly meaningful. Whether it's celebrating love, friendship, sympathy, or joy, our platform helps you craft the perfect floral message that speaks from the heart.
              </p>
              <p>
                We believe that flowers are more than just beautiful decorations - they are a language of emotions. Through our innovative customization tools and carefully curated selection of premium flowers, we help you transform your feelings into stunning visual expressions that leave lasting impressions.
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

        {/* Team Section (hidden per request) */}
        {/* <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our talented team combines technical expertise with floral artistry to bring you the ultimate customization experience.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-florist-600 mb-3">{member.role}</p>
              </div>
            ))}
          </div>
        </div> */}

        {/* Contact Info */}
        <div className="bg-gradient-to-br from-florist-50 to-white rounded-xl shadow-lg p-8 border border-florist-100">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Visit Our Shop</h2>
            <p className="text-gray-600 text-lg">We'd love to meet you in person and help you find the perfect flowers</p>
          </div>
          
          {/* Contact Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-florist-100 rounded-full flex items-center justify-center mb-4">
                  <MapPin className="text-florist-600" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Address</h3>
                <p className="text-gray-600 leading-relaxed">
                  Lô E2a-7, Đường D1<br />
                  Khu Công nghệ cao<br />
                  Phường Tăng Nhơn Phú, TPHCM
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-florist-100 rounded-full flex items-center justify-center mb-4">
                  <Phone className="text-florist-600" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
                <p className="text-gray-600">
                  <a href="tel:+84912051433" className="hover:text-florist-600 transition-colors">
                    (84) 912 051 433
                  </a>
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-florist-100 rounded-full flex items-center justify-center mb-4">
                  <Mail className="text-florist-600" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                <p className="text-gray-600">
                  <a href="mailto:dungpltse184549@fpt.edu.vn" className="hover:text-florist-600 transition-colors break-all">
                    dungpltse184549@fpt.edu.vn
                  </a>
                </p>
              </div>
            </div>
          </div>
          
          {/* Business Hours */}
          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-florist-100 rounded-full flex items-center justify-center">
                  <Clock className="text-florist-600" size={16} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Business Hours</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-600">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-800">Monday - Friday</p>
                  <p>9:00 AM - 7:00 PM</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-800">Saturday</p>
                  <p>9:00 AM - 6:00 PM</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-800">Sunday</p>
                  <p>10:00 AM - 4:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Experience the Difference?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Start creating your personalized floral arrangement today, or reach out to learn more about our customization platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/products')}
              className="bg-florist-500 text-white px-8 py-3 rounded-lg hover:bg-florist-600 transition-colors"
            >
              Start Customizing
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