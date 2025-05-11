// Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmitHandler = (event) => {
    event.preventDefault();
    
    if (email === 'admin@ameraclinic.com' && password === 'amera2025amera') {
      setIsAuthenticated(true);
      navigate('/admin-dashboard');
    } else {
      setError('بيانات الدخول غير صحيحة!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <form 
        onSubmit={onSubmitHandler}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-600 mb-2">مرحبًا بعودتك!</h1>
          <p className="text-gray-600">الرجاء إدخال بيانات الدخول</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2 text-right">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-right"
              placeholder="example@clinic.com"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2 text-right">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-right"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            دخول إلى لوحة التحكم
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;