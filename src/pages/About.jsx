import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  CheckIcon,
  UserGroupIcon,
  GlobeAltIcon,
  HeartIcon,
  ShieldCheckIcon,
  LightBulbIcon,
  StarIcon,
  MapPinIcon,
  CalendarDaysIcon,
  TrophyIcon,
  AcademicCapIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

const About = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      // Simulate API call - replace with actual API call to get content from admin
      setTimeout(() => {
        setContent({
          title: 'About Premium Tours',
          subtitle: 'Your Gateway to Extraordinary Adventures',
          description: 'We are passionate about creating unforgettable travel experiences that connect you with the world\'s most beautiful destinations. Our team of travel experts curates every journey to ensure you discover not just places, but memories that last a lifetime. With over 15 years of experience, we have perfected the art of crafting personalized adventures that exceed expectations.',
          mission: 'To provide exceptional travel experiences that inspire, educate, and create lasting memories while promoting sustainable and responsible tourism practices that benefit local communities.',
          vision: 'To be the world\'s most trusted travel companion, making extraordinary journeys accessible to everyone while preserving the beauty and culture of destinations for future generations.',
          story: 'Founded in 2009 by a group of passionate travelers, Premium Tours began as a small dream to share the world\'s hidden gems with fellow adventurers. What started as weekend trips to local destinations has grown into a global network of carefully curated experiences spanning six continents.',
          values: [
            'Customer First',
            'Sustainable Tourism',
            'Cultural Respect',
            'Safety & Security',
            'Innovation',
            'Authenticity',
          ],
          team: [
            {
              name: 'John Smith',
              position: 'CEO & Founder',
              image: 'https://picsum.photos/300/300?random=1601',
              bio: 'Travel enthusiast with 15+ years of experience in the tourism industry. John founded Tours with a vision to make authentic travel experiences accessible to everyone.',
            },
            {
              name: 'Sarah Johnson',
              position: 'Head of Operations',
              image: 'https://picsum.photos/300/300?random=1602',
              bio: 'Expert in travel logistics and customer experience management. Sarah ensures every trip runs smoothly from planning to execution.',
            },
            {
              name: 'Michael Chen',
              position: 'Travel Experience Designer',
              image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
              bio: 'Creative designer who crafts unique itineraries and experiences. Michael\'s attention to detail ensures every journey is extraordinary.',
            },
            {
              name: 'Emily Rodriguez',
              position: 'Sustainability Director',
              image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
              bio: 'Environmental advocate focused on sustainable tourism practices. Emily leads our efforts in responsible travel and community engagement.',
            },
          ],
          hero_image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
          stats: {
            years_experience: 15,
            destinations: 150,
            happy_customers: 25000,
            team_members: 50,
            countries: 45,
            awards: 12,
          },
          achievements: [
            {
              icon: TrophyIcon,
              title: 'Best Travel Agency 2023',
              description: 'Awarded by International Tourism Board',
              year: '2023'
            },
            {
              icon: StarIcon,
              title: '4.9/5 Customer Rating',
              description: 'Based on 10,000+ reviews',
              year: '2024'
            },
            {
              icon: AcademicCapIcon,
              title: 'Certified Sustainable Tourism',
              description: 'Green Travel Certification',
              year: '2022'
            },
            {
              icon: GlobeAltIcon,
              title: 'Global Reach',
              description: '45 countries, 6 continents',
              year: '2024'
            }
          ],
          contact: {
            phone: '+1 (555) 123-4567',
            email: 'info@premiumtours.com',
            address: '123 Adventure Street, Travel City, TC 12345',
            hours: 'Mon-Fri: 9AM-6PM, Sat-Sun: 10AM-4PM'
          },
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading content:', error);
      setLoading(false);
    }
  };

  const valueIcons = {
    'Customer First': UserGroupIcon,
    'Sustainable Tourism': GlobeAltIcon,
    'Cultural Respect': HeartIcon,
    'Safety & Security': ShieldCheckIcon,
    'Innovation': LightBulbIcon,
    'Authenticity': CheckIcon,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading about page..." />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Content Not Available</h2>
          <p className="text-gray-600">Unable to load page content. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-96 md:h-[500px] overflow-hidden">
        <img
          src={content.hero_image}
          alt="About Us"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl mx-auto px-4">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl font-bold mb-4"
            >
              {content.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-200"
            >
              {content.subtitle}
            </motion.p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
            {content.description}
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16"
        >
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
              {content.stats.years_experience}+
            </div>
            <div className="text-gray-600 text-sm">Years Experience</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
              {content.stats.destinations}+
            </div>
            <div className="text-gray-600 text-sm">Destinations</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
              {content.stats.happy_customers.toLocaleString()}+
            </div>
            <div className="text-gray-600 text-sm">Happy Customers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
              {content.stats.team_members}+
            </div>
            <div className="text-gray-600 text-sm">Team Members</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
              {content.stats.countries}+
            </div>
            <div className="text-gray-600 text-sm">Countries</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
              {content.stats.awards}+
            </div>
            <div className="text-gray-600 text-sm">Awards Won</div>
          </div>
        </motion.div>

        {/* Our Story */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Our Journey</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                {content.story}
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                Today, we're proud to have helped over 25,000 travelers create memories that last a lifetime.
                Our commitment to excellence, sustainability, and authentic experiences has earned us recognition
                as one of the leading travel companies in the industry.
              </p>
              <Link to="/trips">
                <Button size="large" className="bg-blue-600 hover:bg-blue-700">
                  Explore Our Trips
                </Button>
              </Link>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Our Journey"
                className="rounded-lg shadow-lg"
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-lg shadow-lg">
                <div className="text-2xl font-bold text-blue-600">15+</div>
                <div className="text-gray-600 text-sm">Years of Excellence</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Achievements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.achievements.map((achievement, index) => {
              const IconComponent = achievement.icon;
              return (
                <motion.div
                  key={achievement.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card hover className="p-6 text-center h-full">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">{achievement.title}</h4>
                    <p className="text-gray-600 text-sm mb-2">{achievement.description}</p>
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {achievement.year}
                    </span>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="p-8 h-full">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                {content.mission}
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="p-8 h-full">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                {content.vision}
              </p>
            </Card>
          </motion.div>
        </div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.values.map((value, index) => {
              const IconComponent = valueIcons[value] || CheckIcon;
              return (
                <motion.div
                  key={value}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card hover className="p-6 text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900">{value}</h4>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Team */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">Meet Our Team</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {content.team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card hover className="p-6 text-center h-full">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-blue-100"
                  />
                  <h4 className="font-semibold text-gray-900 mb-1">{member.name}</h4>
                  <p className="text-blue-600 text-sm mb-3 font-medium">{member.position}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 md:p-12 text-white">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-4">Ready to Start Your Adventure?</h3>
              <p className="text-blue-100 text-lg max-w-2xl mx-auto">
                Get in touch with our travel experts to plan your perfect getaway.
                We're here to make your travel dreams come true.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PhoneIcon className="h-6 w-6" />
                </div>
                <h4 className="font-semibold mb-2">Call Us</h4>
                <p className="text-blue-100">{content.contact.phone}</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <EnvelopeIcon className="h-6 w-6" />
                </div>
                <h4 className="font-semibold mb-2">Email Us</h4>
                <p className="text-blue-100">{content.contact.email}</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BuildingOfficeIcon className="h-6 w-6" />
                </div>
                <h4 className="font-semibold mb-2">Visit Us</h4>
                <p className="text-blue-100 text-sm">{content.contact.address}</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarDaysIcon className="h-6 w-6" />
                </div>
                <h4 className="font-semibold mb-2">Office Hours</h4>
                <p className="text-blue-100 text-sm">{content.contact.hours}</p>
              </div>
            </div>

            <div className="text-center">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact">
                  <Button size="large" className="bg-blue-600 text-white hover:bg-gray-100">
                    Contact Us
                  </Button>
                </Link>
                <Link to="/trips">
                  <Button size="large" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                    Browse Trips
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
