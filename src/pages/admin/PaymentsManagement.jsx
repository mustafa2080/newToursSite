import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const PaymentsManagement = () => {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with Firebase API call
      // const response = await paymentsAPI.getAll();
      // setPayments(response.data);
      setPayments([]); // Empty for now - using real Firebase data
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { color: 'green', text: 'Completed' },
      pending: { color: 'yellow', text: 'Pending' },
      failed: { color: 'red', text: 'Failed' },
      refunded: { color: 'blue', text: 'Refunded' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-${config.color}-100 text-${config.color}-800`}>
        {config.text}
      </span>
    );
  };

  const filteredPayments = payments.filter(payment => 
    filterStatus === 'all' || payment.status === filterStatus
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments Management</h1>
          <p className="text-gray-600">Monitor and manage financial transactions</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="flex items-center">
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { 
            label: 'Total Revenue', 
            value: `$${payments.reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}`, 
            color: 'green',
            icon: CurrencyDollarIcon 
          },
          { 
            label: 'Completed', 
            value: payments.filter(p => p.status === 'completed').length, 
            color: 'blue',
            icon: CheckCircleIcon 
          },
          { 
            label: 'Pending', 
            value: payments.filter(p => p.status === 'pending').length, 
            color: 'yellow',
            icon: ClockIcon 
          },
          { 
            label: 'Failed', 
            value: payments.filter(p => p.status === 'failed').length, 
            color: 'red',
            icon: XCircleIcon 
          },
        ].map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="p-6">
              <div className="flex items-center">
                <IconComponent className={`h-8 w-8 text-${stat.color}-600`} />
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">{stat.label}</div>
                  <div className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        {['all', 'completed', 'pending', 'failed', 'refunded'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === status
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Payments List */}
      <Card>
        {filteredPayments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <CurrencyDollarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
            <p>
              {filterStatus === 'all' 
                ? 'No payment transactions have been recorded yet.'
                : `No ${filterStatus} payments found.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payment.transaction_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{payment.customer_name}</div>
                        <div className="text-sm text-gray-500">{payment.customer_email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{payment.booking_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${payment.amount?.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{payment.payment_method}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PaymentsManagement;
