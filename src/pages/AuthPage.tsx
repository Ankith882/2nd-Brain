import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Eye, EyeOff, CheckCircle, Instagram, Bookmark, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSignIn, setIsSignIn] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignUp = () => {
    // Navigate to main app after signup
    navigate('/app');
  };

  const handleSignIn = () => {
    if (isSignIn) {
      // Navigate to main app after signin
      navigate('/app');
    } else {
      // Switch to sign in form
      setIsSignIn(true);
      setFormData({ name: '', email: '', password: '' });
    }
  };

  const handleBackToSignUp = () => {
    setIsSignIn(false);
    setFormData({ name: '', email: '', password: '' });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Form */}
      <div className="flex-1 bg-background flex flex-col justify-center px-8 lg:px-16">
        {/* Top Navigation */}
        <div className="absolute top-8 left-8 flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{isSignIn ? "Don't have an account?" : "Already member?"}</span>
            <Button
              variant="link"
              className="p-0 h-auto text-sm font-medium text-blue-600 hover:text-blue-700"
              onClick={isSignIn ? handleBackToSignUp : handleSignIn}
            >
              {isSignIn ? "Sign up" : "Sign in"}
            </Button>
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-md mx-auto w-full space-y-8">
          {/* Title & Subtitle */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">{isSignIn ? "Sign In" : "Sign Up"}</h1>
            <p className="text-muted-foreground text-lg">
              {isSignIn ? "Welcome back to your 2nd Brain" : "Your 2nd Brain Store Organize Ideas and Visualize"}
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Name Field - only show for sign up */}
            {!isSignIn && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Name
                </Label>
                <div className="relative">
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="h-12 pl-10 rounded-lg border-input bg-background"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <svg className="h-5 w-5 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                  {formData.name && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                  )}
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@gmail.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="h-12 pl-10 rounded-lg border-input bg-background"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <svg className="h-5 w-5 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                </div>
                {formData.email && formData.email.includes('@') && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                )}
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="h-12 pl-10 pr-10 rounded-lg border-input bg-background"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <svg className="h-5 w-5 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                  </svg>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Sign Up Button */}
          <Button
            onClick={isSignIn ? handleSignIn : handleSignUp}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-base"
            disabled={isSignIn ? (!formData.email || !formData.password) : (!formData.name || !formData.email || !formData.password)}
          >
            {isSignIn ? "Sign In →" : "Sign Up →"}
          </Button>
        </div>
      </div>

      {/* Right Section - Visuals & Info */}
      <div className="hidden md:block flex-1 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl transform translate-x-48 -translate-y-48"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-800/40 rounded-full blur-3xl transform -translate-x-48 translate-y-48"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 hidden md:flex flex-col justify-center items-center h-full p-12 space-y-8">
          {/* Analytics Card */}
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-8 relative overflow-hidden">
              {/* Background gradient accent */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-400/20 to-transparent rounded-bl-full"></div>
              
              <div className="space-y-6 relative">
                <div className="flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-900 tracking-wide">Upgrade Your Knowledge</span>
                </div>
                
                <div className="flex items-center justify-center relative">
                  <div className="relative">
                    <img 
                      src="/lovable-uploads/7954b61a-e75f-4639-958f-e0104ec0b58d.png" 
                      alt="Brain Knowledge Icon" 
                      className="w-20 h-20 object-contain drop-shadow-lg"
                    />
                    
                    {/* Subtle glow effect */}
                    <div className="absolute inset-0 w-20 h-20 bg-blue-400/20 rounded-full blur-md -z-10"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Brain Icons */}
          <div className="flex space-x-6">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
              <img 
                src="/lovable-uploads/7f468d91-4027-4e38-9e88-8e27e6d7ae69.png" 
                alt="Brain Lightbulb" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
              <svg className="h-7 w-7 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.69 0 3.27-.42 4.66-1.16.3-.16.34-.59.09-.8-.25-.21-.64-.16-.89 0C14.73 20.53 13.4 20.8 12 20.8c-4.86 0-8.8-3.94-8.8-8.8S7.14 3.2 12 3.2s8.8 3.94 8.8 8.8c0 1.4-.27 2.73-.76 3.96-.16.4.04.85.44.99.4.14.85-.04.99-.44.57-1.43.88-2.98.88-4.51C22 6.48 17.52 2 12 2zm0 5c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
              </svg>
            </div>
          </div>

          {/* Security Info Card */}
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg max-w-sm">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Bookmark className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <div className="space-y-1">
                      <div className="h-2 bg-blue-600 rounded w-3/4"></div>
                      <div className="h-2 bg-gray-200 rounded w-full"></div>
                      <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Your data, your rules</h3>
                  <p className="text-sm text-gray-600">
                    Your data belongs to you, and our encryption ensures that
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;