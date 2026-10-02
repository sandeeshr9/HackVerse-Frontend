import { useState, useEffect } from 'react'
import './App.css'
import { supabase } from './lib/supabase'

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

function App() {
  const [activeNav, setActiveNav] = useState('discover')
  const [roadmap, setRoadmap] = useState([])
  const [ideaInput, setIdeaInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [teamSearch, setTeamSearch] = useState('')
  const [hackathonData, setHackathonData] = useState(defaultHackathons)
  const [loadingHackathons, setLoadingHackathons] = useState(true)
  const [selectedMentor, setSelectedMentor] = useState(null)

  // Project Tracker State
  const [trackerTasks, setTrackerTasks] = useState([
    { id: 1, title: 'Form team & define problem statement', phase: 'Phase 1 · Planning', done: true },
    { id: 2, title: 'Research competitors & gather user requirements', phase: 'Phase 2 · Research', done: true },
    { id: 3, title: 'Build interactive UI prototype in React', phase: 'Phase 3 · Frontend', done: false },
    { id: 4, title: 'Configure Supabase database & backend APIs', phase: 'Phase 4 · Backend', done: false },
    { id: 5, title: 'Polish pitch deck & record 2-minute demo video', phase: 'Phase 5 · Submission', done: false },
  ])
  const [newTaskInput, setNewTaskInput] = useState('')

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

  const filteredHackathons = hackathonData.filter((event) => {
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

  const filteredTeammates = teammates.filter((person) => {
    const query = teamSearch.toLowerCase().trim()
    if (!query) return true

    return (
      person.name.toLowerCase().includes(query) ||
      person.skills.some((skill) => skill.toLowerCase().includes(query))
    )
  })

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
    setTrackerTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, done: !task.done } : task))
    )
  }

  const handleAddTask = () => {
    const trimmed = newTaskInput.trim()
    if (!trimmed) return
    setTrackerTasks((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: trimmed,
        phase: `Milestone ${prev.length + 1} · Custom`,
        done: false,
      },
    ])
    setNewTaskInput('')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#home" onClick={() => setActiveNav('home')}>
          <span className="brand-icon">H</span>
          <span>Hack<span className="brand-accent">Verse</span></span>
        </a>

        <p className="nav-label">WORKSPACE</p>
        <nav className="navigation">
          <a
            className={`nav-item ${activeNav === 'discover' ? 'active' : ''}`}
            href="#discover"
            onClick={() => setActiveNav('discover')}
          >
            ◈ <span>Discover</span>
          </a>
          <a
            className={`nav-item ${activeNav === 'mentors' ? 'active' : ''}`}
            href="#mentors"
            onClick={() => setActiveNav('mentors')}
          >
            ◎ <span>Mentors</span>
          </a>
          <a
            className={`nav-item ${activeNav === 'teams' ? 'active' : ''}`}
            href="#teams"
            onClick={() => setActiveNav('teams')}
          >
            ♧ <span>Find a Team</span>
          </a>
          <a
            className={`nav-item ${activeNav === 'prepare' ? 'active' : ''}`}
            href="#prepare"
            onClick={() => setActiveNav('prepare')}
          >
            ✳ <span>AI Preparation</span>
          </a>
          <a
            className={`nav-item ${activeNav === 'tracker' ? 'active' : ''}`}
            href="#tracker"
            onClick={() => setActiveNav('tracker')}
          >
            ▦ <span>Project Tracker</span>
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="profile-avatar">S</div>
          <div>
            <strong>Student Workspace</strong>
            <p>Future innovator</p>
          </div>
        </div>
      </aside>

      <main className="main-content" id="home">
        <header className="topbar">
          <span className="breadcrumb">Workspace / <strong>{activeNav.charAt(0).toUpperCase() + activeNav.slice(1)}</strong></span>
          <span className="status"><span className="status-dot" /> YOUR NEXT BIG IDEA STARTS HERE</span>
        </header>

        <section className="hero-section">
          <div className="hero-copy">
            <div className="eyebrow"><span>✦</span> YOUR HACKATHON JOURNEY, UPGRADED</div>
            <h1>Build something<br /> <span>extraordinary.</span></h1>
            <p className="hero-description">
              Discover opportunities, find your people, and turn your ideas
              into innovations. Your next breakthrough starts here.
            </p>
            <a href="#discover" className="primary-button" onClick={() => setActiveNav('discover')}>
              Explore hackathons <span>↗</span>
            </a>
            <div className="hero-footnote">DISCOVER <span>·</span> CONNECT <span>·</span> BUILD <span>·</span> GROW</div>
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
          <a href="#discover" className="stat-card" onClick={() => setActiveNav('discover')}>
            <span className="stat-icon purple">◈</span>
            <div><p>Opportunities</p><strong>Discover more</strong></div>
            <span className="stat-arrow">↗</span>
          </a>
          <a href="#mentors" className="stat-card" onClick={() => setActiveNav('mentors')}>
            <span className="stat-icon cyan">◎</span>
            <div><p>Mentor network</p><strong>Find your guide</strong></div>
            <span className="stat-arrow">↗</span>
          </a>
          <a href="#prepare" className="stat-card" onClick={() => setActiveNav('prepare')}>
            <span className="stat-icon orange">✳</span>
            <div><p>Skill development</p><strong>Prepare smarter</strong></div>
            <span className="stat-arrow">↗</span>
          </a>
        </section>

        {/* SECTION: Discover Hackathons */}
        <section className="hackathon-section" id="discover">
          <div className="section-heading">
            <div>
              <p className="eyebrow">FIND YOUR NEXT CHALLENGE</p>
              <h2>Explore hackathons<span>.</span></h2>
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
                  <button type="button" className="event-button">View opportunity ↗</button>
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
              <h2>Meet your mentors<span>.</span></h2>
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
                  onClick={() => setSelectedMentor({
                    name: 'AI Mentor',
                    skills: 'Python, AI/ML',
                    guidance: 'ML models, datasets, and AI prototypes',
                  })}
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
                  onClick={() => setSelectedMentor({
                    name: 'Full-Stack Mentor',
                    skills: 'React, Supabase',
                    guidance: 'Websites, APIs, and databases',
                  })}
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
                  onClick={() => setSelectedMentor({
                    name: 'Hardware Mentor',
                    skills: 'IoT, Robotics',
                    guidance: 'Sensors, embedded systems, and prototypes',
                  })}
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
              <h2>Find your teammates<span>.</span></h2>
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
                    '--event-color':
                      person.name.startsWith('Priya')
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
                  <button type="button" className="event-button">Connect with {person.name.split(' ')[0]} ↗</button>
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
            Sample teammate profiles. Real accounts and matching will be connected later.
          </p>
        </section>

        {/* SECTION: AI Preparation */}
        <section className="hackathon-section" id="prepare">
          <div className="section-heading">
            <div>
              <p className="eyebrow">YOUR AI PROJECT COACH</p>
              <h2>Prepare smarter<span>.</span></h2>
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
                  <div><p>Step 1</p><strong>Define the problem & audience</strong></div>
                </div>
                <div className="stat-card">
                  <span className="stat-icon cyan">02</span>
                  <div><p>Step 2</p><strong>Select your modern stack</strong></div>
                </div>
                <div className="stat-card">
                  <span className="stat-icon orange">03</span>
                  <div><p>Step 3</p><strong>Build, test, & pitch prototype</strong></div>
                </div>
              </>
            )}
          </div>

          <p className="demo-note">
            Prototype version: Enter your idea above and click Generate to see a customized project milestone roadmap.
          </p>
        </section>

        {/* SECTION: Project Tracker */}
        <section className="hackathon-section" id="tracker">
          <div className="section-heading">
            <div>
              <p className="eyebrow">MILESTONES & PROGRESS</p>
              <h2>Project Tracker<span>.</span></h2>
              <p className="section-subtitle">
                Keep your hackathon project on schedule from concept to submission.
              </p>
            </div>
            <span className="demo-label">
              {trackerTasks.filter((t) => t.done).length} OF {trackerTasks.length} COMPLETED
            </span>
          </div>

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
                  <strong style={{ textDecoration: task.done ? 'line-through' : 'none', opacity: task.done ? 0.7 : 1 }}>
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
          </p>
        </section>

        <footer className="footer">
          <span>HACK<span className="brand-accent">VERSE</span></span>
          <span>Turn curiosity into creation.</span>
        </footer>

        {selectedMentor && (
          <div
            className="mentor-modal-overlay"
            onClick={() => setSelectedMentor(null)}
          >
            <div
              className="mentor-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="mentor-modal-close"
                onClick={() => setSelectedMentor(null)}
              >
                ✕
              </button>

              <p className="eyebrow">HACKVERSE MENTOR NETWORK</p>
              <h2>{selectedMentor.name}</h2>

              <p><strong>Skills:</strong> {selectedMentor.skills}</p>
              <p><strong>Can help with:</strong> {selectedMentor.guidance}</p>

              <button
                type="button"
                className="event-button"
                onClick={() => setSelectedMentor(null)}
              >
                Close profile
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
