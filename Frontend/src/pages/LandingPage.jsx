import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white p-8">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h1 className="text-5xl font-bold text-blue-700">Welcome to TaskPro+</h1>
        <p className="text-lg text-gray-700">
          Organize your life with monthly planning, reminders, and premium tools. Upgrade to Prime for enhanced features!
        </p>

        <div className="flex justify-center space-x-6">
          <Link to="/login" className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow hover:bg-blue-700 transition">
            Sign In
          </Link>
          <Link to="/register" className="bg-green-600 text-white px-6 py-3 rounded-xl shadow hover:bg-green-700 transition">
            Sign Up
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-2xl shadow-md">
            <h2 className="text-xl font-semibold text-blue-700">Monthly Planner</h2>
            <p className="text-sm text-gray-600 mt-2">Stay on track with daily, weekly and monthly goals.</p>
          </div>
          <div className="p-6 bg-white rounded-2xl shadow-md">
            <h2 className="text-xl font-semibold text-blue-700">Reminder System</h2>
            <p className="text-sm text-gray-600 mt-2">Smart notifications for upcoming tasks and events.</p>
          </div>
          <div className="p-6 bg-white rounded-2xl shadow-md">
            <h2 className="text-xl font-semibold text-blue-700">Prime Subscription</h2>
            <p className="text-sm text-gray-600 mt-2">Exclusive features and priority support for Prime users.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
