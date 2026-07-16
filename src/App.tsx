import { useEffect } from 'react';
import { useStore } from './store';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Analysis from './components/Analysis';
import CategoriesView from './components/CategoriesView';
import Profile from './components/Profile';
import BottomNav from './components/BottomNav';
import AddExpense from './components/AddExpense';
import Search from './components/Search';
import Calendar from './components/Calendar';
import SubscriptionsView from './components/SubscriptionsView';
import GoalsView from './components/GoalsView';

function App() {
  const { user, activeTab, subView, fetchCategories, fetchStats } = useStore();

  useEffect(() => {
    // Pre-load data once logged in
    if (user) {
      fetchCategories();
      fetchStats();
    }
  }, [user, fetchCategories, fetchStats]);

  // 1. Unauthenticated flow: Login or Register
  if (!user) {
    return subView === 'register' ? <Register /> : <Login />;
  }

  // 2. Authenticated flow: BottomNav Layout
  return (
    <div
      className="min-h-dvh bg-[#F0FAF4] text-[#1E293B] flex flex-col font-sans"
      style={{ paddingBottom: 'var(--safe-bottom)' }}
    >
      <main className="flex-1 overflow-y-auto overscroll-contain px-4 pt-0">
        <div className="max-w-lg mx-auto">
          {/* Sub Views Overlay */}
          {subView === 'add-expense' && <AddExpense />}
          {subView === 'search' && <Search />}
          {subView === 'calendar' && <Calendar />}
          {subView === 'subscriptions' && <SubscriptionsView />}
          {subView === 'goals' && <GoalsView />}

          {/* Standard Tabs */}
          {!subView && (
            <>
              {activeTab === 'home' && <Dashboard />}
              {activeTab === 'analysis' && <Analysis />}
              {activeTab === 'transactions' && <Transactions />}
              {activeTab === 'categories' && <CategoriesView />}
              {activeTab === 'profile' && <Profile />}
            </>
          )}
        </div>
      </main>

      {/* Persistent Bottom Tab Navigation */}
      <BottomNav />
    </div>
  );
}

export default App;
