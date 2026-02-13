import { useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Activity,
  Sparkles,
  AlertTriangle,
  Clock,
} from 'lucide-react'
import { useSchedulingStore } from '../features/scheduling/stores/useSchedulingStore'
import { useAuthStore } from '../features/auth/stores/useAuthStore'
import { usePullToRefresh } from '../hooks/usePullToRefresh'
import { useIsMobile } from '../hooks/useMediaQuery'
import { getUpcomingDeadlines, getCopilotInsights } from '../lib/crossModuleService'
import WelcomeBanner from '../components/WelcomeBanner/WelcomeBanner'
import StatsOverview from '../components/StatsOverview/StatsOverview'
import QuickActions from '../components/QuickActions/QuickActions'
import RecentItems from '../components/RecentItems/RecentItems'
import FirstRunChecklist from '../components/FirstRunChecklist/FirstRunChecklist'
import ActivityFeed from '../features/activity/components/ActivityFeed/ActivityFeed'
import DashboardCharts from '../features/activity/components/DashboardCharts/DashboardCharts'
import AIFeatureWidget from '../features/ai/components/AIFeatureWidget/AIFeatureWidget'
import './HomePage.css'

export default function HomePage() {
  const bookings = useSchedulingStore((s) => s.bookings)
  const eventTypes = useSchedulingStore((s) => s.eventTypes)
  const user = useAuthStore((s) => s.user)
  const onboardingComplete = useAuthStore((s) => s.onboardingComplete)
  const isMobile = useIsMobile()

  const handleRefresh = useCallback(async () => {
    // Simulated refresh delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }, [])

  const { isRefreshing, pullDistance, ref: pullRef } = usePullToRefresh<HTMLDivElement>({
    onRefresh: handleRefresh,
    enabled: isMobile,
  })

  const firstName = useMemo(() => {
    if (user?.name) return user.name.split(' ')[0]
    return 'Sam' // Demo account default
  }, [user])

  const upcomingBookings = useMemo(
    () =>
      bookings
        .filter(
          (b) =>
            b.status === 'confirmed' &&
            b.date >= (new Date().toISOString().split('T')[0] ?? '')
        )
        .sort(
          (a, b) =>
            a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)
        )
        .slice(0, 5),
    [bookings]
  )

  // Cross-module data
  const deadlines = useMemo(() => getUpcomingDeadlines(6), [])
  const copilotInsights = useMemo(() => getCopilotInsights(), [])

  return (
    <div className="home-page" ref={pullRef}>
      {/* Pull-to-refresh indicator (mobile only) */}
      {isMobile && (
        <div
          className={`pull-to-refresh__indicator ${isRefreshing ? 'pull-to-refresh__indicator--active' : ''}`}
          style={!isRefreshing && pullDistance > 0 ? { height: `${pullDistance}px` } : undefined}
        >
          <div className="pull-to-refresh__spinner" />
        </div>
      )}
      {/* 1. Welcome Banner */}
      <WelcomeBanner userName={firstName} />

      {/* 1.5 First Run Checklist */}
      {onboardingComplete && <FirstRunChecklist />}

      {/* 2. Stats Overview */}
      <StatsOverview />

      {/* 3. Quick Actions */}
      <QuickActions />

      {/* 3.25 Copilot Insights + Upcoming Timeline */}
      {(copilotInsights.length > 0 || deadlines.length > 0) && (
        <div className="home-page__cross-module-row">
          {copilotInsights.length > 0 && (
            <section className="home-page__copilot-panel" aria-label="Copilot insights">
              <div className="home-page__section-header">
                <h2 className="home-page__section-title">
                  <Sparkles size={16} className="home-page__section-icon home-page__section-icon--copilot" />
                  Copilot Insights
                </h2>
              </div>
              <ul className="home-page__insight-list">
                {copilotInsights.map((insight) => (
                  <li key={insight.id} className="home-page__insight-item">
                    <Link to={insight.path} className={`home-page__insight-link home-page__insight-link--${insight.severity}`}>
                      {insight.severity === 'warning' ? (
                        <AlertTriangle size={14} className="home-page__insight-icon" />
                      ) : (
                        <Sparkles size={14} className="home-page__insight-icon" />
                      )}
                      <span className="home-page__insight-text">{insight.message}</span>
                      <span className="home-page__insight-module">{insight.module}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {deadlines.length > 0 && (
            <section className="home-page__deadlines-panel" aria-label="Upcoming deadlines">
              <div className="home-page__section-header">
                <h2 className="home-page__section-title">
                  <Clock size={16} className="home-page__section-icon" />
                  Upcoming
                </h2>
              </div>
              <ul className="home-page__deadline-list">
                {deadlines.map((item) => (
                  <li key={item.id} className="home-page__deadline-item">
                    <Link to={item.path} className={`home-page__deadline-link home-page__deadline-link--${item.urgency}`}>
                      <span className={`home-page__deadline-dot home-page__deadline-dot--${item.urgency}`} />
                      <span className="home-page__deadline-title">{item.title}</span>
                      <span className="home-page__deadline-date">
                        {new Date(item.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      {/* 4. Two-column layout: RecentItems + Activity sidebar */}
      <div className="home-page__main-grid">
        {/* Left: Recent Items (2/3) */}
        <div className="home-page__main-col">
          <RecentItems />
        </div>

        {/* Right: Activity Feed + Upcoming Bookings (1/3) */}
        <div className="home-page__sidebar-col">
          <section className="home-page__section">
            <div className="home-page__section-header">
              <h2 className="home-page__section-title">
                <Activity size={18} className="home-page__section-icon" />
                Activity
              </h2>
            </div>
            <ActivityFeed maxItems={8} showFilters={false} />
          </section>

          {upcomingBookings.length > 0 && (
            <section className="home-page__section">
              <div className="home-page__section-header">
                <h2 className="home-page__section-title">Upcoming Bookings</h2>
                <Link to="/calendar/bookings" className="home-page__see-all">
                  See all <ArrowRight size={14} />
                </Link>
              </div>
              <div className="home-page__bookings-list">
                {upcomingBookings.map((booking) => {
                  const et = eventTypes.find((e) => e.id === booking.eventTypeId)
                  return (
                    <Link
                      key={booking.id}
                      to="/calendar/bookings"
                      className="home-page__booking-item"
                    >
                      <div
                        className="home-page__booking-dot"
                        style={{ backgroundColor: et?.color ?? '#6B7280' }}
                      />
                      <div className="home-page__booking-info">
                        <span className="home-page__booking-name">
                          {et?.name ?? 'Event'}
                        </span>
                        <span className="home-page__booking-meta">
                          {new Date(booking.date + 'T00:00:00').toLocaleDateString(
                            'en-US',
                            { weekday: 'short', month: 'short', day: 'numeric' }
                          )}{' '}
                          &middot; {booking.startTime}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* 5. Dashboard Charts */}
      <section className="home-page__section">
        <h2 className="home-page__section-title">Overview</h2>
        <DashboardCharts />
      </section>

      <AIFeatureWidget featureKey="home" />
    </div>
  )
}
