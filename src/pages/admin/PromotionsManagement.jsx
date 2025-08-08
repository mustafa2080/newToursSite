import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TagIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  PencilIcon,
  CalendarIcon,
  PercentBadgeIcon,
  GiftIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const PromotionsManagement = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    type: 'percentage', // percentage, fixed, buy_one_get_one
    value: 0,
    minAmount: 0,
    maxDiscount: 0,
    startDate: '',
    endDate: '',
    usageLimit: 0,
    usedCount: 0,
    isActive: true,
    applicableToTrips: [],
    applicableToHotels: [],
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    totalSavings: 0,
  });

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      console.log('🎁 Loading promotions from Firebase...');

      const promotionsSnapshot = await getDocs(collection(db, 'promotions'));
      const promotionsList = [];

      promotionsSnapshot.forEach((doc) => {
        const data = doc.data();
        promotionsList.push({
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate?.() || new Date(data.startDate),
          endDate: data.endDate?.toDate?.() || new Date(data.endDate),
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
        });
      });

      // Sort by creation date (newest first)
      promotionsList.sort((a, b) => b.createdAt - a.createdAt);

      setPromotions(promotionsList);
      calculateStats(promotionsList);
      console.log(`✅ Loaded ${promotionsList.length} promotions`);
    } catch (error) {
      console.error('❌ Error loading promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (promotionsList) => {
    const now = new Date();
    const stats = {
      total: promotionsList.length,
      active: promotionsList.filter(p => p.isActive && new Date(p.endDate) > now).length,
      expired: promotionsList.filter(p => new Date(p.endDate) <= now).length,
      totalSavings: promotionsList.reduce((sum, p) => sum + (p.totalSavings || 0), 0),
    };
    setStats(stats);
  };

  const handleSave = async () => {
    try {
      console.log('💾 Saving promotion...');

      const promotionData = {
        ...formData,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        updatedAt: serverTimestamp(),
      };

      if (editingPromotion) {
        // Update existing promotion
        await updateDoc(doc(db, 'promotions', editingPromotion.id), promotionData);
        console.log('✅ Promotion updated successfully');
      } else {
        // Create new promotion
        promotionData.createdAt = serverTimestamp();
        promotionData.usedCount = 0;
        promotionData.totalSavings = 0;
        await addDoc(collection(db, 'promotions'), promotionData);
        console.log('✅ Promotion created successfully');
      }

      await loadPromotions();
      setShowModal(false);
      resetForm();
      alert('Promotion saved successfully!');
    } catch (error) {
      console.error('❌ Error saving promotion:', error);
      alert('Error saving promotion: ' + error.message);
    }
  };

  const handleDelete = async (promotionId) => {
    if (!window.confirm('Are you sure you want to delete this promotion?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'promotions', promotionId));
      console.log('✅ Promotion deleted successfully');
      await loadPromotions();
      alert('Promotion deleted successfully!');
    } catch (error) {
      console.error('❌ Error deleting promotion:', error);
      alert('Error deleting promotion: ' + error.message);
    }
  };

  const handleToggleStatus = async (promotion) => {
    try {
      await updateDoc(doc(db, 'promotions', promotion.id), {
        isActive: !promotion.isActive,
        updatedAt: serverTimestamp(),
      });
      console.log('✅ Promotion status updated');
      await loadPromotions();
    } catch (error) {
      console.error('❌ Error updating promotion status:', error);
      alert('Error updating promotion status: ' + error.message);
    }
  };

  const openModal = (promotion = null) => {
    if (promotion) {
      setEditingPromotion(promotion);
      setFormData({
        ...promotion,
        startDate: promotion.startDate.toISOString().split('T')[0],
        endDate: promotion.endDate.toISOString().split('T')[0],
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingPromotion(null);
    setFormData({
      title: '',
      description: '',
      code: '',
      type: 'percentage',
      value: 0,
      minAmount: 0,
      maxDiscount: 0,
      startDate: '',
      endDate: '',
      usageLimit: 0,
      usedCount: 0,
      isActive: true,
      applicableToTrips: [],
      applicableToHotels: [],
    });
  };

  const generatePromoCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code: result }));
  };

  const getPromotionStatus = (promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);

    if (!promotion.isActive) return { status: 'inactive', color: 'gray' };
    if (now < startDate) return { status: 'scheduled', color: 'blue' };
    if (now > endDate) return { status: 'expired', color: 'red' };
    if (promotion.usageLimit > 0 && promotion.usedCount >= promotion.usageLimit) {
      return { status: 'limit_reached', color: 'orange' };
    }
    return { status: 'active', color: 'green' };
  };

  const formatDiscount = (promotion) => {
    if (promotion.type === 'percentage') {
      return `${promotion.value}%`;
    } else if (promotion.type === 'fixed') {
      return `$${promotion.value}`;
    } else {
      return 'BOGO';
    }
  };

  const addSamplePromotions = async () => {
    if (!window.confirm('This will add sample promotions to the database. Continue?')) {
      return;
    }

    try {
      setLoading(true);
      const samplePromotions = [
        {
          title: 'Summer Sale 2024',
          description: 'Get 20% off on all summer destinations',
          code: 'SUMMER20',
          type: 'percentage',
          value: 20,
          minAmount: 100,
          maxDiscount: 200,
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-08-31'),
          usageLimit: 100,
          usedCount: 15,
          isActive: true,
          totalSavings: 1500,
          createdAt: serverTimestamp(),
        },
        {
          title: 'Early Bird Special',
          description: 'Book 30 days in advance and save $50',
          code: 'EARLY50',
          type: 'fixed',
          value: 50,
          minAmount: 200,
          maxDiscount: 50,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          usageLimit: 200,
          usedCount: 45,
          isActive: true,
          totalSavings: 2250,
          createdAt: serverTimestamp(),
        },
        {
          title: 'Weekend Getaway',
          description: '15% off on weekend trips',
          code: 'WEEKEND15',
          type: 'percentage',
          value: 15,
          minAmount: 150,
          maxDiscount: 100,
          startDate: new Date('2024-03-01'),
          endDate: new Date('2024-05-31'),
          usageLimit: 50,
          usedCount: 50,
          isActive: false,
          totalSavings: 750,
          createdAt: serverTimestamp(),
        },
      ];

      for (const promotion of samplePromotions) {
        await addDoc(collection(db, 'promotions'), promotion);
      }

      console.log('✅ Sample promotions added');
      await loadPromotions();
      alert('Sample promotions added successfully!');
    } catch (error) {
      console.error('❌ Error adding sample promotions:', error);
      alert('Error adding sample promotions: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading promotions..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promotions Management</h1>
          <p className="text-gray-600">Create and manage discount codes and promotional offers</p>
        </div>
        <div className="flex space-x-3">
          {promotions.length === 0 && (
            <Button
              onClick={addSamplePromotions}
              variant="outline"
              className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
            >
              Add Sample Promotions
            </Button>
          )}
          <Button
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-700"
            icon={<PlusIcon />}
          >
            Create Promotion
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <TagIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Promotions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <XCircleIcon className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Expired</p>
              <p className="text-2xl font-bold text-gray-900">{stats.expired}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <GiftIcon className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Savings</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalSavings}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Promotions List */}
      <Card className="overflow-hidden">
        {promotions.length === 0 ? (
          <div className="p-12 text-center">
            <TagIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Promotions Found</h3>
            <p className="text-gray-600 mb-4">Create your first promotional offer to get started.</p>
            <Button
              onClick={() => openModal()}
              className="bg-blue-600 hover:bg-blue-700"
              icon={<PlusIcon />}
            >
              Create First Promotion
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Promotion Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {promotions.map((promotion) => {
                  const statusInfo = getPromotionStatus(promotion);
                  return (
                    <motion.tr
                      key={promotion.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{promotion.title}</div>
                          <div className="text-sm text-gray-500">Code: {promotion.code}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {promotion.startDate.toLocaleDateString()} - {promotion.endDate.toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatDiscount(promotion)}
                        </div>
                        {promotion.minAmount > 0 && (
                          <div className="text-xs text-gray-500">Min: ${promotion.minAmount}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {promotion.usedCount} / {promotion.usageLimit || '∞'}
                        </div>
                        <div className="text-xs text-gray-500">
                          Saved: ${promotion.totalSavings || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${statusInfo.color}-100 text-${statusInfo.color}-800`}>
                          {statusInfo.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button
                          size="small"
                          variant="ghost"
                          onClick={() => openModal(promotion)}
                          icon={<PencilIcon />}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          variant={promotion.isActive ? "warning" : "outline"}
                          onClick={() => handleToggleStatus(promotion)}
                        >
                          {promotion.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          size="small"
                          variant="danger"
                          onClick={() => handleDelete(promotion.id)}
                          icon={<TrashIcon />}
                        >
                          Delete
                        </Button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal for Create/Edit Promotion */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingPromotion ? 'Edit Promotion' : 'Create New Promotion'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Summer Sale 2024"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Promo Code
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="SUMMER20"
                      />
                      <Button
                        onClick={generatePromoCode}
                        className="rounded-l-none"
                        size="small"
                      >
                        Generate
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Get 20% off on all summer destinations"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                      <option value="buy_one_get_one">Buy One Get One</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {formData.type === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}
                    </label>
                    <input
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={formData.type === 'percentage' ? '20' : '50'}
                      disabled={formData.type === 'buy_one_get_one'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Usage Limit
                    </label>
                    <input
                      type="number"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData(prev => ({ ...prev, usageLimit: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Amount ($)
                    </label>
                    <input
                      type="number"
                      value={formData.minAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, minAmount: parseFloat(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Discount ($)
                    </label>
                    <input
                      type="number"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxDiscount: parseFloat(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="200"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    Active (promotion is available for use)
                  </label>
                </div>
              </div>
              
              <div className="flex space-x-3 pt-6 mt-6 border-t">
                <Button
                  onClick={handleSave}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {editingPromotion ? 'Update Promotion' : 'Create Promotion'}
                </Button>
                <Button
                  onClick={() => setShowModal(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PromotionsManagement;
