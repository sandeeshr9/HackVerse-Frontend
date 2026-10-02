import { useState, useEffect, useMemo } from 'react'
import './App.css'
import './styles/Auth.css'
import { supabase } from './lib/supabase'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/useAuth'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

const defaultHackathons = [
  {
    name: 'Innovate for Tomorrow',
    organizer: 'National Innovation Challenge',
    date: 'OCT 18, 2026',
    mode: 'Online',
    tags: ['AI/ML', 'Web Development'],
    color: '#8b5cf6',
  },
  {
    name: 'Build with AI',
    organizer: 'Future Tech Community',
    date: 'OCT 24, 2026',
    mode: 'Hybrid',
    tags: ['Artificial Intelligence', 'Python'],
    color: '#06b6d4',
  },
  {
    name: 'Smart India Challenge',
    organizer: 'Student Innovation Network',
    date: 'NOV 02, 2026',
    mode: 'Offline',
    tags: ['IoT', 'Robotics'],
    color: '#f59e0b',
  },
]

const teammates = [
  {
    name: 'Priya — AI Developer',
    skills: ['Python', 'AI/ML'],
  },
  {
    name: 'Arun — Web Developer',
    skills: ['React', 'JavaScript'],
  },
  {
    name: 'Karthik — Hardware Engineer',
    skills: ['IoT', 'Robotics'],
  },
]

const initialMilestones = [
  { id: 1, title: 'Form team & define problem statement', phase: 'Phase 1 · Planning', done: true },
  { id: 2, title: 'Research competitors & gather user requirements', phase: 'Phase 2 · Research', done: true },
  { id: 3, title: 'Build interactive UI prototype in React', phase: 'Phase 3 · Frontend', done: false },
  { id: 4, title: 'Configure Supabase database & backend APIs', phase: 'Phase 4 · Backend', done: false },
  { id: 5, title: 'Polish pitch deck & record 2-minute demo video', phase: 'Phase 5 · Submission', done: false },
]

