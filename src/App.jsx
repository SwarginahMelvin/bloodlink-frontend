import './App.css'
import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import apiService from './services/api.js'

function StatCard({ title, value, icon, accent }) {
  return (
    <div className="stat-card">
      <div className="stat-card__row">
        <span className="stat-card__icon" aria-hidden>
          {icon}
        </span>
        <div className="stat-card__meta">
          <p className="stat-card__title">{title}</p>
          <p className="stat-card__value" data-accent={accent}>{value}</p>
        </div>
      </div>
    </div>
  )
}

function MiniStat({ label, value }) {
  return (
    <div className="mini-stat">
      <span className="mini-stat__drop" aria-hidden>🩸</span>
      <span className="mini-stat__label">{label}</span>
      <span className="mini-stat__value">{value}</span>
    </div>
  )
}

function Feature({ title, description, icon }) {
  return (
    <div className="feature">
      <div className="feature__icon" aria-hidden>{icon}</div>
      <div className="feature__text">
        <h4 className="feature__title">{title}</h4>
        <p className="feature__desc">{description}</p>
      </div>
    </div>
  )
}

function AppContent() {
  const { user, isAuthenticated, loading, login, signup, logout, refreshUser } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [view, setView] = useState('welcome')
  const [withinKm, setWithinKm] = useState('')
  const [location, setLocation] = useState('')
  const [bloodType, setBloodType] = useState('')
  
  // Enhanced donor search state
  const [searchMode, setSearchMode] = useState('quick')
  const [viewMode, setViewMode] = useState('grid')
  const [searchFilters, setSearchFilters] = useState({
    bloodType: '',
    radius: '',
    urgency: '',
    availability: '',
    units: '',
    location: ''
  })
  const [donorResults, setDonorResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showLoginSuccess, setShowLoginSuccess] = useState(false)
  const [showSignupSuccess, setShowSignupSuccess] = useState(false)
  const [selectedDonor, setSelectedDonor] = useState(null)
  const [isRegistered, setIsRegistered] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [dashboardData, setDashboardData] = useState({
    emergencyRequests: 0,
    totalBenefited: 0,
    bloodTypeStats: [],
    userDonations: [],
    userRequests: []
  })
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [dashboardError, setDashboardError] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      setView('dashboard')
      try {
        const flag = localStorage.getItem('donorRegistered')
        setIsRegistered(flag === 'true')
      } catch {}
      // Load dashboard data when user is authenticated
      loadDashboardData()
    } else {
      setView('welcome')
    }
  }, [isAuthenticated])

  const loadDashboardData = async () => {
    setDashboardLoading(true)
    setDashboardError('')
    
    try {
      // Use the new comprehensive dashboard API method
      const dashboardResponse = await apiService.getDashboardData()
      
      // Extract data with proper fallbacks
      const requests = dashboardResponse.requests?.data?.requests || []
      const donations = dashboardResponse.donations?.data?.donations || []
      const userRequests = dashboardResponse.userRequests?.data?.requests || []
      
      // Calculate emergency requests
      const emergencyRequests = requests.filter(req => 
        req.urgency === 'emergency' || req.priority === 'urgent'
      ).length
      
      // Calculate total benefited based on user's donations
      const totalBenefited = donations.length > 0 ? donations.length * 3 : 0
      
      // Complete blood type statistics with all 8 blood groups
      let bloodTypeStats = [
        ["A+", "15"], ["A-", "6"], ["B+", "18"], ["B-", "2"], 
        ["AB+", "8"], ["AB-", "1"], ["O+", "30"], ["O-", "7"]
      ]
      
      try {
        const statsResponse = await apiService.getBloodTypeStats()
        if (statsResponse?.data?.stats) {
          // Ensure we have all 8 blood groups with proper formatting
          const apiStats = statsResponse.data.stats
          bloodTypeStats = [
            ["A+", (apiStats["A+"] || apiStats["A+ve"] || 0).toString()],
            ["A-", (apiStats["A-"] || apiStats["A-ve"] || 0).toString()],
            ["B+", (apiStats["B+"] || apiStats["B+ve"] || 0).toString()],
            ["B-", (apiStats["B-"] || apiStats["B-ve"] || 0).toString()],
            ["AB+", (apiStats["AB+"] || apiStats["AB+ve"] || 0).toString()],
            ["AB-", (apiStats["AB-"] || apiStats["AB-ve"] || 0).toString()],
            ["O+", (apiStats["O+"] || apiStats["O+ve"] || 0).toString()],
            ["O-", (apiStats["O-"] || apiStats["O-ve"] || 0).toString()]
          ]
        }
      } catch (statsError) {
        console.warn('Blood type stats not available, using defaults:', statsError)
      }
      
      setDashboardData({
        emergencyRequests,
        totalBenefited: totalBenefited > 0 ? `${totalBenefited}+` : '100+',
        bloodTypeStats,
        userDonations: donations,
        userRequests
      })
      
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setDashboardError('Failed to load dashboard data. Please try refreshing.')
      
      // Set minimal fallback data with all 8 blood groups
      setDashboardData({
        emergencyRequests: 0,
        totalBenefited: '0',
        bloodTypeStats: [
          ["A+", "0"], ["A-", "0"], ["B+", "0"], ["B-", "0"], 
          ["AB+", "0"], ["AB-", "0"], ["O+", "0"], ["O-", "0"]
        ],
        userDonations: [],
        userRequests: []
      })
    } finally {
      setDashboardLoading(false)
    }
  }

  // Refresh dashboard data function
  const refreshDashboardData = async () => {
    if (isAuthenticated) {
      // Also refresh user data to ensure profile sync
      await refreshUser()
      await loadDashboardData()
    }
  }
  const donors = [
    { name: 'Nehha', type: 'O+', dist: '1.5 Km', time: '20 min ago', city: 'City', phone:'9360284384', lastDonation:'2 weeks ago', available:true, age:25, gender:'Female', donated:4, verified:true },
    { name: 'Gopi', type: 'O+', dist: '2 Km', time: '1 Hrs ago', city: 'City', phone:'9360284384', lastDonation:'1 month ago', available:true, age:26, gender:'Male', donated:5, verified:true },
    { name: 'Kriha', type: 'O-', dist: '7 Km', time: '1 Hrs ago', city: 'Town', phone:'9360284384', lastDonation:'3 weeks ago', available:false, age:22, gender:'Female', donated:2, verified:false },
    { name: 'Ishu', type: 'A+', dist: '3 Km', time: '2 Hrs ago', city: 'City', phone:'9360284384', lastDonation:'2 months ago', available:true, age:28, gender:'Male', donated:6, verified:true },
    { name: 'Vigno', type: 'AB+', dist: '2 Km', time: '20 min ago', city: 'Metro', phone:'9360284384', lastDonation:'2 weeks ago', available:true, age:24, gender:'Male', donated:3, verified:false },
    { name: 'Goku', type: 'B+', dist: '1 Km', time: '1 Hrs ago', city: 'City', phone:'9360284384', lastDonation:'4 weeks ago', available:true, age:30, gender:'Male', donated:8, verified:true },
  ]
  const [filteredDonors, setFilteredDonors] = useState(donors)
  function parseKm(text) {
    const m = String(text).toLowerCase().match(/([0-9]+\.?[0-9]*)/)
    return m ? parseFloat(m[1]) : Infinity
  }
  function onSearch() {
    const km = withinKm ? parseFloat(withinKm) : null
    const loc = location
    const next = donors.filter(d => {
      const okKm = km == null ? true : parseKm(d.dist) <= km
      const okLoc = !loc || loc === 'Location' ? true : d.city === loc
      return okKm && okLoc
    })
    setFilteredDonors(next)
    // Scroll to results on small screens
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        const list = document.querySelector('.donor-grid')
        if (list) list.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 0)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)
    
    const formData = new FormData(e.target)
    const credentials = {
      email: formData.get('email'),
      password: formData.get('password')
    }
    
    try {
      await login(credentials)
      setShowLoginSuccess(true)
      setTimeout(() => {
        setShowLoginSuccess(false)
      }, 2000)
    } catch (error) {
      setAuthError(error.message || 'Login failed')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)
    
    const formData = new FormData(e.target)
    const userData = {
      username: formData.get('username'),
      email: formData.get('email'),
      password: formData.get('password'),
      phone: formData.get('phone') || '0000000000',
      bloodType: formData.get('bloodType') || 'O+'
    }
    
    try {
      await signup(userData)
      setShowSignupSuccess(true)
      setTimeout(() => {
        setShowSignupSuccess(false)
      }, 3000)
    } catch (error) {
      setAuthError(error.message || 'Registration failed')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Enhanced donor search functions
  const handleDonorSearch = async () => {
    setSearchLoading(true)
    try {
      // Mock donor data with realistic profiles
      const mockDonors = [
        {
          id: 1,
          name: 'Sarah Johnson',
          bloodType: 'O-',
          distance: '2.3 km',
          location: 'City Hospital Area',
          lastDonation: '3 months ago',
          totalDonations: 12,
          rating: 5,
          status: 'available',
          statusText: 'Available Now',
          experience: '5+ years',
          availableSlots: ['Today 2PM', 'Tomorrow 10AM', 'Wed 4PM']
        },
        {
          id: 2,
          name: 'Mike Chen',
          bloodType: 'A+',
          distance: '4.1 km',
          location: 'Metro General',
          lastDonation: '2 months ago',
          totalDonations: 8,
          rating: 4,
          status: 'busy',
          statusText: 'Available Tomorrow',
          experience: '3+ years',
          availableSlots: ['Tomorrow 9AM', 'Thu 1PM', 'Fri 3PM']
        },
        {
          id: 3,
          name: 'Emily Davis',
          bloodType: 'B+',
          distance: '1.8 km',
          location: 'Central Medical',
          lastDonation: '4 months ago',
          totalDonations: 15,
          rating: 5,
          status: 'available',
          statusText: 'Available Now',
          experience: '7+ years',
          availableSlots: ['Today 11AM', 'Today 3PM', 'Tomorrow 2PM']
        },
        {
          id: 4,
          name: 'David Wilson',
          bloodType: 'AB+',
          distance: '3.7 km',
          location: 'Regional Hospital',
          lastDonation: '1 month ago',
          totalDonations: 6,
          rating: 4,
          status: 'scheduled',
          statusText: 'This Week',
          experience: '2+ years',
          availableSlots: ['Wed 10AM', 'Thu 2PM', 'Fri 11AM']
        },
        {
          id: 5,
          name: 'Lisa Rodriguez',
          bloodType: 'O+',
          distance: '5.2 km',
          location: 'Community Health',
          lastDonation: '5 months ago',
          totalDonations: 20,
          rating: 5,
          status: 'available',
          statusText: 'Available Now',
          experience: '10+ years',
          availableSlots: ['Today 1PM', 'Tomorrow 11AM', 'Wed 9AM']
        },
        {
          id: 6,
          name: 'James Park',
          bloodType: 'AB-',
          distance: '6.8 km',
          location: 'University Medical',
          lastDonation: '6 months ago',
          totalDonations: 4,
          rating: 4,
          status: 'available',
          statusText: 'Available Today',
          experience: '1+ years',
          availableSlots: ['Today 4PM', 'Tomorrow 1PM', 'Thu 10AM']
        }
      ]

      // Filter based on search criteria
      let filteredDonors = mockDonors
      
      if (searchFilters.bloodType) {
        filteredDonors = filteredDonors.filter(donor => donor.bloodType === searchFilters.bloodType)
      }
      
      if (searchFilters.radius) {
        const maxDistance = parseFloat(searchFilters.radius)
        filteredDonors = filteredDonors.filter(donor => parseFloat(donor.distance) <= maxDistance)
      }
      
      if (searchFilters.availability === 'now') {
        filteredDonors = filteredDonors.filter(donor => donor.status === 'available')
      }

      setDonorResults(filteredDonors)
    } catch (error) {
      console.error('Donor search error:', error)
      setDonorResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  const handleContactDonor = (donorId) => {
    const donor = donorResults.find(d => d.id === donorId)
    if (donor) {
      alert(`Contacting ${donor.name}...\nPhone: +1-555-0${donorId}23\nEmail: ${donor.name.toLowerCase().replace(' ', '.')}@email.com`)
    }
  }

  const handleScheduleDonation = (donorId) => {
    const donor = donorResults.find(d => d.id === donorId)
    if (donor) {
      alert(`Scheduling donation with ${donor.name}...\nAvailable slots: ${donor.availableSlots.join(', ')}`)
    }
  }

  const handleViewProfile = (donorId) => {
    const donor = donorResults.find(d => d.id === donorId)
    setSelectedDonor(donor)
    alert(`Viewing ${donor.name}'s full profile...\nTotal Donations: ${donor.totalDonations}\nRating: ${donor.rating}/5\nExperience: ${donor.experience}`)
  }

  // Initialize with some default results
  React.useEffect(() => {
    if (view === 'donor-search' && donorResults.length === 0) {
      handleDonorSearch()
    }
  }, [view])

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      {!(view === 'welcome' || view === 'login' || view === 'signup' || view === 'forgot') && (
      <header className="header">
        <div className="header__left">
          <button className="avatar" aria-label="Open profile" onClick={() => setView('profile')}>
            <span className="material-symbols-rounded">person</span>
          </button>
          <div className="greeting">
            <p className="greeting__hi">Hello {user?.username || user?.profile?.firstName || 'User'}!</p>
            <p className="greeting__subtitle">Ready to Support</p>
          </div>
      </div>
        {view === 'dashboard' && (
          <nav className="top-nav" aria-label="Primary">
            <button className="chip" onClick={() => setView('dashboard')}>Home</button>
            <button className="chip" onClick={() => setView('donor-search')}>Donor</button>
            <button className="chip" onClick={() => setView('about')}>About Us</button>
            <button className="chip" onClick={handleLogout}>Logout</button>
          </nav>
        )}
        <button
          className="hamburger"
          aria-label="Open menu"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMobileMenuOpen((v) => !v)}
        >
          <span className="material-symbols-rounded">menu</span>
        </button>
      </header>
      )}
      {mobileMenuOpen && !(view === 'forgot') && (
        <div id="mobile-menu" className="mobile-menu" role="menu">
          <button className="menu-item" onClick={() => { setView('dashboard'); setMobileMenuOpen(false) }}>Home</button>
          <button className="menu-item" onClick={() => { setView('donor-search'); setMobileMenuOpen(false) }}>Donor</button>
          <button className="menu-item" onClick={() => { setView('requests'); setMobileMenuOpen(false) }}>Requests</button>
          <button className="menu-item" onClick={() => { setView('about'); setMobileMenuOpen(false) }}>About Us</button>
          <button className="menu-item menu-item--danger" onClick={() => { handleLogout(); setMobileMenuOpen(false) }}>Logout</button>
        </div>
      )}

      <main className="content">
        {view === 'dashboard' && (
          <>
            {dashboardError && (
              <div className="dashboard-error">
                <span className="material-symbols-rounded">error</span>
                <span>{dashboardError}</span>
                <button onClick={refreshDashboardData} className="retry-btn">
                  <span className="material-symbols-rounded">refresh</span>
                  Retry
                </button>
              </div>
            )}
            
            <section className="hero">
              <h1 className="hero__title">Give Blood Give Hope</h1>
              <div className="hero__ctas cta-group">
                <Button className="cta-btn" onClick={() => setView('donor-search')}>GET A DONOR</Button>
                <Button className="cta-btn" onClick={() => setView(isRegistered ? 'registered-info' : 'donor-register')}>BE A DONOR</Button>
              </div>
            </section>

            <section className="stats">
              {dashboardLoading ? (
                <div className="stats-loading">
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading statistics...</p>
                  </div>
                </div>
              ) : (
                <div className="stats__top">
                  <Card className="stat-card">
                    <CardContent className="p-4">
                      <div className="stat-card__row">
                        <span className="stat-card__icon" aria-hidden>
                          <span className="material-symbols-rounded">bloodtype</span>
                        </span>
                        <div className="stat-card__meta">
                          <p className="stat-card__title">Emergency Requests</p>
                          <p className="stat-card__value">{dashboardData.emergencyRequests}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="stat-card">
                    <CardContent className="p-4">
                      <div className="stat-card__row">
                        <span className="stat-card__icon" aria-hidden>
                          <span className="material-symbols-rounded">military_tech</span>
                        </span>
                        <div className="stat-card__meta">
                          <p className="stat-card__title">Total Benefited</p>
                          <p className="stat-card__value">{dashboardData.totalBenefited}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              <div className="stats__grid">
                {dashboardData.bloodTypeStats.map(([label,value],i)=> (
                  <Card key={i} className="mini-stat">
                    <CardContent className="p-3 grid grid-cols-[auto_1fr_auto] items-center gap-2">
                      <span className="mini-stat__drop" aria-hidden>🩸</span>
                      <span className="mini-stat__label">{label}</span>
                      <span className="mini-stat__value">{value}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section className="aim">
              <h2 className="section-title">
                <span>Our</span>&nbsp;<span>Aim</span>
              </h2>
              <div className="features">
                {[
                  {icon:'redeem',title:'Free and Accessible',desc:'No charges for donors or recipients.'},
                  {icon:'bolt',title:'Real-Time Matching',desc:'Quick matches through hospitals and community.'},
                  {icon:'shield_lock',title:'Privacy and Security',desc:'Protected personal data and secure contact.'},
                  {icon:'notifications_active',title:'Efficient Management',desc:'Automated reminders and urgent alerts.'},
                ].map((f,i)=> (
                  <Card key={i} className="feature">
                    <CardContent className="p-3 grid grid-cols-[44px_1fr] items-center gap-3">
                      <div className="feature__icon" aria-hidden><span className="material-symbols-rounded">{f.icon}</span></div>
                      <div className="feature__text">
                        <h4 className="feature__title">{f.title}</h4>
                        <p className="feature__desc">{f.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* User Activity Section */}
            <section className="user-activity">
              <div className="activity-header-section">
                <h2 className="section-title">
                  <span>Your</span>&nbsp;<span>Activity</span>
                </h2>
                <button onClick={refreshDashboardData} className="refresh-btn" disabled={dashboardLoading}>
                  <span className="material-symbols-rounded">refresh</span>
                  {dashboardLoading ? 'Updating...' : 'Refresh'}
                </button>
              </div>
              
              {dashboardLoading ? (
                <div className="activity-loading">
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading your activity...</p>
                  </div>
                </div>
              ) : (
                <div className="activity-grid">
                  <Card className="activity-card">
                    <CardContent className="p-4">
                      <div className="activity-header">
                        <h3 className="activity-title">
                          <span className="material-symbols-rounded">favorite</span>
                          Donation History
                        </h3>
                        <span className="activity-count">{dashboardData.userDonations.length}</span>
                      </div>
                      {dashboardData.userDonations.length > 0 ? (
                        <div className="activity-list">
                          {dashboardData.userDonations.slice(0, 3).map((donation, i) => (
                            <div key={donation._id || i} className="activity-item">
                              <div className="activity-item-info">
                                <p className="activity-item-title">
                                  {donation.bloodType || user?.profile?.bloodType || user?.bloodType} • {donation.units || 1} unit(s)
                                </p>
                                <p className="activity-item-date">
                                  {donation.donationDate ? new Date(donation.donationDate).toLocaleDateString() : 
                                   donation.createdAt ? new Date(donation.createdAt).toLocaleDateString() : 'Date not available'}
                                </p>
                              </div>
                              <span className={`activity-status activity-status--${donation.status || 'success'}`}>
                                {donation.status === 'completed' ? 'Completed' : 
                                 donation.status === 'scheduled' ? 'Scheduled' : 'Completed'}
                              </span>
                            </div>
                          ))}
                          {dashboardData.userDonations.length > 3 && (
                            <button className="activity-view-more" onClick={() => setView('profile')}>
                              View all {dashboardData.userDonations.length} donations
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="activity-empty">
                          <p>No donations yet. Ready to save a life?</p>
                          <Button className="activity-cta" onClick={() => setView('donor-search')}>
                            Find Blood Requests
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="activity-card">
                    <CardContent className="p-4">
                      <div className="activity-header">
                        <h3 className="activity-title">
                          <span className="material-symbols-rounded">bloodtype</span>
                          Your Requests
                        </h3>
                        <span className="activity-count">{dashboardData.userRequests.length}</span>
                      </div>
                      {dashboardData.userRequests.length > 0 ? (
                        <div className="activity-list">
                          {dashboardData.userRequests.slice(0, 3).map((request, i) => (
                            <div key={request._id || i} className="activity-item">
                              <div className="activity-item-info">
                                <p className="activity-item-title">
                                  {request.bloodType} • {request.unitsNeeded || request.units || 1} unit(s)
                                </p>
                                <p className="activity-item-date">
                                  {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'Date not available'}
                                </p>
                              </div>
                              <span className={`activity-status activity-status--${request.status || 'pending'}`}>
                                {request.status === 'fulfilled' ? 'Fulfilled' : 
                                 request.status === 'pending' ? 'Active' : 
                                 request.status === 'expired' ? 'Expired' : 'Active'}
                              </span>
                            </div>
                          ))}
                          {dashboardData.userRequests.length > 3 && (
                            <button className="activity-view-more" onClick={() => setView('requests')}>
                              View all {dashboardData.userRequests.length} requests
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="activity-empty">
                          <p>No blood requests made yet.</p>
                          <Button className="activity-cta" onClick={() => setView('requests')}>
                            Create Request
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </section>

            <section className="warning">
              <h3 className="warning__title">WARNING</h3>
              <ul className="warning__list">
                <li>Donors must be 18–65 years old, weight ≥ 50 kg.</li>
                <li>Should be healthy and free from communicable diseases.</li>
                <li>Minimum 3 months gap since the last donation.</li>
              </ul>
            </section>

            <section className="about">
              <h3 className="section-title">About Us</h3>
              <p>
                Connect. Donate. Save. We are a platform that quickly links blood donors with those in need.
                Join us to help save lives, one drop at a time.
              </p>
            </section>
          </>
        )}

        {view === 'about' && (
          <div className="about-view">
            <div className="about-header">
              <button className="back-btn" onClick={() => setView('dashboard')}>
                <span className="material-symbols-rounded">arrow_back</span>
              </button>
              <div className="brand">
                <span className="brand-icon">🩸</span>
                <span className="brand-text"><strong>CONNECT</strong> <span className="accent">DONATE</span> SAVE</span>
              </div>
              <div className="header-spacer" />
            </div>

            <div className="about-content">
              <Card className="hero-card">
                <CardContent className="p-6">
                  <div className="hero-content">
                    <h1 className="about-title">About BloodLink</h1>
                    <p className="about-subtitle">Connecting Life-Savers with Life-Seekers</p>
                    <div className="mission-statement">
                      <span className="material-symbols-rounded">favorite</span>
                      <p>Every 2 seconds, someone needs blood. We're here to make sure they get it.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="about-grid">
                <Card className="mission-card">
                  <CardContent className="p-5">
                    <div className="card-header">
                      <span className="material-symbols-rounded card-icon">rocket_launch</span>
                      <h2>Our Mission</h2>
                    </div>
                    <p>To create a seamless, efficient, and life-saving blood donation ecosystem that connects willing donors with those in critical need, ensuring no life is lost due to blood shortage.</p>
                  </CardContent>
                </Card>

                <Card className="vision-card">
                  <CardContent className="p-5">
                    <div className="card-header">
                      <span className="material-symbols-rounded card-icon">visibility</span>
                      <h2>Our Vision</h2>
                    </div>
                    <p>A world where blood donation is accessible, transparent, and efficient - where every eligible person becomes a potential life-saver through our platform.</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="stats-showcase">
                <CardContent className="p-6">
                  <h2 className="stats-title">Impact by Numbers</h2>
                  <div className="impact-stats">
                    <div className="impact-stat">
                      <span className="impact-number">10,000+</span>
                      <span className="impact-label">Lives Saved</span>
                    </div>
                    <div className="impact-stat">
                      <span className="impact-number">25,000+</span>
                      <span className="impact-label">Registered Donors</span>
                    </div>
                    <div className="impact-stat">
                      <span className="impact-number">500+</span>
                      <span className="impact-label">Partner Hospitals</span>
                    </div>
                    <div className="impact-stat">
                      <span className="impact-number">24/7</span>
                      <span className="impact-label">Emergency Support</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="features-showcase">
                <h2 className="section-title">Why Choose BloodLink?</h2>
                <div className="features-grid">
                  <Card className="feature-card">
                    <CardContent className="p-4">
                      <div className="feature-icon">
                        <span className="material-symbols-rounded">speed</span>
                      </div>
                      <h3>Lightning Fast</h3>
                      <p>Find compatible donors in seconds with our advanced matching algorithm.</p>
                    </CardContent>
                  </Card>

                  <Card className="feature-card">
                    <CardContent className="p-4">
                      <div className="feature-icon">
                        <span className="material-symbols-rounded">security</span>
                      </div>
                      <h3>Secure & Private</h3>
                      <p>Your data is protected with enterprise-grade security and privacy measures.</p>
                    </CardContent>
                  </Card>

                  <Card className="feature-card">
                    <CardContent className="p-4">
                      <div className="feature-icon">
                        <span className="material-symbols-rounded">location_on</span>
                      </div>
                      <h3>Location-Based</h3>
                      <p>Smart geo-location matching connects you with nearby donors instantly.</p>
                    </CardContent>
                  </Card>

                  <Card className="feature-card">
                    <CardContent className="p-4">
                      <div className="feature-icon">
                        <span className="material-symbols-rounded">notifications_active</span>
                      </div>
                      <h3>Real-Time Alerts</h3>
                      <p>Instant notifications for urgent blood requests and donation opportunities.</p>
                    </CardContent>
                  </Card>

                  <Card className="feature-card">
                    <CardContent className="p-4">
                      <div className="feature-icon">
                        <span className="material-symbols-rounded">verified</span>
                      </div>
                      <h3>Verified Network</h3>
                      <p>All donors and recipients are verified for safety and authenticity.</p>
                    </CardContent>
                  </Card>

                  <Card className="feature-card">
                    <CardContent className="p-4">
                      <div className="feature-icon">
                        <span className="material-symbols-rounded">phone</span>
                      </div>
                      <h3>24/7 Support</h3>
                      <p>Round-the-clock customer support for emergencies and assistance.</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Card className="technology-card">
                <CardContent className="p-6">
                  <div className="tech-header">
                    <span className="material-symbols-rounded tech-icon">code</span>
                    <h2>Built with Modern Technology</h2>
                  </div>
                  <div className="tech-stack">
                    <div className="tech-category">
                      <h3>Frontend</h3>
                      <div className="tech-tags">
                        <span className="tech-tag">React</span>
                        <span className="tech-tag">Vite</span>
                        <span className="tech-tag">ShadCN UI</span>
                        <span className="tech-tag">Tailwind CSS</span>
                      </div>
                    </div>
                    <div className="tech-category">
                      <h3>Backend</h3>
                      <div className="tech-tags">
                        <span className="tech-tag">Node.js</span>
                        <span className="tech-tag">Express.js</span>
                        <span className="tech-tag">MongoDB</span>
                        <span className="tech-tag">JWT Auth</span>
                      </div>
                    </div>
                    <div className="tech-category">
                      <h3>Features</h3>
                      <div className="tech-tags">
                        <span className="tech-tag">Real-time Updates</span>
                        <span className="tech-tag">Geo-location</span>
                        <span className="tech-tag">Push Notifications</span>
                        <span className="tech-tag">Responsive Design</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cta-card">
                <CardContent className="p-6">
                  <div className="cta-content">
                    <h2>Ready to Save Lives?</h2>
                    <p>Join thousands of heroes who have already made a difference. Every donation counts, every life matters.</p>
                    <div className="cta-buttons">
                      <Button className="cta-primary" onClick={() => setView('donor-register')}>
                        <span className="material-symbols-rounded">volunteer_activism</span>
                        Become a Donor
                      </Button>
                      <Button className="cta-secondary" onClick={() => setView('requests')}>
                        <span className="material-symbols-rounded">bloodtype</span>
                        Request Blood
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {view === 'donor-search' && (
          <div className="donor-discovery-view">
            <div className="donor-header">
              <button className="back-btn" onClick={() => setView('dashboard')}>
                <span className="material-symbols-rounded">arrow_back</span>
              </button>
              <div className="brand">
                <span className="brand-icon">🩸</span>
                <span className="brand-text"><strong>FIND</strong> <span className="accent">HEROES</span> NEARBY</span>
              </div>
              <div className="header-spacer" />
            </div>

            <div className="donor-content">
              <Card className="search-hero-card">
                <CardContent className="p-6">
                  <div className="search-hero">
                    <h1 className="search-title">Find Life-Saving Donors</h1>
                    <p className="search-subtitle">Connect with verified blood donors in your area instantly</p>
                    
                    <div className="search-stats">
                      <div className="search-stat">
                        <span className="stat-number">2,847</span>
                        <span className="stat-label">Active Donors</span>
                      </div>
                      <div className="search-stat">
                        <span className="stat-number">24/7</span>
                        <span className="stat-label">Emergency Ready</span>
                      </div>
                      <div className="search-stat">
                        <span className="stat-number">&lt;5min</span>
                        <span className="stat-label">Response Time</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="advanced-search-card">
                <CardContent className="p-5">
                  <div className="search-header">
                    <h2>Smart Donor Search</h2>
                    <div className="search-toggle">
                      <Button 
                        className={`toggle-btn ${searchMode === 'quick' ? 'active' : ''}`}
                        onClick={() => setSearchMode('quick')}
                      >
                        Quick Search
                      </Button>
                      <Button 
                        className={`toggle-btn ${searchMode === 'advanced' ? 'active' : ''}`}
                        onClick={() => setSearchMode('advanced')}
                      >
                        Advanced
                      </Button>
                    </div>
                  </div>

                  <div className="search-form">
                    <div className="search-row">
                      <div className="search-field">
                        <label className="search-label">Blood Type Needed</label>
                        <Select value={searchFilters.bloodType} onValueChange={(value) => setSearchFilters({...searchFilters, bloodType: value})}>
                          <SelectTrigger className="search-select">
                            <SelectValue placeholder="Select blood type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A+">A+ Positive</SelectItem>
                            <SelectItem value="A-">A- Negative</SelectItem>
                            <SelectItem value="B+">B+ Positive</SelectItem>
                            <SelectItem value="B-">B- Negative</SelectItem>
                            <SelectItem value="AB+">AB+ Positive</SelectItem>
                            <SelectItem value="AB-">AB- Negative</SelectItem>
                            <SelectItem value="O+">O+ Positive (Common)</SelectItem>
                            <SelectItem value="O-">O- Negative (Universal)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="search-field">
                        <label className="search-label">Search Radius</label>
                        <Select value={searchFilters.radius} onValueChange={(value) => setSearchFilters({...searchFilters, radius: value})}>
                          <SelectTrigger className="search-select">
                            <SelectValue placeholder="Select distance" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2">Within 2 km</SelectItem>
                            <SelectItem value="5">Within 5 km</SelectItem>
                            <SelectItem value="10">Within 10 km</SelectItem>
                            <SelectItem value="25">Within 25 km</SelectItem>
                            <SelectItem value="50">Citywide (50 km)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {searchMode === 'advanced' && (
                      <div className="advanced-filters">
                        <div className="search-row">
                          <div className="search-field">
                            <label className="search-label">Urgency Level</label>
                            <Select value={searchFilters.urgency} onValueChange={(value) => setSearchFilters({...searchFilters, urgency: value})}>
                              <SelectTrigger className="search-select">
                                <SelectValue placeholder="Select urgency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="emergency">🚨 Emergency (Critical)</SelectItem>
                                <SelectItem value="urgent">⚡ Urgent (Within 24h)</SelectItem>
                                <SelectItem value="scheduled">📅 Scheduled (Planned)</SelectItem>
                                <SelectItem value="routine">🔄 Routine Donation</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="search-field">
                            <label className="search-label">Donor Availability</label>
                            <Select value={searchFilters.availability} onValueChange={(value) => setSearchFilters({...searchFilters, availability: value})}>
                              <SelectTrigger className="search-select">
                                <SelectValue placeholder="Any availability" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="now">Available Now</SelectItem>
                                <SelectItem value="today">Available Today</SelectItem>
                                <SelectItem value="week">This Week</SelectItem>
                                <SelectItem value="month">This Month</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="search-row">
                          <div className="search-field">
                            <label className="search-label">Units Needed</label>
                            <Select value={searchFilters.units} onValueChange={(value) => setSearchFilters({...searchFilters, units: value})}>
                              <SelectTrigger className="search-select">
                                <SelectValue placeholder="Select units" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 Unit (450ml)</SelectItem>
                                <SelectItem value="2">2 Units (900ml)</SelectItem>
                                <SelectItem value="3">3 Units (1.35L)</SelectItem>
                                <SelectItem value="4+">4+ Units (Multiple)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="search-field">
                            <label className="search-label">Hospital/Location</label>
                            <input 
                              type="text" 
                              className="search-input"
                              placeholder="Enter hospital or area name"
                              value={searchFilters.location}
                              onChange={(e) => setSearchFilters({...searchFilters, location: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="search-actions">
                      <Button className="search-btn primary" onClick={handleDonorSearch}>
                        <span className="material-symbols-rounded">search</span>
                        Find Compatible Donors
                      </Button>
                      <Button className="search-btn secondary" onClick={() => setSearchFilters({bloodType: '', radius: '', urgency: '', availability: '', units: '', location: ''})}>
                        <span className="material-symbols-rounded">refresh</span>
                        Reset Filters
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="donor-results">
                <div className="results-header">
                  <h2>Available Donors</h2>
                  <div className="results-info">
                    <span className="results-count">{donorResults.length} donors found</span>
                    <div className="view-toggle">
                      <Button 
                        className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                        onClick={() => setViewMode('grid')}
                      >
                        <span className="material-symbols-rounded">grid_view</span>
                      </Button>
                      <Button 
                        className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                        onClick={() => setViewMode('list')}
                      >
                        <span className="material-symbols-rounded">view_list</span>
                      </Button>
                    </div>
                  </div>
                </div>

                <div className={`donor-grid ${viewMode}`}>
                  {donorResults.map((donor, i) => (
                    <Card key={i} className="donor-profile-card">
                      <CardContent className="p-4">
                        <div className="donor-profile-header">
                          <div className="donor-avatar">
                            <span className="avatar-text">{donor.name.split(' ').map(n => n[0]).join('')}</span>
                          </div>
                          <div className="donor-basic-info">
                            <h3 className="donor-name">{donor.name}</h3>
                            <div className="donor-badges">
                              <span className="blood-type-badge">{donor.bloodType}</span>
                              <span className={`status-badge ${donor.status}`}>{donor.statusText}</span>
                            </div>
                          </div>
                          <div className="donor-rating">
                            <div className="rating-stars">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={`star ${i < donor.rating ? 'filled' : ''}`}>★</span>
                              ))}
                            </div>
                            <span className="rating-text">{donor.rating}.0</span>
                          </div>
                        </div>

                        <div className="donor-details">
                          <div className="detail-item">
                            <span className="material-symbols-rounded">location_on</span>
                            <span>{donor.distance} away • {donor.location}</span>
                          </div>
                          <div className="detail-item">
                            <span className="material-symbols-rounded">schedule</span>
                            <span>Last donation: {donor.lastDonation}</span>
                          </div>
                          <div className="detail-item">
                            <span className="material-symbols-rounded">volunteer_activism</span>
                            <span>{donor.totalDonations} total donations</span>
                          </div>
                          <div className="detail-item">
                            <span className="material-symbols-rounded">verified</span>
                            <span>Verified donor • {donor.experience}</span>
                          </div>
                        </div>

                        <div className="donor-availability">
                          <div className="availability-header">
                            <span className="material-symbols-rounded">event_available</span>
                            <span>Next Available</span>
                          </div>
                          <div className="availability-slots">
                            {donor.availableSlots.map((slot, i) => (
                              <span key={i} className="availability-slot">{slot}</span>
                            ))}
                          </div>
                        </div>

                        <div className="donor-actions">
                          <Button className="contact-btn primary" onClick={() => handleContactDonor(donor.id)}>
                            <span className="material-symbols-rounded">phone</span>
                            Contact Now
                          </Button>
                          <Button className="contact-btn secondary" onClick={() => handleScheduleDonation(donor.id)}>
                            <span className="material-symbols-rounded">event</span>
                            Schedule
                          </Button>
                          <Button className="contact-btn tertiary" onClick={() => handleViewProfile(donor.id)}>
                            <span className="material-symbols-rounded">person</span>
                            Profile
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {donorResults.length === 0 && (
                  <Card className="no-results-card">
                    <CardContent className="p-8">
                      <div className="no-results">
                        <span className="material-symbols-rounded">search_off</span>
                        <h3>No Donors Found</h3>
                        <p>Try adjusting your search criteria or expanding the search radius.</p>
                        <Button className="expand-search-btn" onClick={() => setSearchFilters({...searchFilters, radius: '50'})}>
                          <span className="material-symbols-rounded">zoom_out_map</span>
                          Expand Search Area
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}

        {view === 'profile' && (
          <div className="profile-view">
            <div className="profile-header">
              <button className="back" onClick={() => setView('dashboard')}>
                <span className="material-symbols-rounded">arrow_back</span>
              </button>
              <h1 className="profile-title">Your Profile</h1>
            </div>

            <div className="profile-card">
              <div className="profile-avatar">
                <span className="material-symbols-rounded">person</span>
              </div>
              <div className="profile-meta">
                <h2 className="profile-name">User Name</h2>
                <p className="profile-text">user@example.com</p>
                <p className="profile-text">O+ Blood Group</p>
              </div>
              <button className="profile-edit">
                <span className="material-symbols-rounded">edit</span>
                Edit
              </button>
            </div>

            <div className="profile-grid">
              <div className="pitem">
                <span className="pitem__label">Phone</span>
                <span className="pitem__value">+91 99999 99999</span>
              </div>
              <div className="pitem">
                <span className="pitem__label">Location</span>
                <span className="pitem__value">City, State</span>
              </div>
              <div className="pitem">
                <span className="pitem__label">Last Donation</span>
                <span className="pitem__value">3 months ago</span>
              </div>
              <div className="pitem">
                <span className="pitem__label">Availability</span>
                <span className="pitem__value">Available</span>
              </div>
            </div>
          </div>
        )}

        {view === 'donor-register' && (
          <div className="donor-register-view">
            <div className="donor-register-header">
              <button className="back-btn" onClick={() => setView('dashboard')}>
                <span className="material-symbols-rounded">arrow_back</span>
              </button>
              <div className="brand-header">
                <span className="brand-icon">🩸</span>
                <span className="brand-text">
                  <span className="brand-connect">CONNECT</span>
                  <span className="brand-donate">DONATE</span>
                  <span className="brand-save">SAVE</span>
                </span>
              </div>
            </div>

            <h1 className="donor-form-title">REGISTRATION FORM</h1>

            <div className="donor-form-container">
              <Card className="donor-form-card">
                <CardContent className="donor-form-content">
                  <form className="donor-form" onSubmit={(e) => { e.preventDefault(); try { localStorage.setItem('donorRegistered','true') } catch {} setIsRegistered(true); setShowSuccess(true); }}>
                    
                    {/* Personal Information Row */}
                    <div className="form-row">
                      <div className="form-field">
                        <label className="form-label">
                          Full Name <span className="required">*</span>
                        </label>
                        <Input 
                          className="form-input"
                          placeholder="Enter your full name"
                          required 
                        />
                      </div>

                      <div className="form-field">
                        <label className="form-label">
                          Gender <span className="required">*</span>
                        </label>
                        <Select>
                          <SelectTrigger className="form-select">
                            <SelectValue placeholder="Select Gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-field">
                        <label className="form-label">
                          Date of Birth <span className="required">*</span>
                        </label>
                        <Input 
                          type="date"
                          className="form-input"
                          required 
                        />
                      </div>

                      <div className="form-field">
                        <label className="form-label">
                          Mobile Number <span className="required">*</span>
                        </label>
                        <Input 
                          type="tel"
                          className="form-input"
                          placeholder="Enter mobile number"
                          required 
                        />
                      </div>
                    </div>

                    {/* Address Information Row */}
                    <div className="form-row form-row-triple">
                      <div className="form-field">
                        <label className="form-label">
                          Country <span className="required">*</span>
                        </label>
                        <Select>
                          <SelectTrigger className="form-select">
                            <SelectValue placeholder="Select Country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="india">India</SelectItem>
                            <SelectItem value="usa">United States</SelectItem>
                            <SelectItem value="uk">United Kingdom</SelectItem>
                            <SelectItem value="canada">Canada</SelectItem>
                            <SelectItem value="australia">Australia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="form-field">
                        <label className="form-label">
                          State <span className="required">*</span>
                        </label>
                        <Select>
                          <SelectTrigger className="form-select">
                            <SelectValue placeholder="Select State" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tamil-nadu">Tamil Nadu</SelectItem>
                            <SelectItem value="karnataka">Karnataka</SelectItem>
                            <SelectItem value="kerala">Kerala</SelectItem>
                            <SelectItem value="maharashtra">Maharashtra</SelectItem>
                            <SelectItem value="gujarat">Gujarat</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="form-field">
                        <label className="form-label">
                          City <span className="required">*</span>
                        </label>
                        <Select>
                          <SelectTrigger className="form-select">
                            <SelectValue placeholder="Select City" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="chennai">Chennai</SelectItem>
                            <SelectItem value="bangalore">Bangalore</SelectItem>
                            <SelectItem value="mumbai">Mumbai</SelectItem>
                            <SelectItem value="delhi">Delhi</SelectItem>
                            <SelectItem value="kolkata">Kolkata</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="form-field form-field-full">
                      <label className="form-label">
                        Street Address <span className="required">*</span>
                      </label>
                      <Input 
                        className="form-input"
                        placeholder="Enter your complete street address"
                        required 
                      />
                    </div>

                    {/* Medical Information Row */}
                    <div className="form-row">
                      <div className="form-field">
                        <label className="form-label">
                          Blood Group <span className="required">*</span>
                        </label>
                        <Select>
                          <SelectTrigger className="form-select">
                            <SelectValue placeholder="Select Blood Group" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="O+">O+ (Universal Donor)</SelectItem>
                            <SelectItem value="O-">O- (Universal Donor)</SelectItem>
                            <SelectItem value="A+">A+</SelectItem>
                            <SelectItem value="A-">A-</SelectItem>
                            <SelectItem value="B+">B+</SelectItem>
                            <SelectItem value="B-">B-</SelectItem>
                            <SelectItem value="AB+">AB+ (Universal Recipient)</SelectItem>
                            <SelectItem value="AB-">AB-</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="form-field">
                        <label className="form-label">
                          Weight <span className="required">*</span>
                        </label>
                        <Select>
                          <SelectTrigger className="form-select">
                            <SelectValue placeholder="Select Weight Range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="45-50">45-50 kg</SelectItem>
                            <SelectItem value="50-55">50-55 kg</SelectItem>
                            <SelectItem value="55-60">55-60 kg</SelectItem>
                            <SelectItem value="60-65">60-65 kg</SelectItem>
                            <SelectItem value="65-70">65-70 kg</SelectItem>
                            <SelectItem value="70-75">70-75 kg</SelectItem>
                            <SelectItem value="75+">75+ kg</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Agreement Section */}
                    <div className="form-section">
                      <div className="checkbox-field">
                        <input 
                          type="checkbox" 
                          id="terms" 
                          className="form-checkbox"
                          required 
                        />
                        <label htmlFor="terms" className="checkbox-label">
                          I agree to the <span className="terms-link">terms and conditions</span> and consent to being contacted for blood donation requests
                        </label>
                      </div>

                      <div className="radio-field">
                        <span className="radio-label">Have you donated blood previously?</span>
                        <div className="radio-options">
                          <label className="radio-option">
                            <input type="radio" name="previousDonation" value="yes" />
                            <span>Yes</span>
                          </label>
                          <label className="radio-option">
                            <input type="radio" name="previousDonation" value="no" />
                            <span>No</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <Button type="submit" className="donor-submit-btn">
                      <span className="submit-icon">🩸</span>
                      Register as Donor
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        {showSuccess && (
          <div className="modal" role="dialog" aria-modal="true">
            <div className="modal__card">
              <div className="modal__icon">✅</div>
              <h3 className="modal__title">Submitted successfully!</h3>
              <p className="modal__desc">Thank you for registering as a donor. We will reach out when you match a request.</p>
              <div className="modal__actions">
                <Button className="w-full" onClick={() => { setShowSuccess(false); setView('requests') }}>View Requests</Button>
              </div>
            </div>
          </div>
        )}

        {view === 'requests' && (
          <div className="requests">
            <div className="donor-view__header">
              <button className="back" onClick={() => setView('dashboard')}>
                <span className="material-symbols-rounded">arrow_back</span>
              </button>
              <div className="brand">
                <span className="brand__logo">🩸</span>
                <span className="brand__text"><strong>CONNECT</strong> <span className="accent">DONATE</span> SAVE</span>
              </div>
              <div className="header-spacer" />
            </div>

            <h1 className="requests-title">Blood Requests</h1>

            <div className="requests-list">
              {[
                { type:'AB+', name:'Patient A', phone:'9360284384', city:'City, State', time:'20 min ago' },
                { type:'A+',  name:'Patient B', phone:'9360284384', city:'City, State', time:'20 min ago' },
                { type:'B-',  name:'Patient C', phone:'9360284384', city:'City, State', time:'20 min ago' },
                { type:'O-',  name:'Patient D', phone:'9360284384', city:'City, State', time:'20 min ago' },
              ].map((r, idx) => (
                <div key={idx} className="req-card">
                  <div className="req-badge">{r.type}</div>
                  <div className="req-main">
                    <p className="req-name">{r.name}</p>
                    <p className="req-sub">Blood type</p>
                    <p className="req-sub">Hospital Name</p>
                    <div className="req-meta">
                      <span className="material-symbols-rounded">call</span>
                      <span>{r.phone}</span>
                    </div>
                  </div>
                  <div className="req-side">
                    <div className="req-loc"><span className="material-symbols-rounded">location_on</span><span>{r.city}</span></div>
                    <div className="req-time">{r.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'donor-detail' && selectedDonor && (
          <div className="detail">
            <div className="donor-view__header">
              <button className="back" onClick={() => setView('donor-search')}>
                <span className="material-symbols-rounded">arrow_back</span>
              </button>
              <div className="brand">
                <span className="brand__logo">🩸</span>
                <span className="brand__text"><strong>CONNECT</strong> <span className="accent">DONATE</span> SAVE</span>
              </div>
              <div className="header-spacer" />
            </div>

            <div className="detail-hero">
              <div className="detail-avatar"><span className="material-symbols-rounded">person</span></div>
              <h2 className="detail-name">{selectedDonor.name}</h2>
              <div className="detail-badge">{selectedDonor.type}</div>
              <p className="detail-last">Last Donation: {selectedDonor.lastDonation}</p>

              <div className="detail-meta">
                <div className="dm-item"><span className="material-symbols-rounded">my_location</span><span>{selectedDonor.dist} away</span></div>
                <div className="dm-item"><span className="avail {selectedDonor.available ? 'on' : 'off'}">{selectedDonor.available ? 'Available' : 'Unavailable'}</span></div>
                <div className="dm-item"><span className="material-symbols-rounded">location_on</span><span>{selectedDonor.city}, State</span></div>
              </div>

              <div className="detail-actions">
                <Button className="call-btn"><span className="material-symbols-rounded">call</span>Call</Button>
                <Button className="msg-btn"><span className="material-symbols-rounded">chat_bubble</span>Message</Button>
              </div>

              <Button className="req-btn">Request Blood</Button>
            </div>

            <div className="detail-info">
              <h3>Additional Information</h3>
              <div className="info-row"><span>Age</span><span>{selectedDonor.age}</span></div>
              <div className="info-row"><span>Gender</span><span>{selectedDonor.gender}</span></div>
              <div className="info-row"><span>Donated</span><span>{selectedDonor.donated} times</span></div>
              <div className="info-row"><span>Verified Donor</span><span>{selectedDonor.verified ? 'Yes' : 'No'}</span></div>
            </div>
          </div>
        )}

        {view === 'registered-info' && (
          <div className="register-view">
            <div className="donor-view__header">
              <button className="back" onClick={() => setView('dashboard')}>
                <span className="material-symbols-rounded">arrow_back</span>
              </button>
              <div className="brand">
                <span className="brand__logo">🩸</span>
                <span className="brand__text"><strong>CONNECT</strong> <span className="accent">DONATE</span> SAVE</span>
              </div>
              <div className="header-spacer" />
            </div>
            <div className="modal__card" style={{margin:"12px auto", maxWidth:520}}>
              <div className="modal__icon">🎉</div>
              <h3 className="modal__title">You’re already registered</h3>
              <p className="modal__desc">Thanks for signing up as a donor. You can view active requests or refill the form if your details changed.</p>
              <div className="modal__actions">
                <Button className="w-full" onClick={() => setView('requests')}>View Requests</Button>
                <Button className="w-full" variant="secondary" onClick={() => setView('donor-register')}>Refill Form</Button>
              </div>
            </div>
          </div>
        )}

        {view === 'welcome' && (
          <div className="welcome">
            <div className="welcome-card">
              <div className="welcome__logo">🩸</div>
              <div className="welcome__brand"><strong>CONNECT</strong> <span className="accent">DONATE</span> SAVE</div>
              <h1 className="welcome__title">Welcome!!</h1>
              <p className="welcome__tag">Connect.<span className="accent">Donate</span>.Save</p>
              <div className="welcome__actions">
                <Button className="welcome__btn" onClick={() => setView('login')}>Login</Button>
                <span className="welcome__or">or</span>
                <Button className="welcome__btn" onClick={() => setView('signup')}>Sign up</Button>
              </div>
              <p className="welcome__terms">Terms of privacy & policy<br/>conditions</p>
            </div>
            <p className="welcome__foot">Connect. Donate. Save. is a free platform that quickly links blood donors with those in need.</p>
          </div>
        )}

        {view === 'login' && (
          <div className="login">
            <div className="login-back">
              <button className="back-button" onClick={() => setView('welcome')}>
                <span className="material-symbols-rounded">arrow_back</span>
                <span className="back-text">Back</span>
              </button>
            </div>
            
            <div className="login-header">
              <div className="login-logo">
                <div className="login-logo__icon">🩸</div>
              </div>
              <div className="login-brand">
                <div className="login-brand__line">CONNECT</div>
                <div className="login-brand__line login-brand__line--accent">DONATE</div>
                <div className="login-brand__line">SAVE</div>
              </div>
            </div>

            <form className="login-form" onSubmit={handleLogin}>
              {authError && (
                <div className="auth-error">
                  <span className="material-symbols-rounded">error</span>
                  <span>{authError}</span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <Input 
                  id="email"
                  name="email"
                  type="email" 
                  className="form-input" 
                  placeholder="Enter your email address"
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <Input 
                  id="password"
                  name="password"
                  type="password" 
                  className="form-input" 
                  placeholder="Enter your password"
                  required 
                />
              </div>

              <div className="form-links">
                <button type="button" className="forgot-link as-button" onClick={() => setView('forgot')}>Forgot Password ?</button>
              </div>

              <Button type="submit" className="login-submit" disabled={authLoading}>
                {authLoading ? 'Logging in...' : 'SUBMIT'}
              </Button>
            </form>
          </div>
        )}

        {view === 'signup' && (
          <div className="signup">
            <div className="signup-header">
              <div className="signup-logo">
                <div className="signup-logo__icon">🩸</div>
              </div>
              <div className="signup-brand">
                <div className="signup-brand__line">CONNECT</div>
                <div className="signup-brand__line signup-brand__line--accent">DONATE</div>
                <div className="signup-brand__line">SAVE</div>
              </div>
            </div>

            <form className="signup-form" onSubmit={handleSignup}>
              <h2 className="signup-title">Create Your Account</h2>
              
              {authError && (
                <div className="auth-error">
                  <span className="material-symbols-rounded">error</span>
                  <span>{authError}</span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="signup-username" className="form-label">Username</label>
                <Input 
                  id="signup-username"
                  name="username"
                  type="text" 
                  className="form-input" 
                  placeholder="Choose a username"
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="signup-email" className="form-label">Email Address</label>
                <Input 
                  id="signup-email"
                  name="email"
                  type="email" 
                  className="form-input" 
                  placeholder="Enter your email"
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="signup-password" className="form-label">Password</label>
                <Input 
                  id="signup-password"
                  name="password"
                  type="password" 
                  className="form-input" 
                  placeholder="Create a password"
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="signup-phone" className="form-label">Phone Number</label>
                <Input 
                  id="signup-phone"
                  name="phone"
                  type="tel" 
                  className="form-input" 
                  placeholder="Enter your phone number"
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="signup-blood-type" className="form-label">Blood Type</label>
                <Select id="signup-blood-type" name="bloodType" className="form-input" required>
                  <option value="">Select your blood type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </Select>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" required />
                  <span>I agree to the <a href="#" className="terms-link">Terms of Service</a> and <a href="#" className="terms-link">Privacy Policy</a></span>
                </label>
              </div>

              <div className="form-links">
                <a href="#" className="forgot-link">Already have an account? Login</a>
              </div>

              <Button type="submit" className="signup-submit" disabled={authLoading}>
                {authLoading ? 'Creating Account...' : 'SUBMIT'}
              </Button>
            </form>
          </div>
        )}

        {view === 'forgot' && (
          <div className="forgot">
            <form className="forgot-form" onSubmit={(e)=>{ e.preventDefault(); setShowLoginSuccess(true); setTimeout(()=>{ setShowLoginSuccess(false); setView('login') }, 2500) }}>
              <h2 className="forgot-title">Reset your password</h2>
              <p className="forgot-desc">Enter the email associated with your account and we'll send you a link to reset your password.</p>
              <div className="form-group">
                <label htmlFor="forgot-email" className="form-label">Email Address</label>
                <Input id="forgot-email" type="email" className="form-input" placeholder="you@example.com" required />
              </div>
              <div className="forgot-actions">
                <Button type="submit" className="forgot-submit">Send Reset Link</Button>
                <Button type="button" className="forgot-cancel" onClick={()=> setView('login')}>Back to Login</Button>
              </div>
            </form>
          </div>
        )}

        {showLoginSuccess && (
          <div className="modal" role="dialog" aria-modal="true">
            <div className="modal__card login-success-modal">
              <div className="modal__icon">✅</div>
              <h3 className="modal__title">Logged in successfully!</h3>
              <p className="modal__desc">Welcome back! You are now logged into your account.</p>
            </div>
          </div>
        )}

        {showSignupSuccess && (
          <div className="modal" role="dialog" aria-modal="true">
            <div className="modal__card signup-success-modal">
              <div className="modal__icon">🎉</div>
              <h3 className="modal__title">Account created successfully!</h3>
              <p className="modal__desc">Welcome to BloodLink! Your account has been created and you're now ready to help save lives.</p>
            </div>
          </div>
        )}
      </main>
      </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
