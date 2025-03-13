import React, { useEffect } from 'react';
import { Bell, Calendar, Wallet, Users, Settings, PlusCircle } from 'lucide-react';
import { getAuth } from "../utils/getAuth.js";
import { getData } from "../utils/getData.js";
import Sidebar from '../components/Sidebar';

const OfficialDashboard = () => {
  const { data: officials, error: officialsError, loading: officialsLoading } = getData("officials");
  const { data: residents, error: residentsError, loading: residentsLoading } = getData("residents");

  useEffect(() => {
    if (!getAuth()) {
      window.location.href = "/";
    }
  }, []);

  const notifications = [
    { icon: "📢", text: "New regulations have been introduced for the upcoming year.", type: "info" },
    { icon: "📝", text: "Official documents are ready for review.", type: "info" },
    { icon: "📅", text: "Next official meeting scheduled for next week.", type: "info" }
  ];

  const metrics = [
    { title: "Officials", value: officialsLoading ? "Loading..." : officials?.length || "0", icon: <Wallet className="w-6 h-6 text-rose-500" /> },
    { title: "Residents", value: residentsLoading ? "Loading..." : residents?.length || "0", icon: <Users className="w-6 h-6 text-blue-500" /> },
    { title: "Pending Requests", value: "5", icon: <PlusCircle className="w-6 h-6 text-green-500" /> },
    { title: "Upcoming Events", value: "3", icon: <Calendar className="w-6 h-6 text-yellow-500" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-row">
      <Sidebar />
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Official Page</h1>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <span>Create New Official Document</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-3xl font-bold mb-2">Welcome to the Official Page!</h2>
            <p className="text-gray-500 mb-6">Manage official tasks and notifications.</p>

            <div className="grid grid-cols-2 gap-6 mt-8">
              {metrics.map((metric, index) => (
                <div key={index} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    {metric.icon}
                    <button className="text-gray-400 hover:text-gray-600">
                      <Settings className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{metric.title}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Notifications</h2>
              <a href="#" className="text-blue-500 text-sm">See all</a>
            </div>
            <div className="space-y-4">
              {notifications.map((notification, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 rounded-lg bg-gray-50">
                  <span className="text-2xl">{notification.icon}</span>
                  <p className="text-sm text-gray-600">{notification.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficialDashboard;