function AppContent() {
  const { user, loading: authLoading, signOut, isRecovery, setAuthNotification } = useAuth()

  // Routing State
  const [currentRoute, setCurrentRoute] = useState(() => {
    if (typeof window === 'undefined') return 'dashboard'
    const pathname = window.location.pathname.toLowerCase()
    const hash = window.location.hash.toLowerCase()

    if (hash.includes('type=recovery') || pathname === '/reset-password') return 'reset-password'
    if (pathname === '/login' || hash === '#login') return 'login'
    if (pathname === '/register' || pathname === '/signup' || hash === '#register') return 'register'
    if (pathname === '/forgot-password' || hash === '#forgot-password') return 'forgot-password'

    return 'dashboard'
  })

  // Derived effective route (if in recovery mode, ensure reset-password displays)
  const activeRoute = isRecovery ? 'reset-password' : currentRoute

  const [redirectDestination, setRedirectDestination] = useState('dashboard')
  const [activeNav, setActiveNav] = useState('discover')
  const [roadmap, setRoadmap] = useState([])
  const [ideaInput, setIdeaInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [teamSearch, setTeamSearch] = useState('')
  const [hackathonData, setHackathonData] = useState(defaultHackathons)
  const [loadingHackathons, setLoadingHackathons] = useState(true)
  const [selectedMentor, setSelectedMentor] = useState(null)
  const [actionNotice, setActionNotice] = useState(null)

  // Project Tracker State (initialized from localStorage if available)
  const [trackerTasks, setTrackerTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('hackverse_tracker_tasks')
      if (saved) return JSON.parse(saved)
    } catch {
      // fallback to initialMilestones
    }
    return initialMilestones
  })

  const [newTaskInput, setNewTaskInput] = useState('')

  const saveTasks = (newTasks) => {
    setTrackerTasks(newTasks)
    try {
      localStorage.setItem('hackverse_tracker_tasks', JSON.stringify(newTasks))
    } catch {
      // ignore storage write errors
    }
  }

  // Handle URL history and browser back/forward buttons
  useEffect(() => {
    const handleLocationChange = () => {
      const pathname = window.location.pathname.toLowerCase()
      const hash = window.location.hash.toLowerCase()

      if (hash.includes('type=recovery') || pathname === '/reset-password') {
        setCurrentRoute('reset-password')
        return
      }

      if (pathname === '/login' || hash === '#login') {
        setCurrentRoute('login')
      } else if (pathname === '/register' || pathname === '/signup' || hash === '#register') {
        setCurrentRoute('register')
      } else if (pathname === '/forgot-password' || hash === '#forgot-password') {
        setCurrentRoute('forgot-password')
      } else if (pathname === '/reset-password' || hash === '#reset-password') {
        setCurrentRoute('reset-password')
      } else {
        setCurrentRoute('dashboard')
        // Check hash for dashboard sections
        if (hash === '#mentors') setActiveNav('mentors')
        else if (hash === '#teams') setActiveNav('teams')
        else if (hash === '#prepare') setActiveNav('prepare')
        else if (hash === '#tracker') setActiveNav('tracker')
        else if (hash === '#discover' || hash === '#home') setActiveNav('discover')
      }
    }

    window.addEventListener('popstate', handleLocationChange)
    window.addEventListener('hashchange', handleLocationChange)

    return () => {
      window.removeEventListener('popstate', handleLocationChange)
      window.removeEventListener('hashchange', handleLocationChange)
    }
  }, [])

  const navigateTo = (route, destination = null) => {
    if (destination) setRedirectDestination(destination)

    let urlPath = '/'
    if (route === 'login') urlPath = '/login'
    else if (route === 'register') urlPath = '/register'
    else if (route === 'forgot-password') urlPath = '/forgot-password'
    else if (route === 'reset-password') urlPath = '/reset-password'
    else if (route === 'dashboard') {
      urlPath = destination ? `#${destination}` : '/'
      if (destination) setActiveNav(destination)
    }

    if (typeof window !== 'undefined' && window.history?.pushState) {
      window.history.pushState({}, '', urlPath)
    }
    setCurrentRoute(route)
    if (typeof window !== 'undefined' && window.scrollTo) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Fetch hackathons from Supabase
  useEffect(() => {
    let isMounted = true

    async function fetchHackathons() {
      try {
        let { data, error } = await supabase
          .from('hackathons')
          .select('*')

        if ((error || !data || data.length === 0) && isMounted) {
          const fallbackRes = await supabase
            .from('Hackathons')
            .select('*')
          if (!fallbackRes.error && fallbackRes.data && fallbackRes.data.length > 0) {
            data = fallbackRes.data
            error = null
          }
        }

        if (isMounted) {
          if (!error && data && data.length > 0) {
            setHackathonData(data)
          }
        }
      } catch (err) {
        console.warn('Notice: Using local default hackathons catalog.', err)
      } finally {
        if (isMounted) {
          setLoadingHackathons(false)
        }
      }
    }

    fetchHackathons()

    return () => {
      isMounted = false
    }
  }, [])

  const filteredHackathons = useMemo(() => {
    return hackathonData.filter((event) => {
      const query = searchTerm.toLowerCase().trim()
      if (!query) return true

      const nameMatch = event.name?.toLowerCase().includes(query)
      const orgMatch = event.organizer?.toLowerCase().includes(query)
      const tagsMatch = Array.isArray(event.tags)
        ? event.tags.some((tag) => tag.toLowerCase().includes(query))
        : typeof event.tags === 'string'
          ? event.tags.toLowerCase().includes(query)
          : false

      return Boolean(nameMatch || orgMatch || tagsMatch)
    })
  }, [hackathonData, searchTerm])

  const filteredTeammates = useMemo(() => {
    return teammates.filter((person) => {
      const query = teamSearch.toLowerCase().trim()
      if (!query) return true

      return (
        person.name.toLowerCase().includes(query) ||
        person.skills.some((skill) => skill.toLowerCase().includes(query))
      )
    })
  }, [teamSearch])

  const handleGenerateRoadmap = () => {
    const trimmed = ideaInput.trim()
    if (!trimmed) {
      alert('Please enter your hackathon idea first.')
      return
    }

    setRoadmap([
      `Define problem statement & target audience: ${trimmed}`,
      'Conduct market research and identify unique competitive advantages.',
      'Select technical stack: React for UI, Supabase for realtime DB & Auth.',
      'Develop core MVP functionality and perform initial testing with peers.',
      'Build final pitch deck, prepare presentation slides, and record demo video.',
    ])
  }

  const toggleTask = (taskId) => {
    const updated = trackerTasks.map((task) =>
      task.id === taskId ? { ...task, done: !task.done } : task
    )
    saveTasks(updated)
  }

  const handleAddTask = () => {
    const trimmed = newTaskInput.trim()
    if (!trimmed) return

    if (!user) {
      setAuthNotification('Create a free account or sign in to save your custom milestones across sessions.')
      navigateTo('login', 'tracker')
      return
    }

    const nextId = trackerTasks.length > 0 ? Math.max(...trackerTasks.map((t) => t.id || 0)) + 1 : 1
    const updated = [
      ...trackerTasks,
      {
        id: nextId,
        title: trimmed,
        phase: `Milestone ${trackerTasks.length + 1} · Custom`,
        done: false,
      },
    ]
    saveTasks(updated)
    setNewTaskInput('')
  }

  const handleConnectTeammate = (teammateName) => {
    if (!user) {
      setAuthNotification(`Sign in or create an account to connect with ${teammateName.split(' ')[0]}.`)
      navigateTo('login', 'teams')
      return
    }
    setActionNotice(`Connection request dispatched to ${teammateName.split(' ')[0]}!`)
    setTimeout(() => setActionNotice(null), 4000)
  }

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (!error) {
      setActionNotice('You have successfully signed out.')
      setTimeout(() => setActionNotice(null), 3500)
    }
  }

  // Compute user display details
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Innovator'
  const userInitial = userName.charAt(0).toUpperCase()

  // Route Views: Login, Register, Forgot Password, Reset Password
  if (activeRoute === 'login') {
    return <Login onNavigate={navigateTo} redirectPath={redirectDestination} />
  }

  if (activeRoute === 'register') {
    return <Register onNavigate={navigateTo} />
  }

  if (activeRoute === 'forgot-password') {
    return <ForgotPassword onNavigate={navigateTo} />
  }

  if (activeRoute === 'reset-password') {
    return <ResetPassword onNavigate={navigateTo} />
  }

  // Dashboard / Workspace View
  return (
    <div className="app-shell">
      {/* Toast notification */}
      {actionNotice && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 10000,
            background: 'rgba(18, 17, 28, 0.95)',
            border: '1px solid #8b5cf6',
            color: '#eeeef8',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <span style={{ color: '#10b981' }}>✓</span>
          <span>{actionNotice}</span>
        </div>
      )}

      <aside className="sidebar">
        <a
          className="brand"
          href="#home"
          onClick={(e) => {
            e.preventDefault()
            setActiveNav('discover')
            navigateTo('dashboard')
          }}
        >
          <span className="brand-icon">H</span>
          <span>
            Hack<span className="brand-accent">Verse</span>
          </span>
        </a>

        <p className="nav-label">WORKSPACE</p>
        <nav className="navigation">
          <a
            className={`nav-item ${activeNav === 'discover' ? 'active' : ''}`}
            href="#discover"
            onClick={(e) => {
              e.preventDefault()
              setActiveNav('discover')
            }}
          >
            ◈ <span>Discover</span>
          </a>
          <a
            className={`nav-item ${activeNav === 'mentors' ? 'active' : ''}`}
            href="#mentors"
            onClick={(e) => {
              e.preventDefault()
              setActiveNav('mentors')
            }}
          >
            ◎ <span>Mentors</span>
          </a>
          <a
            className={`nav-item ${activeNav === 'teams' ? 'active' : ''}`}
            href="#teams"
            onClick={(e) => {
              e.preventDefault()
              setActiveNav('teams')
            }}
          >
            ♧ <span>Find a Team</span>
          </a>
          <a
            className={`nav-item ${activeNav === 'prepare' ? 'active' : ''}`}
            href="#prepare"
            onClick={(e) => {
              e.preventDefault()
              setActiveNav('prepare')
            }}
          >
            ✳ <span>AI Preparation</span>
          </a>
          <a
            className={`nav-item ${activeNav === 'tracker' ? 'active' : ''}`}
            href="#tracker"
            onClick={(e) => {
              e.preventDefault()
              setActiveNav('tracker')
            }}
          >
            ▦ <span>Project Tracker</span>
          </a>
        </nav>

        {/* Sidebar Bottom: Dynamic Profile / Auth Status */}
        <div className="sidebar-user-section">
          {authLoading ? (
            <div className="sidebar-user-info">
              <div className="profile-avatar">⋯</div>
              <div className="sidebar-user-details">
                <strong>Loading session...</strong>
              </div>
            </div>
          ) : user ? (
            <>
              <div className="sidebar-user-info">
                <div className="profile-avatar">{userInitial}</div>
                <div className="sidebar-user-details">
                  <strong>{userName}</strong>
                  <p title={user.email}>{user.email}</p>
                </div>
              </div>
              <button
                type="button"
                className="sidebar-logout-btn"
                onClick={handleSignOut}
                id="sidebar-logout-button"
              >
                <span>⎋</span>
                <span>Log out</span>
              </button>
            </>
          ) : (
            <div className="sidebar-auth-prompt">
              <div className="sidebar-user-info">
                <div className="profile-avatar" style={{ background: '#232034', color: '#9d98b9' }}>
                  G
                </div>
                <div className="sidebar-user-details">
                  <strong>Guest Explorer</strong>
                  <p>Sign in to save progress</p>
                </div>
              </div>
              <div className="sidebar-auth-btns">
                <button
                  type="button"
                  className="sidebar-auth-btn sidebar-auth-login"
                  onClick={() => navigateTo('login')}
                  id="sidebar-login-button"
                >
                  Log in
                </button>
                <button
                  type="button"
                  className="sidebar-auth-btn sidebar-auth-signup"
                  onClick={() => navigateTo('register')}
                  id="sidebar-register-button"
                >
                  Sign up
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      <main className="main-content" id="home">
        <header className="topbar">
          <span className="breadcrumb">
            Workspace / <strong>{activeNav.charAt(0).toUpperCase() + activeNav.slice(1)}</strong>
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span className="status">
              <span className="status-dot" /> {user ? 'WORKSPACE ACTIVE · READY TO BUILD' : 'YOUR NEXT BIG IDEA STARTS HERE'}
            </span>

            {/* Topbar User Action / Login Controls */}
            {!authLoading && (
              <div className="topbar-auth-group">
                {user ? (
                  <>
                    <div className="user-menu-pill">
                      <span className="user-menu-avatar">{userInitial}</span>
                      <span className="user-menu-name">{userName}</span>
                    </div>
                    <button
                      type="button"
                      className="topbar-btn topbar-btn-logout"
                      onClick={handleSignOut}
                      id="topbar-logout-button"
                    >
                      <span>⎋</span>
                      <span>Log Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="topbar-btn topbar-btn-ghost"
                      onClick={() => navigateTo('login')}
                      id="topbar-login-button"
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      className="topbar-btn topbar-btn-primary"
                      onClick={() => navigateTo('register')}
                      id="topbar-register-button"
                    >
                      Create Account ↗
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </header>

        <section className="hero-section">
          <div className="hero-copy">
            <div className="eyebrow">
              <span>✦</span> YOUR HACKATHON JOURNEY, UPGRADED
            </div>
            <h1>
              Build something
              <br /> <span>extraordinary.</span>
            </h1>
            <p className="hero-description">
              Discover opportunities, find your people, and turn your ideas into innovations. Your next
              breakthrough starts here.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a
                href="#discover"
                className="primary-button"
                onClick={(e) => {
                  e.preventDefault()
                  setActiveNav('discover')
                }}
              >
                Explore hackathons <span>↗</span>
              </a>
              {!user && (
                <button
                  type="button"
                  className="event-button"
                  style={{ width: 'auto', padding: '14px 22px', fontSize: '12px' }}
                  onClick={() => navigateTo('register')}
                >
                  Join HackVerse
                </button>
              )}
            </div>
            <div className="hero-footnote">
              DISCOVER <span>·</span> CONNECT <span>·</span> BUILD <span>·</span> GROW
            </div>
          </div>

          <div className="hero-visual">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="orbit orbit-three" />
            <div className="hero-core">
              <span className="core-symbol">H</span>
              <span className="core-label">IDEAS IN MOTION</span>
            </div>
            <span className="floating-tag tag-one">✳ AI POWERED</span>
            <span className="floating-tag tag-two">⌘ TEAM UP</span>
            <span className="floating-tag tag-three">↗ LEVEL UP</span>
          </div>
        </section>

        <section className="stats-grid">
          <a
            href="#discover"
            className="stat-card"
            onClick={(e) => {
              e.preventDefault()
              setActiveNav('discover')
            }}
          >
            <span className="stat-icon purple">◈</span>
            <div>
              <p>Opportunities</p>
              <strong>Discover more</strong>
            </div>
            <span className="stat-arrow">↗</span>
          </a>
          <a
            href="#mentors"
            className="stat-card"
            onClick={(e) => {
              e.preventDefault()
              setActiveNav('mentors')
            }}
          >
            <span className="stat-icon cyan">◎</span>
            <div>
              <p>Mentor network</p>
              <strong>Find your guide</strong>
            </div>
            <span className="stat-arrow">↗</span>
          </a>
          <a
            href="#prepare"
            className="stat-card"
            onClick={(e) => {
              e.preventDefault()
              setActiveNav('prepare')
            }}
          >
            <span className="stat-icon orange">✳</span>
            <div>
              <p>Skill development</p>
              <strong>Prepare smarter</strong>
            </div>
            <span className="stat-arrow">↗</span>
          </a>
        </section>

        {/* SECTION: Discover Hackathons */}
        <section className="hackathon-section" id="discover">
          <div className="section-heading">
            <div>
              <p className="eyebrow">FIND YOUR NEXT CHALLENGE</p>
              <h2>
                Explore hackathons<span>.</span>
              </h2>
              <p className="section-subtitle">Opportunities to learn, build, and make an impact.</p>
            </div>
            <span className="demo-label">
              {loadingHackathons ? 'SYNCING CATALOG...' : `${filteredHackathons.length} EVENTS AVAILABLE`}
            </span>
          </div>

          <div className="search-bar">
            <span>⌕</span>
            <input
              aria-label="Search hackathons"
              placeholder="Search hackathons, skills, or interests..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            {searchTerm && (
              <button type="button" onClick={() => setSearchTerm('')}>
                Clear
              </button>
            )}
          </div>

          <div className="hackathon-grid">
            {filteredHackathons.map((event) => (
              <article className="hackathon-card" key={event.name}>
                <div className="event-banner" style={{ '--event-color': event.color || '#8b5cf6' }}>
                  <span className="event-symbol">✳</span>
                  <span className="event-mode">{event.mode || 'Online'}</span>
                </div>
                <div className="event-details">
                  <p className="event-organizer">{event.organizer}</p>
                  <h3>{event.name}</h3>
                  <p className="event-date">◷ &nbsp; {event.date}</p>
                  <div className="event-tags">
                    {Array.isArray(event.tags) ? (
                      event.tags.map((tag) => <span key={tag}>{tag}</span>)
                    ) : event.tags ? (
                      <span>{String(event.tags)}</span>
                    ) : null}
                  </div>
                  <button type="button" className="event-button">
                    View opportunity ↗
                  </button>
                </div>
              </article>
            ))}
          </div>

          {filteredHackathons.length === 0 && (
            <p className="demo-note" style={{ padding: '24px 0' }}>
              No hackathons found matching &ldquo;{searchTerm}&rdquo;. Try another search term.
            </p>
          )}

          <p className="demo-note">Live and demo hackathon listings connected to Supabase backend.</p>
        </section>

        {/* SECTION: Mentors */}
        <section className="hackathon-section" id="mentors">
          <div className="section-heading">
            <div>
              <p className="eyebrow">LEARN FROM THE BEST</p>
              <h2>
                Meet your mentors<span>.</span>
              </h2>
              <p className="section-subtitle">
                Get guidance from people who have built, shipped, and won.
              </p>
            </div>
            <span className="demo-label">MENTOR NETWORK</span>
          </div>

          <div className="hackathon-grid">
            <article className="hackathon-card">
              <div className="event-banner" style={{ '--event-color': '#8b5cf6' }}>
                <span className="event-symbol">AI</span>
                <span className="event-mode">AI / ML</span>
              </div>
              <div className="event-details">
                <p className="event-organizer">Machine Learning</p>
                <h3>AI Mentor</h3>
                <p className="section-subtitle">Guidance on ML models, datasets, and AI prototypes.</p>
                <div className="event-tags">
                  <span>Python</span>
                  <span>AI/ML</span>
                </div>
                <button
                  type="button"
                  className="event-button"
                  onClick={() =>
                    setSelectedMentor({
                      name: 'AI Mentor',
                      skills: 'Python, AI/ML',
                      guidance: 'ML models, datasets, and AI prototypes',
                    })
                  }
                >
                  Mentor profile ↗
                </button>
              </div>
            </article>

            <article className="hackathon-card">
              <div className="event-banner" style={{ '--event-color': '#06b6d4' }}>
                <span className="event-symbol">⌘</span>
                <span className="event-mode">WEB DEV</span>
              </div>
              <div className="event-details">
                <p className="event-organizer">Web Development</p>
                <h3>Full-Stack Mentor</h3>
                <p className="section-subtitle">Guidance on building websites, APIs, and databases.</p>
                <div className="event-tags">
                  <span>React</span>
                  <span>Supabase</span>
                </div>
                <button
                  type="button"
                  className="event-button"
                  onClick={() =>
                    setSelectedMentor({
                      name: 'Full-Stack Mentor',
                      skills: 'React, Supabase',
                      guidance: 'Websites, APIs, and databases',
                    })
                  }
                >
                  Mentor profile ↗
                </button>
              </div>
            </article>

            <article className="hackathon-card">
              <div className="event-banner" style={{ '--event-color': '#f59e0b' }}>
                <span className="event-symbol">✳</span>
                <span className="event-mode">HARDWARE</span>
              </div>
              <div className="event-details">
                <p className="event-organizer">Engineering & IoT</p>
                <h3>Hardware Mentor</h3>
                <p className="section-subtitle">Guidance on sensors, embedded systems, and prototypes.</p>
                <div className="event-tags">
                  <span>IoT</span>
                  <span>Robotics</span>
                </div>
                <button
                  type="button"
                  className="event-button"
                  onClick={() =>
                    setSelectedMentor({
                      name: 'Hardware Mentor',
                      skills: 'IoT, Robotics',
                      guidance: 'Sensors, embedded systems, and prototypes',
                    })
                  }
                >
                  Mentor profile ↗
                </button>
              </div>
            </article>
          </div>

          <p className="demo-note">
            Demo mentor profiles. Real mentor accounts and 1-on-1 scheduling will be connected later.
          </p>
        </section>

        {/* SECTION: Find a Team */}
        <section className="hackathon-section" id="teams">
          <div className="section-heading">
            <div>
              <p className="eyebrow">BUILD YOUR DREAM TEAM</p>
              <h2>
                Find your teammates<span>.</span>
              </h2>
              <p className="section-subtitle">
                Discover people with skills that complement yours.
              </p>
            </div>
            <span className="demo-label">TEAM MATCHING</span>
          </div>

          <div className="search-bar">
            <span>⌕</span>
            <input
              id="team-skill-input"
              placeholder="Enter a skill (e.g. React, Python, IoT)..."
              aria-label="Filter teammates by skill"
              value={teamSearch}
              onChange={(event) => setTeamSearch(event.target.value)}
            />
            {teamSearch && (
              <button type="button" onClick={() => setTeamSearch('')}>
                Clear
              </button>
            )}
          </div>

          <div className="hackathon-grid">
            {filteredTeammates.map((person) => (
              <article className="hackathon-card" key={person.name}>
                <div
                  className="event-banner"
                  style={{
                    '--event-color': person.name.startsWith('Priya')
                      ? '#8b5cf6'
                      : person.name.startsWith('Arun')
                        ? '#06b6d4'
                        : '#f59e0b',
                  }}
                >
                  <span className="event-symbol">✳</span>
                  <span className="event-mode">{person.skills.join(' / ')}</span>
                </div>

                <div className="event-details">
                  <p className="event-organizer">Looking for a teammate</p>
                  <h3>{person.name}</h3>
                  <div className="event-tags">
                    {person.skills.map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="event-button"
                    onClick={() => handleConnectTeammate(person.name)}
                  >
                    Connect with {person.name.split(' ')[0]} ↗
                  </button>
                </div>
              </article>
            ))}
          </div>

          {filteredTeammates.length === 0 && (
            <p className="demo-note" style={{ padding: '24px 0' }}>
              No teammates found with skill &ldquo;{teamSearch}&rdquo;. Try another skill keyword.
            </p>
          )}

          <p className="demo-note">
            Sample teammate profiles. Real accounts and matching are connected to HackVerse user auth.
          </p>
        </section>

        {/* SECTION: AI Preparation */}
        <section className="hackathon-section" id="prepare">
          <div className="section-heading">
            <div>
              <p className="eyebrow">YOUR AI PROJECT COACH</p>
              <h2>
                Prepare smarter<span>.</span>
              </h2>
              <p className="section-subtitle">
                Turn your hackathon idea into an actionable plan.
              </p>
            </div>
            <span className="demo-label">AI PREPARATION</span>
          </div>

          <div className="search-bar">
            <span>✳</span>
            <input
              id="idea-input"
              placeholder="Describe your hackathon idea (e.g., AI health triage assistant)..."
              aria-label="Your hackathon idea"
              value={ideaInput}
              onChange={(e) => setIdeaInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleGenerateRoadmap()
              }}
            />
            <button type="button" onClick={handleGenerateRoadmap}>
              Generate roadmap
            </button>
          </div>

          <div className="stats-grid">
            {roadmap.length > 0 ? (
              roadmap.map((step, index) => (
                <div className="stat-card" key={index}>
                  <span className={`stat-icon ${['purple', 'cyan', 'orange'][index % 3]}`}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <p>Step {index + 1}</p>
                    <strong>{step}</strong>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="stat-card">
                  <span className="stat-icon purple">01</span>
                  <div>
                    <p>Step 1</p>
                    <strong>Define the problem & audience</strong>
                  </div>
                </div>
                <div className="stat-card">
                  <span className="stat-icon cyan">02</span>
                  <div>
                    <p>Step 2</p>
                    <strong>Select your modern stack</strong>
                  </div>
                </div>
                <div className="stat-card">
                  <span className="stat-icon orange">03</span>
                  <div>
                    <p>Step 3</p>
                    <strong>Build, test, & pitch prototype</strong>
                  </div>
                </div>
              </>
            )}
          </div>

          <p className="demo-note">
            AI project milestone roadmap generator. Enter your idea above to generate tailored milestones.
          </p>
        </section>

        {/* SECTION: Project Tracker */}
        <section className="hackathon-section" id="tracker">
          <div className="section-heading">
            <div>
              <p className="eyebrow">MILESTONES & PROGRESS</p>
              <h2>
                Project Tracker<span>.</span>
              </h2>
              <p className="section-subtitle">
                Keep your hackathon project on schedule from concept to submission.
              </p>
            </div>
            <span className="demo-label">
              {trackerTasks.filter((t) => t.done).length} OF {trackerTasks.length} COMPLETED
            </span>
          </div>

          {/* Protected feature callout for guest users */}
          {!user && (
            <div className="protected-feature-banner">
              <div className="protected-feature-content">
                <h4>🔒 Workspace Milestone Tracker</h4>
                <p>
                  Sign in or create an account to save custom project milestones and keep your hackathon progress synced across devices.
                </p>
              </div>
              <div className="protected-feature-actions">
                <button
                  type="button"
                  className="topbar-btn topbar-btn-ghost"
                  onClick={() => navigateTo('login', 'tracker')}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className="topbar-btn topbar-btn-primary"
                  onClick={() => navigateTo('register', 'tracker')}
                >
                  Create Account ↗
                </button>
              </div>
            </div>
          )}

          <div className="search-bar">
            <span>▦</span>
            <input
              aria-label="New milestone task"
              placeholder="Add a new hackathon milestone (e.g., Integrate Supabase Auth)..."
              value={newTaskInput}
              onChange={(e) => setNewTaskInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTask()
              }}
            />
            <button type="button" onClick={handleAddTask}>
              Add milestone
            </button>
          </div>

          <div className="stats-grid">
            {trackerTasks.map((task) => (
              <div
                className="stat-card"
                key={task.id}
                style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                onClick={() => toggleTask(task.id)}
                title="Click to toggle status"
              >
                <span className={`stat-icon ${task.done ? 'cyan' : 'purple'}`}>
                  {task.done ? '✓' : '○'}
                </span>
                <div>
                  <p>{task.phase}</p>
                  <strong
                    style={{
                      textDecoration: task.done ? 'line-through' : 'none',
                      opacity: task.done ? 0.7 : 1,
                    }}
                  >
                    {task.title}
                  </strong>
                </div>
                <span className="stat-arrow" style={{ fontSize: '10px', letterSpacing: '1px' }}>
                  {task.done ? 'DONE' : 'PENDING'}
                </span>
              </div>
            ))}
          </div>

          <p className="demo-note">
            Interactive milestone tracker: Click any card to toggle between pending and completed.
            {user ? ' Progress is automatically saved to your HackVerse workspace.' : ' Sign in to persist custom milestones.'}
          </p>
        </section>

        <footer className="footer">
          <span>
            HACK<span className="brand-accent">VERSE</span>
          </span>
          <span>Turn curiosity into creation. Built with React &amp; Supabase Auth.</span>
        </footer>

        {selectedMentor && (
          <div className="mentor-modal-overlay" onClick={() => setSelectedMentor(null)}>
            <div className="mentor-modal" onClick={(event) => event.stopPropagation()}>
              <button
                type="button"
                className="mentor-modal-close"
                onClick={() => setSelectedMentor(null)}
              >
                ✕
              </button>

              <p className="eyebrow">HACKVERSE MENTOR NETWORK</p>
              <h2>{selectedMentor.name}</h2>

              <p>
                <strong>Skills:</strong> {selectedMentor.skills}
              </p>
              <p>
                <strong>Can help with:</strong> {selectedMentor.guidance}
              </p>

              <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
                <button
                  type="button"
                  className="event-button"
                  onClick={() => {
                    if (!user) {
                      setAuthNotification(`Sign in or create an account to book 1-on-1 time with ${selectedMentor.name}.`)
                      setSelectedMentor(null)
                      navigateTo('login', 'mentors')
                    } else {
                      alert(`Mentorship session request submitted to ${selectedMentor.name}!`)
                      setSelectedMentor(null)
                    }
                  }}
                >
                  {user ? 'Request 1-on-1 session ↗' : 'Sign in to request session ↗'}
                </button>
                <button
                  type="button"
                  className="event-button"
                  style={{ background: 'transparent', borderColor: '#37324c' }}
                  onClick={() => setSelectedMentor(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
