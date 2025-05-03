'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const defaultData = {
  task: 0,
  sleep: 0,
  steps: 0,
  calories: 0,
  exercise: 0,
  focus: 0,
  hydration: 0,
};

type HabitData = typeof defaultData;
type HabitEntry = { date: string } & HabitData;

// Improved date formatting function with proper zero-padding
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Format date for display in a more readable way
const formatDisplayDate = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  return date.toLocaleDateString(undefined, options);
};

export default function HabitTracker() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [data, setData] = useState<HabitData>({ ...defaultData });
  const [history, setHistory] = useState<HabitEntry[]>([]);
  
  // Initialize with current date and load existing data
  useEffect(() => {
    const today = new Date();
    const storedRaw = localStorage.getItem('habitData');
    const stored: Record<string, HabitData> = storedRaw ? JSON.parse(storedRaw) : {};
    
    // If no data exists yet, initialize today's date
    if (Object.keys(stored).length === 0) {
      const key = formatDate(today);
      stored[key] = { ...defaultData };
      localStorage.setItem('habitData', JSON.stringify(stored));
    }
    
    updateHistoryFromStorage(stored);
    
    // Always start with today's date on initial load
    setSelectedDate(today);
    
    // Set the data for today from storage
    const todayKey = formatDate(today);
    if (stored[todayKey]) {
      setData(stored[todayKey]);
    } else {
      // Initialize today's data if it doesn't exist
      stored[todayKey] = { ...defaultData };
      localStorage.setItem('habitData', JSON.stringify(stored));
      setData({ ...defaultData });
    }
  }, []);

  // Update data when selected date changes
  useEffect(() => {
    if (!selectedDate) return;
    
    const storedRaw = localStorage.getItem('habitData');
    const stored: Record<string, HabitData> = storedRaw ? JSON.parse(storedRaw) : {};
    const key = formatDate(selectedDate);
    
    // If data for this date doesn't exist yet, initialize it
    if (!stored[key]) {
      stored[key] = { ...defaultData };
      localStorage.setItem('habitData', JSON.stringify(stored));
      updateHistoryFromStorage(stored); // Update history when adding a new date
    }
    
    // Always load the current data for the selected date
    setData(stored[key]);
  }, [selectedDate]);

  const updateHistoryFromStorage = (stored: Record<string, HabitData>) => {
    const allEntries: HabitEntry[] = Object.entries(stored).map(([date, entry]) => ({
      date,
      ...Object.fromEntries(
        (Object.keys(defaultData) as (keyof HabitData)[]).map((key) => [
          key,
          typeof entry[key] === 'number' ? entry[key] : 0,
        ])
      ),
    }));

    // Sort chronologically
    allEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setHistory(allEntries);
  };

  const handleChange = (key: keyof HabitData, value: number) => {
    // Ensure value is not negative
    const safeValue = Math.max(0, value);
    
    // Update the data state
    const updated = { ...data, [key]: safeValue };
    setData(updated);

    // Persist to localStorage
    const storedRaw = localStorage.getItem('habitData');
    const stored: Record<string, HabitData> = storedRaw ? JSON.parse(storedRaw) : {};

    const dateKey = formatDate(selectedDate);
    stored[dateKey] = updated;
    
    try {
      localStorage.setItem('habitData', JSON.stringify(stored));
      console.log(`Updated ${key} to ${safeValue} for ${dateKey}`);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }

    // Update the history state with the new data
    updateHistoryFromStorage(stored);
  };

  // Function to navigate to today
  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Functions to navigate between dates
  const goToPreviousDay = () => {
    const prevDate = new Date(selectedDate);
    prevDate.setDate(prevDate.getDate() - 1);
    setSelectedDate(prevDate);
  };

  const goToNextDay = () => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    setSelectedDate(nextDate);
  };

  // Add a new date if it doesn't exist
  const addNewDate = () => {
    const today = new Date();
    const key = formatDate(today);
    
    const storedRaw = localStorage.getItem('habitData');
    const stored: Record<string, HabitData> = storedRaw ? JSON.parse(storedRaw) : {};
    
    if (!stored[key]) {
      stored[key] = { ...defaultData };
      localStorage.setItem('habitData', JSON.stringify(stored));
      updateHistoryFromStorage(stored);
    }
    
    setSelectedDate(today);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-100 via-indigo-100 to-white text-gray-800 font-sans p-4">
      <nav className="flex justify-between items-center py-4">
        <h1 className="text-2xl font-bold">Habit Tracker</h1>
        
        <div className="flex gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1 bg-purple-500 text-white rounded-lg shadow"
          >
            Today
          </button>
          <button
            onClick={addNewDate}
            className="px-3 py-1 bg-green-500 text-white rounded-lg shadow"
          >
            + New Day
          </button>
        </div>
      </nav>
      
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={goToPreviousDay}
          className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center"
        >
          ←
        </button>
        
        <div className="flex items-center">
          <h2 className="text-xl font-semibold">
            {selectedDate ? formatDisplayDate(selectedDate) : 'Select a date'}
          </h2>
        </div>
        
        <button 
          onClick={goToNextDay}
          className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center"
        >
          →
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 max-w-full">
        {history.map((entry) => {
          const date = new Date(entry.date);
          const key = formatDate(date);
          const isSelected = key === formatDate(selectedDate);
          
          return (
            <button
              key={key}
              onClick={() => setSelectedDate(date)}
              className={`min-w-14 h-14 rounded-xl flex flex-col items-center justify-center ${
                isSelected ? 'bg-purple-400 text-white' : 'bg-white'
              } shadow`}
            >
              <span className="text-xs">{date.getDate()}/{date.getMonth() + 1}</span>
              <span className="text-xl">📅</span>
            </button>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center mt-4"
      >
        <div className="w-24 h-24 rounded-full bg-gradient-to-b from-indigo-300 to-purple-400 flex items-center justify-center">
          <span className="text-4xl">🦦</span>
        </div>
        <h2 className="text-xl mt-2 font-semibold">
          {selectedDate ? formatDisplayDate(selectedDate) : 'No Date Selected'}
        </h2>
      </motion.div>

      <section className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
        {Object.keys(defaultData).map((k) => (
          <InputCard
            key={k}
            title={k.charAt(0).toUpperCase() + k.slice(1)}
            value={data[k as keyof HabitData] || 0}
            onChange={(val) => handleChange(k as keyof HabitData, val)}
          />
        ))}
      </section>

      <section className="mt-10 max-w-5xl mx-auto bg-gray-900 text-white p-6 rounded-3xl shadow-xl">
        <h3 className="text-xl font-semibold mb-6 text-center">All Habit Trends</h3>
        {history.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart
              data={history}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: '#aaa' }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              <YAxis tick={{ fontSize: 12, fill: '#aaa' }} />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  backgroundColor: '#222',
                  color: '#fff',
                }}
                labelFormatter={(value) => {
                  const date = new Date(value);
                  return formatDisplayDate(date);
                }}
              />
              <Legend wrapperStyle={{ color: '#fff' }} />
              {(Object.keys(defaultData) as (keyof HabitData)[]).map((k, i) => (
                <Bar
                  key={k}
                  dataKey={k}
                  fill={
                    ['#7c3aed', '#14b8a6', '#0ea5e9', '#f59e0b', '#f43f5e', '#6366f1', '#10b981'][i]
                  }
                  barSize={14}
                  radius={[10, 10, 0, 0]}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-10">No data available yet</div>
        )}
      </section>

      <footer className="mt-10 text-center text-sm text-gray-500">
        © 2025 Personal Habit Tracker. Stay consistent 🫶
      </footer>
    </main>
  );
}

function InputCard({
  title,
  value,
  onChange,
}: {
  title: string;
  value: number;
  onChange: (val: number) => void;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="bg-white shadow rounded-xl p-4 flex flex-col items-center"
    >
      <div className="text-sm text-gray-500">{title}</div>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-20 text-center border-b-2 border-indigo-400 outline-none"
        min="0"
      />
    </motion.div>
  );
}