import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Send, BarChart2, Settings } from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Submit Lead', href: '/dashboard/submit', icon: Send },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart2 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

const stats = [
  { name: 'Hot Leads', value: '12' },
  { name: 'Warm Leads', value: '24' },
  { name: 'Cold Leads', value: '8' },
]

const Sidebar = () => {
  const location = useLocation()

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-background px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img
              className="h-8 w-auto"
              src="/logo.svg"
              alt="LeadGenie"
            />
            <span className="text-xl font-semibold">LeadGenie</span>
          </Link>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={`
                          group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6
                          ${isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground hover:bg-muted hover:text-primary'
                          }
                        `}
                      >
                        <item.icon
                          className={`h-6 w-6 shrink-0 ${
                            isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary'
                          }`}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </li>
            <li className="mt-auto">
              <div className="glass rounded-lg p-4">
                <h3 className="text-sm font-semibold leading-6 text-foreground">
                  Lead Stats
                </h3>
                <dl className="mt-2 grid grid-cols-2 gap-4">
                  {stats.map((item) => (
                    <div
                      key={item.name}
                      className="overflow-hidden rounded-lg bg-background/50 px-4 py-2"
                    >
                      <dt className="truncate text-sm font-medium text-muted-foreground">
                        {item.name}
                      </dt>
                      <dd className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                        {item.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}

export default Sidebar 