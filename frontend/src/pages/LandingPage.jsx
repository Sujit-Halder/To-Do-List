import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="app-page landing-page min-h-screen bg-[radial-gradient(circle_at_top_left,#ffe4e5,transparent_38%),linear-gradient(135deg,#fff_0%,#f5f7fb_100%)] px-5 py-10 sm:py-20">
      <div className="mx-auto max-w-5xl space-y-10 text-center">
        <img src="/taskpro.svg" alt="TaskPro+" className="mx-auto h-16 w-16" />
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-400">Plan clearly · finish calmly</p>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">Welcome to <span className="text-red-400">TaskPro+</span></h1>
        <p className="mx-auto max-w-2xl text-lg leading-8 text-slate-600">
          Organize your life with monthly planning, reminders, and premium tools. Upgrade to Prime for enhanced features!
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/login" className="button-primary px-6 py-3">
            Sign In
          </Link>
          <Link to="/register" className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            Sign Up
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 text-left md:grid-cols-3">
          <div className="surface-card interactive-card p-6">
            <h2 className="text-lg font-semibold text-slate-900">Monthly Planner</h2>
            <p className="text-sm text-gray-600 mt-2">Stay on track with daily, weekly and monthly goals.</p>
          </div>
          <div className="surface-card interactive-card p-6">
            <h2 className="text-lg font-semibold text-slate-900">Reminder System</h2>
            <p className="text-sm text-gray-600 mt-2">Smart notifications for upcoming tasks and events.</p>
          </div>
          {/* <div className="surface-card interactive-card p-6">
            <h2 className="text-lg font-semibold text-slate-900">Prime Subscription</h2>
            <p className="text-sm text-gray-600 mt-2">Exclusive features and priority support for Prime users.</p>
          </div> */}
          <div className="surface-card interactive-card p-6">
            <h2 className="text-lg font-semibold text-slate-900">Easy UI</h2>
            <p className="text-sm text-gray-600 mt-2">User friendly features for smooth use.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
