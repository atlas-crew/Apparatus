import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Shield,
  Zap,
  Network,
  FlaskConical,
  Settings,
  Activity,
  FileWarning,
  Globe,
  Webhook,
  Key,
  Fingerprint,
  Bot,
  ShieldAlert,
  ChevronUp,
  ChevronDown,
  Ghost,
  Server,
  BookOpen,
  ListTree,
  BrainCircuit,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { cn } from '../ui/cn';
import { typographyRole } from '../ui/typography';
import { useApparatus } from '../../providers/ApparatusProvider';
import {
  HUD_STATE_CHANGED_EVENT,
  loadHudHiddenPreference,
  loadHudWidgetVisibilityPreference,
  persistHudVisibilityState,
  type HudStateChangedDetail,
} from '../hud/hudState';

interface NavSection {
  title: string;
  items: Array<{ path: string; label: string; icon: any }>;
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Core',
    items: [
      { path: '/', label: 'Overview', icon: LayoutDashboard },
      { path: '/docs', label: 'Docs Hub', icon: BookOpen },
    ],
  },
  {
    title: 'Observe',
    items: [
      { path: '/traffic', label: 'Traffic', icon: Activity },
      { path: '/timeline', label: 'Timeline', icon: ListTree },
      { path: '/fingerprints', label: 'Attackers', icon: ShieldAlert },
    ],
  },
  {
    title: 'Defend',
    items: [
      { path: '/defense', label: 'Defense', icon: Shield },
      { path: '/deception', label: 'Deception', icon: FileWarning },
      { path: '/mtd', label: 'MTD', icon: Key },
      { path: '/identity', label: 'Identity', icon: Fingerprint },
    ],
  },
  {
    title: 'Test & Attack',
    items: [
      { path: '/chaos', label: 'Chaos', icon: Zap },
      { path: '/scenarios', label: 'Scenarios', icon: Zap },
      { path: '/drill', label: 'Breach Protocol', icon: ShieldAlert },
      { path: '/ghosts', label: 'Ghost Mocker', icon: Ghost },
      { path: '/autopilot', label: 'Autopilot', icon: Bot },
    ],
  },
  {
    title: 'Infra',
    items: [
      { path: '/cluster', label: 'Cluster', icon: Globe },
      { path: '/network', label: 'Network', icon: Activity },
      { path: '/webhooks', label: 'Webhooks', icon: Webhook },
      { path: '/listeners', label: 'Listeners', icon: Server },
      { path: '/dependencies', label: 'Supply Chain', icon: Network },
      { path: '/testing', label: 'Testing Lab', icon: FlaskConical },
    ],
  },
  {
    title: 'Config',
    items: [
      { path: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export function Sidebar() {
  const { health } = useApparatus();
  const isHealthy = health.status === 'healthy';
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['Core']));
  const [showKeyboardHints, setShowKeyboardHints] = useState(false);
  const [hudHidden, setHudHidden] = useState(true);
  const [hudStatsVisible, setHudStatsVisible] = useState(false);
  const [hudThoughtsVisible, setHudThoughtsVisible] = useState(false);

  // Load sidebar state from localStorage
  useEffect(() => {
    try {
      const collapsed = localStorage.getItem('apparatus-sidebar:collapsed') === '1';
      setSidebarCollapsed(collapsed);

      const expanded = localStorage.getItem('apparatus-sidebar:expanded-sections');
      if (expanded) {
        setExpandedSections(new Set(JSON.parse(expanded)));
      }

      const isHidden = loadHudHiddenPreference();
      const widgetVisibility = loadHudWidgetVisibilityPreference();
      setHudHidden(isHidden);
      setHudStatsVisible(!isHidden && widgetVisibility.statsVisible);
      setHudThoughtsVisible(!isHidden && widgetVisibility.thoughtsVisible);
    } catch {
      // localStorage unavailable
    }
  }, []);

  const toggleSidebarCollapse = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    try {
      localStorage.setItem('apparatus-sidebar:collapsed', newState ? '1' : '0');
    } catch {
      // localStorage unavailable
    }
  };

  const toggleSection = (title: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(title)) {
      newExpanded.delete(title);
    } else {
      newExpanded.add(title);
    }
    setExpandedSections(newExpanded);
    try {
      localStorage.setItem('apparatus-sidebar:expanded-sections', JSON.stringify([...newExpanded]));
    } catch {
      // localStorage unavailable
    }
  };

  const persistHudState = (
    nextHidden: boolean,
    nextStatsVisible: boolean,
    nextThoughtsVisible: boolean
  ): HudStateChangedDetail => {
    const detail: HudStateChangedDetail = {
      hidden: nextHidden,
      statsVisible: nextStatsVisible,
      thoughtsVisible: nextThoughtsVisible,
    };
    persistHudVisibilityState(detail);
    return detail;
  };

  const updateHudVisibility = (nextStatsVisible: boolean, nextThoughtsVisible: boolean) => {
    const nextHidden = !(nextStatsVisible || nextThoughtsVisible);
    setHudStatsVisible(nextStatsVisible);
    setHudThoughtsVisible(nextThoughtsVisible);
    setHudHidden(nextHidden);
    const detail = persistHudState(nextHidden, nextStatsVisible, nextThoughtsVisible);
    window.dispatchEvent(new CustomEvent(HUD_STATE_CHANGED_EVENT, { detail }));
  };

  const toggleHudStats = () => {
    updateHudVisibility(!hudStatsVisible, hudThoughtsVisible);
  };

  const toggleHudThoughts = () => {
    updateHudVisibility(hudStatsVisible, !hudThoughtsVisible);
  };

  return (
    <aside className="w-60 h-screen bg-neutral-950 border-r border-neutral-800/60 flex flex-col relative overflow-hidden">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-primary-500/60 via-primary-500/10 to-transparent" />

      {/* Brand */}
      <div className="h-14 flex items-center justify-between px-5 border-b border-neutral-800/40">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2.5">
            <img
              src={`${import.meta.env.BASE_URL}assets/logo/apparatus-icon-dark.svg`}
              alt="Apparatus"
              className="h-9 w-auto"
            />
            <span className={cn("text-lg text-neutral-200", typographyRole("subhead"))}>
              Apparatus
            </span>
          </div>
        )}
        <button
          onClick={toggleSidebarCollapse}
          className="p-1 hover:bg-neutral-800/50 rounded-sm transition-colors"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="h-4 w-4 text-neutral-500" />
          ) : (
            <PanelLeftClose className="h-4 w-4 text-neutral-500" />
          )}
        </button>
      </div>

      {/* Navigation */}
      {!sidebarCollapsed && (
        <nav className="flex-1 overflow-y-auto py-4 px-2" aria-label="Main navigation">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="mb-1">
              <button
                onClick={() => toggleSection(section.title)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors uppercase",
                  typographyRole("label")
                )}
              >
                <span>{section.title}</span>
                {expandedSections.has(section.title) ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </button>
              {expandedSections.has(section.title) && (
                <ul className="space-y-px">
                  {section.items.map(({ path, label, icon: Icon }) => (
                    <li key={path}>
                      <NavLink
                        to={path}
                        end={path === '/'}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-2.5 px-3 py-2 text-[13px] relative rounded-[3px]',
                            'transition-all duration-150',
                            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500/40',
                            isActive
                              ? `bg-primary-500/8 text-primary-300 ${typographyRole("navActive")}`
                              : `text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900/60 ${typographyRole("nav")}`
                          )
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {/* Active accent bar */}
                            {isActive && (
                              <div className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full bg-primary-500 shadow-[0_0_6px_rgba(0,240,255,0.6)]" />
                            )}
                            <Icon className={cn(
                              "h-[15px] w-[15px] flex-shrink-0",
                              isActive ? "text-primary-400" : "text-neutral-600"
                            )} strokeWidth={1.75} />
                            <span>{label}</span>
                          </>
                        )}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </nav>
      )}

      {/* Footer — HUD Controls, Keyboard Shortcuts & Status */}
      {!sidebarCollapsed && (
      <div className="border-t border-neutral-800/40 bg-neutral-900/20">
        {/* HUD Toggles */}
        <div className="px-3 py-2">
          <div role="group" aria-label="HUD widget controls" className="space-y-1.5">
            <button
              onClick={toggleHudStats}
              aria-pressed={hudStatsVisible}
              className={cn(
                'w-full flex items-center justify-between gap-2 px-3 py-2 text-[11px] rounded-sm transition-colors',
                typographyRole("label"),
                hudStatsVisible
                  ? 'text-primary-300 bg-primary-500/10 border border-primary-500/25'
                  : 'text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800/50 border border-transparent'
              )}
              title={hudStatsVisible ? 'Hide HUD stats widget' : 'Show HUD stats widget'}
            >
              <span className="flex items-center gap-2">
                <Activity className="h-3.5 w-3.5" />
                <span>HUD Stats</span>
              </span>
              <span className={cn(
                'h-1.5 w-1.5 rounded-full',
                hudStatsVisible ? 'bg-primary-400 shadow-[0_0_6px_rgba(0,240,255,0.7)]' : 'bg-neutral-700'
              )} />
            </button>
            <button
              onClick={toggleHudThoughts}
              aria-pressed={hudThoughtsVisible}
              className={cn(
                'w-full flex items-center justify-between gap-2 px-3 py-2 text-[11px] rounded-sm transition-colors',
                typographyRole("label"),
                hudThoughtsVisible
                  ? 'text-primary-300 bg-primary-500/10 border border-primary-500/25'
                  : 'text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800/50 border border-transparent'
              )}
              title={hudThoughtsVisible ? 'Hide AI thought widget' : 'Show AI thought widget'}
            >
              <span className="flex items-center gap-2">
                <BrainCircuit className="h-3.5 w-3.5" />
                <span>AI Thought</span>
              </span>
              <span className={cn(
                'h-1.5 w-1.5 rounded-full',
                hudThoughtsVisible ? 'bg-primary-400 shadow-[0_0_6px_rgba(0,240,255,0.7)]' : 'bg-neutral-700'
              )} />
            </button>
            {hudHidden && (
              <div className={cn("px-1 text-[10px] uppercase text-neutral-600", typographyRole("timestamp"))}>
                HUD hidden
              </div>
            )}
          </div>
        </div>

        {/* Keyboard Shortcuts Section */}
        <div className="px-3 py-2 border-t border-neutral-800/40">
          <button
            onClick={() => setShowKeyboardHints(!showKeyboardHints)}
            aria-expanded={showKeyboardHints}
            className={cn(
              "w-full flex items-center justify-between text-[11px] text-neutral-600 hover:text-neutral-400 transition-colors",
              typographyRole("label")
            )}
          >
            <span>Keyboard</span>
            {showKeyboardHints ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>

          {showKeyboardHints && (
            <div className="mt-2.5 space-y-1.5 text-[10px] text-neutral-500">
              <div className="flex justify-between items-center gap-2">
                <span>Commands</span>
                <kbd className={cn("px-1 py-0.5 rounded bg-neutral-800/50 text-neutral-400", typographyRole("timestamp"))}>⌘K</kbd>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span>Help</span>
                <kbd className={cn("px-1 py-0.5 rounded bg-neutral-800/50 text-neutral-400", typographyRole("timestamp"))}>⌘?</kbd>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span>Close</span>
                <kbd className={cn("px-1 py-0.5 rounded bg-neutral-800/50 text-neutral-400", typographyRole("timestamp"))}>Esc</kbd>
              </div>
            </div>
          )}
        </div>

        {/* System Status */}
        <div className="px-4 py-3 border-t border-neutral-800/40">
          <div className="flex items-center justify-between mb-2">
            <span className={cn("text-[11px] text-neutral-600", typographyRole("label"))}>Status</span>
            <span className={cn(
              "text-[10px] flex items-center gap-1.5",
              typographyRole("timestamp"),
              isHealthy ? "text-success-500" : "text-danger-400"
            )}>
              <span className={cn(
                "w-1.5 h-1.5 rounded-full",
                isHealthy ? "bg-success-500 animate-pulse-fast" : "bg-danger-500"
              )} />
              {isHealthy ? 'Online' : health.status}
            </span>
          </div>
          <div className="w-full h-[3px] bg-neutral-900 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                isHealthy
                  ? "bg-success-500/80 w-[98%]"
                  : "bg-danger-500/60 w-[20%]"
              )}
            />
          </div>
          <div className={cn("mt-2.5 flex justify-between text-[10px] text-neutral-700", typographyRole("timestamp"))}>
            <span>{health.version ? `v${health.version}` : 'v—'}</span>
            {health.latencyMs !== undefined && (
              <span className="text-neutral-400">{health.latencyMs}ms</span>
            )}
          </div>
        </div>
      </div>
      )}
    </aside>
  );
}

Sidebar.displayName = 'Sidebar';
