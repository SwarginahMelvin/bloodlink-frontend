import './App.css'
import { useEffect, useState } from 'react'
import { Button } from './components/ui/button.jsx'
import { Input } from './components/ui/input.jsx'
import { Select } from './components/ui/select.jsx'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card.jsx'

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

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [view, setView] = useState('welcome')
  const [withinKm, setWithinKm] = useState('')
  const [location, setLocation] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [showLoginSuccess, setShowLoginSuccess] = useState(false)
  const [showSignupSuccess, setShowSignupSuccess] = useState(false)
  const [selectedDonor, setSelectedDonor] = useState(null)
  const [isRegistered, setIsRegistered] = useState(false)

  useEffect(() => {
    try {
      const flag = localStorage.getItem('donorRegistered')
      setIsRegistered(flag === 'true')
    } catch {}
  }, [])
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
  return (
    <div className="page">
      {!(view === 'welcome' || view === 'login' || view === 'signup') && (
      <header className="header">
        <div className="header__left">
          <button className="avatar" aria-label="Open profile" onClick={() => setView('profile')}>
            <span className="material-symbols-rounded">person</span>
          </button>
          <div className="greeting">
            <p className="greeting__hi">Hello User!</p>
            <p className="greeting__subtitle">Ready to Support</p>
          </div>
      </div>
        {view === 'dashboard' && (
          <nav className="top-nav" aria-label="Primary">
            <button className="chip" onClick={() => setView('dashboard')}>Home</button>
            <button className="chip" onClick={() => setView('donor-search')}>Donor</button>
            <button className="chip" onClick={() => setView('dashboard')}>About Us</button>
            <button className="chip" onClick={() => setView('welcome')}>Logout</button>
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
      {mobileMenuOpen && (
        <div id="mobile-menu" className="mobile-menu" role="menu">
          <button className="menu-item" onClick={() => { setView('dashboard'); setMobileMenuOpen(false) }}>Home</button>
          <button className="menu-item" onClick={() => { setView('donor-search'); setMobileMenuOpen(false) }}>Donor</button>
          <button className="menu-item" onClick={() => { setView('requests'); setMobileMenuOpen(false) }}>Requests</button>
          <button className="menu-item" onClick={() => { setView('dashboard'); setMobileMenuOpen(false) }}>About Us</button>
          <button className="menu-item menu-item--danger" onClick={() => { setView('welcome'); setMobileMenuOpen(false) }}>Logout</button>
        </div>
      )}

      <main className="content">
        {view === 'dashboard' && (
          <>
            <section className="hero">
              <h1 className="hero__title">Give Blood Give Hope</h1>
              <div className="hero__ctas cta-group">
                <Button className="cta-btn" onClick={() => setView('donor-search')}>GET A DONOR</Button>
                <Button className="cta-btn" onClick={() => setView(isRegistered ? 'registered-info' : 'donor-register')}>BE A DONOR</Button>
              </div>
            </section>

            <section className="stats">
              <div className="stats__top">
                <Card className="stat-card">
                  <CardContent className="p-4">
                    <div className="stat-card__row">
                      <span className="stat-card__icon" aria-hidden>
                        <span className="material-symbols-rounded">bloodtype</span>
                      </span>
                      <div className="stat-card__meta">
                        <p className="stat-card__title">Emergency Requests</p>
                        <p className="stat-card__value">25</p>
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
                        <p className="stat-card__value">100+</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="stats__grid">
                {[
                  ["A+ve","15"],["A-ve","10"],["B+ve","18"],["B-ve","5"],["O+ve","30"],["O-ve","10"]
                ].map(([label,value],i)=> (
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

        {view === 'donor-search' && (
          <div className="donor-view">
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

            <h1 className="donor-title">Donate Blood</h1>

            <div className="search-panel">
              <p className="search-panel__label">Blood type</p>
              <div className="search-panel__controls">
                <Select aria-label="Location" value={location} onChange={(e) => setLocation(e.target.value)}>
                  <option>Location</option>
                  <option value="City">City</option>
                  <option value="Town">Town</option>
                  <option value="Metro">Metro</option>
                </Select>
                <Select aria-label="Within" value={withinKm} onChange={(e) => setWithinKm(e.target.value)}>
                  <option value="">Within</option>
                  <option value="5">5 Km</option>
                  <option value="10">10 Km</option>
                  <option value="15">15 Km</option>
                </Select>
              </div>
              <Button className="btn--search h-11 font-extrabold" onClick={onSearch}>Search</Button>
            </div>

            <h3 className="donor-subtitle">Matching Blood Donors</h3>

            <div className="donor-grid">
              {filteredDonors.map((d, i) => (
                <div key={i} className="donor-card" onClick={() => { setSelectedDonor(d); setView('donor-detail') }} role="button" tabIndex={0} onKeyDown={(e)=>{ if(e.key==='Enter'){ setSelectedDonor(d); setView('donor-detail') }}}>
                  <div className="donor-chip">
                    <span className="donor-chip__type">{d.type}</span>
                  </div>
                  <div className="donor-info">
                    <p className="donor-name">{d.name}</p>
                    <p className="donor-meta">Blood type</p>
                  </div>
                  <div className="donor-side">
                    <span className="donor-distance">{d.dist}</span>
                  </div>
                  <div className="donor-footer">
                    <span className="material-symbols-rounded">location_on</span>
                    <span>{d.city}, State</span>
                    <span className="dot">•</span>
                    <span>{d.time}</span>
                  </div>
                  <button className="donor-action" aria-label="View donor">
                    <span className="material-symbols-rounded">chevron_right</span>
                  </button>
                </div>
              ))}
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

            <h1 className="register-title">REGISTRATION FORM</h1>

            <form className="register-card" onSubmit={(e) => { e.preventDefault(); try { localStorage.setItem('donorRegistered','true') } catch {} setIsRegistered(true); setShowSuccess(true); }}>
              <div className="form-row">
                <label>Full Name <span className="req">*</span></label>
                <Input required />
              </div>
              <div className="form-row">
                <label>Gender <span className="req">*</span></label>
                <Input required />
              </div>
              <div className="form-row">
                <label>Date of Birth <span className="req">*</span></label>
                <Input type="date" required />
              </div>
              <div className="form-row">
                <label>Mobile Number <span className="req">*</span></label>
                <Input type="tel" required />
              </div>
              <div className="form-row">
                <label>Select Country <span className="req">*</span></label>
                <Select required>
                  <option value="">Select</option>
                  <option>India</option>
                </Select>
              </div>
              <div className="form-row">
                <label>Select State <span className="req">*</span></label>
                <Select required>
                  <option value="">Select</option>
                  <option>Tamil Nadu</option>
                </Select>
              </div>
              <div className="form-row">
                <label>Select City <span className="req">*</span></label>
                <Select required>
                  <option value="">Select</option>
                  <option>Chennai</option>
                </Select>
              </div>
              <div className="form-row">
                <label>Street Address <span className="req">*</span></label>
                <Input required />
              </div>
              <div className="form-row">
                <label>Blood Group <span className="req">*</span></label>
                <Select required>
                  <option value="">Select</option>
                  <option>O+</option>
                  <option>O-</option>
                  <option>A+</option>
                  <option>A-</option>
                  <option>B+</option>
                  <option>B-</option>
                  <option>AB+</option>
                  <option>AB-</option>
                </Select>
              </div>
              <div className="form-row">
                <label>Weight <span className="req">*</span></label>
                <Select required>
                  <option value="">Select</option>
                  <option>50kg</option>
                  <option>55kg</option>
                  <option>60kg</option>
                </Select>
              </div>

              <div className="form-terms">
                <label className="terms-line">
                  <input type="checkbox" required />
                  <span>I agree to the terms and conditions</span>
                </label>
                <label className="prev-line">
                  <span>Have You Donated Previously?</span>
                  <span className="yn">
                    <label><input type="radio" name="prev" /> YES</label>
                    <label><input type="radio" name="prev" /> NO</label>
                  </span>
                </label>
              </div>

              <Button type="submit" className="register-submit">Submit</Button>
            </form>
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

            <form className="login-form" onSubmit={(e) => { 
              e.preventDefault(); 
              setShowLoginSuccess(true);
              setTimeout(() => {
                setShowLoginSuccess(false);
                setView('dashboard');
              }, 2000);
            }}>
              <div className="form-group">
                <label htmlFor="username" className="form-label">Username</label>
                <Input 
                  id="username"
                  type="text" 
                  className="form-input" 
                  placeholder="Enter your username"
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <Input 
                  id="password"
                  type="password" 
                  className="form-input" 
                  placeholder="Enter your password"
                  required 
                />
              </div>

              <div className="form-links">
                <button type="button" className="forgot-link as-button" onClick={() => setView('forgot')}>Forgot Password ?</button>
              </div>

              <Button type="submit" className="login-submit">SUBMIT</Button>
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

            <form className="signup-form" onSubmit={(e) => { 
              e.preventDefault(); 
              setShowSignupSuccess(true);
              setTimeout(() => {
                setShowSignupSuccess(false);
                setView('dashboard');
              }, 3000);
            }}>
              <h2 className="signup-title">Create Your Account</h2>
              
              <div className="form-group">
                <label htmlFor="signup-username" className="form-label">Username</label>
                <Input 
                  id="signup-username"
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
                  type="password" 
                  className="form-input" 
                  placeholder="Create a password"
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="signup-confirm-password" className="form-label">Confirm Password</label>
                <Input 
                  id="signup-confirm-password"
                  type="password" 
                  className="form-input" 
                  placeholder="Confirm your password"
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="signup-phone" className="form-label">Phone Number</label>
                <Input 
                  id="signup-phone"
                  type="tel" 
                  className="form-input" 
                  placeholder="Enter your phone number"
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="signup-blood-type" className="form-label">Blood Type</label>
                <Select id="signup-blood-type" className="form-input" required>
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

              <Button type="submit" className="signup-submit">SUBMIT</Button>
            </form>
          </div>
        )}

        {view === 'forgot' && (
          <div className="forgot">
            <div className="forgot-header">
              <div className="forgot-logo"><div className="forgot-logo__icon">🩸</div></div>
              <div className="forgot-brand">
                <div className="forgot-brand__line">CONNECT</div>
                <div className="forgot-brand__line forgot-brand__line--accent">DONATE</div>
                <div className="forgot-brand__line">SAVE</div>
              </div>
            </div>

            <form className="forgot-form" onSubmit={(e)=>{ e.preventDefault(); setShowLoginSuccess(true); setTimeout(()=>{ setShowLoginSuccess(false); setView('login') }, 2500) }}>
              <h2 className="forgot-title">Reset your password</h2>
              <p className="forgot-desc">Enter the email associated with your account and we’ll send you a link to reset your password.</p>
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

export default App
