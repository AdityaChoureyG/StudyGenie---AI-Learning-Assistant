import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import DocumentListPage from './pages/Documents/DocumentListPage';
import DocumentDetailPage from './pages/Documents/DocumentDetailPage';
import FlashcardsPage from './pages/Flashcards/FlashcardsPage';
import FlashcardsListPage from './pages/Flashcards/FlashcardsListPage';
import QuizTakePage from './pages/Quizzes/QuizTakePage';
import QuizResultPage from './pages/Quizzes/QuizResultPage';
import ProfilePage from './pages/Profile/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

const App = () => {
  const isAuthenticated = true;
  const loading = false;

  if(loading){
    return (
      <div className='flex items-center justify-center h-screen'>
        <p>loading...</p>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route 
          path='/'
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
        />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path='/dashboard' element={<DashboardPage />} />
          <Route path='/documents' element={<DocumentListPage />} />
          <Route path='/documents/:id' element={<DocumentDetailPage />} />
          <Route path='/flashcards' element={<FlashcardsListPage />} />
          <Route path='/documents/:id/flashcards' element={<FlashcardsPage />} />
          <Route path='/quizzes/:quizId' element={<QuizTakePage />} />
          <Route path='/quizzes/:quizId/results' element={<QuizResultPage />} />
          <Route path='/profile' element={<ProfilePage />} />
        </Route>

        <Route path='*' element={<NotFoundPage />} />
      </Routes>
    </Router>
  )
}

export default App