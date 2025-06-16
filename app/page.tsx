"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import useSWR from 'swr';
import {
  ChartBarIcon, EnvelopeIcon, CalendarIcon, CogIcon, BellIcon, HomeIcon,
  DocumentArrowDownIcon, EyeIcon, PlusIcon, XMarkIcon, ChevronLeftIcon,
  ChevronRightIcon, ArrowUpIcon, ArrowDownIcon, FireIcon, UserGroupIcon,
  ChartPieIcon, ClockIcon, SparklesIcon, Bars3Icon, PhoneIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const fetcher = () => Promise.resolve(generateMockData())
const generateMockData = () => ({
  subscribers: {
    total: 15847 + Math.floor(Math.random() * 200),
    growth: 18.7 + Math.random() * 8,
    newToday: 34 + Math.floor(Math.random() * 15),
    churnRate: 1.8 + Math.random() * 0.7
  },
  engagement: {
    openRate: 42.8 + Math.random() * 12,
    clickRate: 12.4 + Math.random() * 5,
    unsubscribeRate: 0.6 + Math.random() * 0.4,
    bounceRate: 0.9 + Math.random() * 0.6
  },
  revenue: {
    mrr: 12940 + Math.floor(Math.random() * 800),
    growth: 15.3 + Math.random() * 7,
    arpu: 8.95 + Math.random() * 3
  },
  chartData: Array.from({ length: 30 }, (_, i) => {
    const baseGrowth = 15000 + (i * 200)
    return {
      day: i + 1,
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      subscribers: baseGrowth + Math.floor(Math.random() * 1000),
      opens: Math.floor(Math.random() * 8000) + 2000,
      clicks: Math.floor(Math.random() * 2500) + 500,
      revenue: Math.floor(Math.random() * 1200) + 400
    }
  }),
  heatmapData: Array.from({ length: 168 }, (_, i) => {
    const day = Math.floor(i / 24)
    const hour = i % 24
    const workdayBoost = (day >= 1 && day <= 5 && hour >= 9 && hour <= 17) ? 0.4 : 0
    const value = Math.random() * 60 + workdayBoost * 40
    return { day, hour, value: Math.min(100, value) }
  }),
  campaigns: [
    { id: 1, name: 'Welcome Series', status: 'active', sent: 2150, opens: 645, clicks: 128, ctr: 5.95 },
    { id: 2, name: 'Weekly Newsletter', status: 'draft', sent: 0, opens: 0, clicks: 0, ctr: 0 },
    { id: 3, name: 'Product Launch', status: 'scheduled', sent: 0, opens: 0, clicks: 0, ctr: 0 },
    { id: 4, name: 'Growth Strategies', status: 'active', sent: 1850, opens: 520, clicks: 94, ctr: 5.08 },
    { id: 5, name: 'User Feedback', status: 'paused', sent: 890, opens: 267, clicks: 34, ctr: 3.82 }
  ],
  calendar: [
    { id: 1, title: 'Weekly Newsletter', date: '2025-05-27', type: 'newsletter' },
    { id: 2, title: 'Product Update', date: '2025-05-29', type: 'promotion' },
    { id: 3, title: 'Growth Tips', date: '2025-06-01', type: 'content' },
    { id: 4, title: 'User Spotlight', date: '2025-06-03', type: 'content' }
  ]
})

const Toast = ({ message, type, onClose }: { message: string, type: string, onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: -20, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -20, scale: 0.9 }}
    transition={{ duration: 0.3, type: "spring", stiffness: 500, damping: 30 }}
    className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] p-4 rounded-2xl backdrop-blur-xl border max-w-sm shadow-2xl ${type === 'success' ? 'bg-emerald-500/10 border-emerald-400/20 text-emerald-100' :
        type === 'error' ? 'bg-rose-500/10 border-rose-400/20 text-rose-100' :
          'bg-indigo-500/10 border-indigo-400/20 text-indigo-100'
      }`}
  >
    <div className="flex items-center space-x-3">
      <div className={`w-2 h-2 rounded-full ${type === 'success' ? 'bg-emerald-400' :
          type === 'error' ? 'bg-rose-400' : 'bg-indigo-400'
        }`} />
      <span className="text-sm font-medium flex-1">{message}</span>
      <button
        onClick={onClose}
        className="opacity-60 hover:opacity-100 transition-opacity"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  </motion.div>
)

const MetricCard = ({ title, value, change, icon: Icon, trend, subtitle }: any) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
    className="bg-indigo-950/60 backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-indigo-800/30 hover:border-indigo-700/50 transition-all duration-300 relative overflow-hidden group"
  >
    <div className="absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 rounded-full blur-2xl group-hover:from-violet-500/8 group-hover:to-fuchsia-500/8 transition-all duration-500" />
    <div className="relative z-10 flex items-start justify-between">
      <div className="flex-1">
        <p className="text-indigo-300 text-sm font-medium mb-2">{title}</p>
        <p className="text-2xl sm:text-3xl font-bold text-white mb-1 tracking-tight">{value}</p>
        {subtitle && <p className="text-xs text-indigo-400 mb-3">{subtitle}</p>}
        <div className={`flex items-center text-sm font-semibold ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-indigo-400'
          }`}>
          {trend === 'up' && <ArrowUpIcon className="w-4 h-4 mr-1" />}
          {trend === 'down' && <ArrowDownIcon className="w-4 h-4 mr-1" />}
          {change}%
        </div>
      </div>
      <div className="p-3 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-2xl backdrop-blur-sm group-hover:from-violet-500/15 group-hover:to-fuchsia-500/15 transition-all duration-300">
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-violet-400" />
      </div>
    </div>
  </motion.div>
)

const ResponsiveChart = ({ data, type, className = "" }: { data: any[], type: string, className?: string }) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [dimensions, setDimensions] = useState({ width: 400, height: 200 })

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect()
        setDimensions({ width: rect.width, height: rect.height })
      }
    }
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  const maxValue = Math.max(...data.map(d => d[type]))
  const minValue = Math.min(...data.map(d => d[type]))
  const range = maxValue - minValue || 1

  const points = data.slice(-20).map((item, index) => {
    const x = (index / (data.slice(-20).length - 1)) * (dimensions.width - 80) + 40
    const y = dimensions.height - 60 - ((item[type] - minValue) / range) * (dimensions.height - 100)
    return `${x},${y}`
  }).join(' ')

  const areaPoints = `40,${dimensions.height - 40} ${points} ${dimensions.width - 40},${dimensions.height - 40}`

  return (
    <div className={`w-full h-64 ${className}`}>
      <svg ref={svgRef} className="w-full h-full" viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}>
        <defs>
          <linearGradient id={`gradient-${type}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id={`line-${type}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
        </defs>

        <motion.polygon
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          points={areaPoints}
          fill={`url(#gradient-${type})`}
        />

        <motion.polyline
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          points={points}
          fill="none"
          stroke={`url(#line-${type})`}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {data.slice(-20).map((item, index) => {
          const x = (index / (data.slice(-20).length - 1)) * (dimensions.width - 80) + 40
          const y = dimensions.height - 60 - ((item[type] - minValue) / range) * (dimensions.height - 100)
          return (
            <motion.circle
              key={index}
              initial={{ r: 0, opacity: 0 }}
              animate={{ r: 3, opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              cx={x}
              cy={y}
              fill="#8B5CF6"
              className="drop-shadow-lg"
            />
          )
        })}

        {data.slice(-5).map((item, index) => {
          const x = (index / 4) * (dimensions.width - 80) + 40
          return (
            <text key={index} x={x} y={dimensions.height - 10} textAnchor="middle" className="text-xs fill-indigo-400">
              {item.date || item.day}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

const InteractiveHeatmap = ({ data, detailed = false }: { data: any[], detailed?: boolean }) => {
  const [hoveredCell, setHoveredCell] = useState<{ day: number, hour: number, value: number } | null>(null)
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const [viewMode, setViewMode] = useState<'compact' | 'ultra-compact'>('compact')

  useEffect(() => {
    const updateViewMode = () => {
      const width = window.innerWidth
      if (width < 640) {
        setViewMode('ultra-compact')
      } else {
        setViewMode('compact')
      }
    }
    updateViewMode()
    window.addEventListener('resize', updateViewMode)
    return () => window.removeEventListener('resize', updateViewMode)
  }, [])

  const getHoursToShow = () => {
    if (viewMode === 'ultra-compact') {
      return Array.from({ length: 6 }, (_, i) => i * 4)
    } else {
      return Array.from({ length: 11 }, (_, i) => i * 2)
    } 
  }

  const hoursToShow = getHoursToShow()
  const hourLabelInterval = viewMode === 'ultra-compact' ? 4 : 2;
 

  return (
    <div className="relative">
        <div className="mb-3 text-xs text-indigo-400 text-center">
          {viewMode === 'ultra-compact' ? 'Simplified view (4-hour intervals)' : ''}
        </div>

      <div className={`rounded-xl ${detailed ? 'max-h-[400px] md:max-h-none overflow-y-auto' : ''}` }>
        <div className={`grid ${viewMode === 'ultra-compact' ? 'grid-cols-7' : 'grid-cols-12' 
          } gap-1 w-full`}>
          <div className="col-span-1"></div>
          {hoursToShow.map(i => (
            <div key={i} className="text-xs text-indigo-400 text-center">
              {i % hourLabelInterval === 0 ? `${i}h` : ''}
            </div>
          ))}

          {days.map((day, dayIndex) => (
            <React.Fragment key={day}>
              <div className="text-xs text-indigo-400 flex items-center justify-end pr-2">
                {day}
              </div>
              {hoursToShow.map((hour) => {
                const dataPoint = data.find(d => d.day === dayIndex && d.hour === hour)
                const closestDataPoint = !dataPoint
                  ? data.find(d => d.day === dayIndex && Math.abs(d.hour - hour) <= (viewMode === 'ultra-compact' ? 2 : 1))
                  : null;

                const effectiveDataPoint = dataPoint || closestDataPoint
                const intensity = effectiveDataPoint ? effectiveDataPoint.value / 100 : 0

                return (
                  <motion.div
                    key={hour}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: (dayIndex * hoursToShow.length + hoursToShow.indexOf(hour)) * 0.001 }}
                    whileHover={{ scale: 1.3, zIndex: 10 }}
                    onHoverStart={() => setHoveredCell({
                      day: dayIndex,
                      hour,
                      value: effectiveDataPoint?.value || 0
                    })}
                    onHoverEnd={() => setHoveredCell(null)}
                    className={`aspect-square rounded-lg cursor-pointer ${detailed ? 'md:h-8 md:w-8' : ''}`}
                    style={{
                      backgroundColor: `rgba(139, 92, 246, ${intensity * 0.7})`,
                      border: intensity > 0.7 ? '1px solid #8B5CF6' : '1px solid rgba(76, 29, 149, 0.2)'
                    }}
                  />
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {hoveredCell && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-indigo-900 text-white p-2 rounded-lg text-xs shadow-xl border border-indigo-600 z-30"
          >
            {days[hoveredCell.day]} {hoveredCell.hour}:00 - {hoveredCell.value.toFixed(1)}% activity
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const DragDropCalendar = ({ events, onEventMove }: { events: any[], onEventMove: (id: number, date: string) => void }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [draggedEvent, setDraggedEvent] = useState<number | null>(null)
  const [draggedOver, setDraggedOver] = useState<number | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [targetDate, setTargetDate] = useState<string | null>(null)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

  const handleDragStart = (eventId: number, e: React.DragEvent) => {
    setDraggedEvent(eventId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (day: number, e: React.DragEvent) => {
    e.preventDefault()
    setDraggedOver(day)
  }

  const handleDragLeave = () => {
    setDraggedOver(null)
  }

  const handleDrop = (day: number, e: React.DragEvent) => {
    e.preventDefault()
    if (draggedEvent) {
      const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      onEventMove(draggedEvent, newDate.toISOString().split('T')[0])
      setDraggedEvent(null)
      setDraggedOver(null)
    }
  }

  const handleMobileEventSelect = (event: any) => {
    setSelectedEvent(event)
    setShowMoveModal(true)
  }

  const handleMobileEventMove = () => {
    if (selectedEvent && targetDate) {
      onEventMove(selectedEvent.id, targetDate)
      setShowMoveModal(false)
      setSelectedEvent(null)
      setTargetDate(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-indigo-950/60 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-indigo-800/30"
    >
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h3 className="text-xl sm:text-2xl font-bold text-white">Content Calendar</h3>
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            className="p-2 sm:p-3 bg-indigo-900/50 hover:bg-indigo-800/50 rounded-xl transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5 text-indigo-200" />
          </motion.button>
          <span className="text-base sm:text-xl font-semibold text-white min-w-[100px] sm:min-w-[180px] text-center"> 
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            className="p-2 sm:p-3 bg-indigo-900/50 hover:bg-indigo-800/50 rounded-xl transition-colors"
          >
            <ChevronRightIcon className="w-5 h-5 text-indigo-200" />
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 sm:gap-4 mb-4 sm:mb-6">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs sm:text-sm font-semibold text-indigo-400 py-3">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 sm:gap-4">
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1
          const dateString = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0]
          const dayEvents = events.filter(event => event.date === dateString)
          const isDraggedOver = draggedOver === day

          return (
            <motion.div
              key={day}
              whileHover={{ scale: 1.02 }}
              className={`aspect-square border rounded-2xl p-1 sm:p-3 transition-all duration-200 relative ${isDraggedOver
                  ? 'border-violet-400 bg-violet-500/10 shadow-lg'
                  : 'border-indigo-700/50 bg-indigo-900/30 hover:border-violet-500/50'
                }`}
              onDragOver={(e) => !isMobile && handleDragOver(day, e)}
              onDragLeave={() => !isMobile && handleDragLeave()}
              onDrop={(e) => !isMobile && handleDrop(day, e)}
            >
              <span className="text-xs sm:text-sm text-indigo-300 font-medium">{day}</span>
              <div className="mt-1 sm:mt-2 space-y-1 overflow-y-auto max-h-12 sm:max-h-none">
                {dayEvents.map(event => (
                  isMobile ? (
                    <div
                      key={event.id}
                      onClick={() => handleMobileEventSelect(event)}
                      className={`text-[10px] sm:text-xs p-1 sm:p-2 rounded-lg cursor-pointer shadow-md border transition-all duration-200 truncate ${event.type === 'newsletter' ? 'bg-violet-500/20 text-violet-200 border-violet-500/30' :
                          event.type === 'promotion' ? 'bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-500/30' :
                            'bg-indigo-500/20 text-indigo-200 border-indigo-500/30'
                        }`}
                    >
                      {event.title.length > 6 ? `${event.title.substring(0, 6)}...` : event.title}
                    </div>
                  ) : (
                    <div
                      key={event.id}
                      draggable
                      className={`text-[10px] sm:text-xs p-1 sm:p-2 rounded-lg cursor-move shadow-md border transition-all duration-200 ${event.type === 'newsletter' ? 'bg-violet-500/20 text-violet-200 border-violet-500/30' :
                          event.type === 'promotion' ? 'bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-500/30' :
                            'bg-indigo-500/20 text-indigo-200 border-indigo-500/30'
                        } ${draggedEvent === event.id ? 'opacity-50' : ''}`}
                      onDragStart={(e: React.DragEvent) => handleDragStart(event.id, e)}
                    >
                      {event.title}
                    </div>
                  )
                ))}
              </div>
            </motion.div>
          )
        })}
      </div>

      <AnimatePresence>
        {showMoveModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              className="bg-indigo-950 rounded-3xl p-6 border border-indigo-800 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Move Event</h3>
              <p className="text-indigo-300 mb-4">Moving: <span className="text-white font-medium">{selectedEvent?.title}</span></p>

              <label className="block text-indigo-300 text-sm mb-2">Select new date:</label>
              <input
                type="date"
                className="w-full bg-indigo-900 text-white p-3 rounded-xl border border-indigo-700 mb-6"
                onChange={(e) => setTargetDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />

              <div className="flex space-x-3">
                <button
                  className="flex-1 py-3 px-4 bg-indigo-700 hover:bg-indigo-600 rounded-xl text-white font-medium transition-colors"
                  onClick={handleMobileEventMove}
                >
                  Move Event
                </button>
                <button
                  className="py-3 px-4 bg-indigo-900 hover:bg-indigo-800 rounded-xl text-indigo-300 font-medium transition-colors"
                  onClick={() => setShowMoveModal(false)}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const EmailPreview = ({ campaign }: { campaign: any }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="bg-indigo-950/60 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-indigo-800/30 h-full"
  >
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-semibold text-white">Email Preview</h3>
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 rounded-full bg-violet-400"></div>
        <span className="text-sm text-indigo-400">Live Preview</span>
      </div>
    </div>

    <div className="bg-indigo-900/30 rounded-2xl p-4 sm:p-6 border border-indigo-700/30">
      <div className="text-sm text-indigo-400 mb-4 flex items-center space-x-4">
        <span>Subject: {campaign?.name || 'Campaign Preview'}</span>
        <div className="flex items-center space-x-1">
          <EyeIcon className="w-4 h-4" />
          <span>{campaign?.opens || 0}</span>
        </div>
      </div>

      <motion.div
        whileHover={{ boxShadow: "0 20px 60px rgba(139, 92, 246, 0.1)" }}
        className="bg-white rounded-2xl p-4 sm:p-6 min-h-[300px] sm:min-h-[400px] text-slate-800 shadow-2xl"
      >
        <div className="border-b border-slate-200 pb-4 mb-6">
          <h4 className="font-bold text-lg sm:text-xl mb-2">Hello Newsletter Subscriber! 👋</h4>
          <p className="text-slate-600 text-sm sm:text-base">Your weekly dose of growth insights is here...</p>
        </div>

        <div className="h-24 sm:h-32 bg-gradient-to-r from-violet-100 via-slate-100 to-fuchsia-100 rounded-2xl mb-6 flex items-center justify-center">
          <span className="text-slate-700 font-semibold text-sm sm:text-base">Featured Growth Strategy</span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="h-16 sm:h-24 bg-violet-50 rounded-xl flex items-center justify-center">
            <span className="text-xs sm:text-sm text-violet-700 font-medium">Subscriber Tips</span>
          </div>
          <div className="h-16 sm:h-24 bg-fuchsia-50 rounded-xl flex items-center justify-center">
            <span className="text-xs sm:text-sm text-fuchsia-700 font-medium">Revenue Boost</span>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-3 sm:p-4 mb-6">
          <h5 className="font-semibold mb-2 text-sm sm:text-base">This Week's Highlights:</h5>
          <ul className="text-xs sm:text-sm text-slate-600 space-y-1">
            <li>• 23% increase in engagement rates</li>
            <li>• New automation features launched</li>
            <li>• Success story from top creator</li>
          </ul>
        </div>

        <div className="text-center">
          <button className="bg-violet-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold hover:bg-violet-600 transition-colors">
            Read Full Newsletter →
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 text-xs text-slate-500 text-center">
          Best regards, The Newsletter Growth Team
        </div>
      </motion.div>
    </div>
  </motion.div>
)

export default function NewsletterDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [toast, setToast] = useState<{ message: string, type: string } | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [calendarEvents, setCalendarEvents] = useState([
    { id: 1, title: 'Weekly Newsletter', date: '2025-05-27', type: 'newsletter' },
    { id: 2, title: 'Product Update', date: '2025-05-29', type: 'promotion' },
    { id: 3, title: 'Growth Tips', date: '2025-06-01', type: 'content' },
    { id: 4, title: 'User Spotlight', date: '2025-06-03', type: 'content' }
  ])

  const { data, mutate, isLoading } = useSWR('dashboard-data', fetcher, {
    refreshInterval: 8000,
    revalidateOnFocus: false,
    dedupingInterval: 5000
  })

  const showToast = useCallback((message: string, type: string = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }, [])

  const handleExportCSV = useCallback(() => {
    if (!data) return
    const csvContent = `Date,Subscribers,Opens,Clicks,Revenue\n${data.chartData.map((row: any) =>
      `${row.date},${row.subscribers},${row.opens},${row.clicks},${row.revenue}`
    ).join('\n')
      }`
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `newsletter-analytics-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    showToast('Analytics data exported successfully! 📊', 'success')
  }, [data, showToast])

  const handleEventMove = useCallback((id: number, date: string) => {
    setCalendarEvents(prev =>
      prev.map(event =>
        event.id === id ? { ...event, date } : event
      )
    )
    showToast('Event rescheduled successfully! 📅', 'success')
  }, [showToast])

  const navItems = [
    { id: 'dashboard', icon: HomeIcon, label: 'Dashboard' },
    { id: 'campaigns', icon: EnvelopeIcon, label: 'Campaigns' },
    { id: 'calendar', icon: CalendarIcon, label: 'Calendar' },
    { id: 'analytics', icon: ChartBarIcon, label: 'Analytics' },
    { id: 'settings', icon: CogIcon, label: 'Settings' }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-400 rounded-full mx-auto mb-6"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-indigo-300 font-medium text-lg"
          >
            Loading your dashboard...
          </motion.p>
          <div className="mt-6 flex justify-center space-x-2">
            {[1, 2, 3].map(i => (
              <motion.div
                key={i}
                initial={{ opacity: 0.3 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse", delay: i * 0.2 }}
                className="w-3 h-3 rounded-full bg-violet-400"
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 to-slate-900">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <nav className="bg-indigo-950/80 backdrop-blur-2xl border-b border-indigo-800/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-[2px]">
            <div className="flex items-center space-x-3">
              <motion.div
                whileHover={{ rotate: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center shadow-lg"
              >
                <EnvelopeIcon className="w-6 h-6 text-white" />
              </motion.div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                NewsletterPro
              </h1>
            </div>

            <div className="hidden lg:flex space-x-[2px]">
              {navItems.map(item => (
                <motion.button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl transition-all duration-200 font-medium ${activeTab === item.id
                      ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                      : 'text-indigo-300 hover:text-white hover:bg-indigo-800/50'
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </motion.button>
              ))}
            </div>

            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  mutate()
                  showToast('Dashboard refreshed! 🔄', 'info')
                }}
                className="p-2.5 bg-indigo-900/50 hover:bg-indigo-800/50 rounded-xl transition-colors"
              >
                <BellIcon className="w-5 h-5 text-indigo-300" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExportCSV}
                className="hidden md:flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-200 font-medium shadow-lg"
              >
                <DocumentArrowDownIcon className="w-4 h-4" />
                <span>Export</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2.5 bg-indigo-900/50 hover:bg-indigo-800/50 rounded-xl transition-colors"
              >
                <Bars3Icon className="w-5 h-5 text-indigo-300" />
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setSidebarOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute top-0 left-0 bottom-0 w-72 bg-indigo-950 border-r border-indigo-800 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center">
                    <EnvelopeIcon className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-white">NewsletterPro</h2>
                </div>
                <button
                  className="p-2 text-indigo-400 hover:text-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                {navItems.map(item => (
                  <motion.button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id)
                      setSidebarOpen(false)
                    }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === item.id
                        ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                        : 'text-indigo-300 hover:text-white hover:bg-indigo-900/50'
                      }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </motion.button>
                ))}
              </div>

              <div className="absolute bottom-6 left-6 right-6">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleExportCSV}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-200 font-medium shadow-lg"
                >
                  <DocumentArrowDownIcon className="w-4 h-4" />
                  <span>Export Data</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 sm:space-y-8"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <MetricCard
                  title="Total Subscribers"
                  value={data?.subscribers?.total?.toLocaleString()}
                  change={data?.subscribers?.growth?.toFixed(1)}
                  icon={UserGroupIcon}
                  trend="up"
                  subtitle="Active members"
                />
                <MetricCard
                  title="Open Rate"
                  value={`${data?.engagement?.openRate?.toFixed(1)}%`}
                  change={(data?.engagement?.openRate ?? 0) > 35 ? '15.2' : '-3.1'}
                  icon={EyeIcon}
                  trend={(data?.engagement?.openRate ?? 0) > 35 ? 'up' : 'down'}
                  subtitle="Last 30 days"
                />
                <MetricCard
                  title="Monthly Revenue"
                  value={`$${data?.revenue?.mrr?.toLocaleString()}`}
                  change={data?.revenue?.growth?.toFixed(1)}
                  icon={ChartPieIcon}
                  trend="up"
                  subtitle="Recurring revenue"
                />
                <MetricCard
                  title="New Today"
                  value={data?.subscribers?.newToday?.toString() ?? '--'}
                  change="12.8"
                  icon={FireIcon}
                  trend="up"
                  subtitle="Fresh signups"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-indigo-950/60 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-indigo-800/30 relative overflow-hidden"
                >
                  <div className="absolute -right-16 -top-16 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl sm:text-2xl font-bold text-white">Subscriber Growth</h3>
                      <span className="text-sm text-violet-400 font-semibold bg-violet-500/10 px-3 py-1 rounded-full">
                        +{data?.subscribers?.growth?.toFixed(1) ?? '--'}%
                      </span>
                    </div>
                    <ResponsiveChart data={data?.chartData ?? []} type="subscribers" />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-indigo-950/60 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-indigo-800/30 relative overflow-hidden"
                >
                  <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-fuchsia-500/5 rounded-full blur-3xl" />
                  <div className="relative z-10">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 sm:mb-8">Engagement Heatmap</h3>
                    <InteractiveHeatmap data={data?.heatmapData ?? []} />
                  </div>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 overflow-x-hidden">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="lg:col-span-2"
                >
                  <div className="bg-indigo-950/60 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-indigo-800/30 h-full">
  <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">Recent Campaigns</h3>

  
  <div className="overflow-x-auto max-w-full">
    <table className="min-w-[800px] w-full text-sm sm:text-base text-left border-separate border-spacing-y-4">
      <thead>
        <tr>
          <th className="text-indigo-300 font-semibold px-4 py-2">Name</th>
          <th className="text-indigo-300 font-semibold px-4 py-2">Sent</th>
          <th className="text-indigo-300 font-semibold px-4 py-2">Opens</th>
          <th className="text-indigo-300 font-semibold px-4 py-2">Clicks</th>
          <th className="text-indigo-300 font-semibold px-4 py-2">CTR</th>
          <th className="text-indigo-300 font-semibold px-4 py-2">Status</th>
        </tr>
      </thead>
      <tbody>
        {data?.campaigns?.map((campaign: any, idx: number) => (
          <motion.tr
            key={campaign.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            whileHover={{ scale: 1.01 }}
            className="bg-indigo-900/40 rounded-2xl border border-indigo-700/30 hover:border-indigo-600/50 transition-all duration-300"
            style={{
              borderRadius: '1rem',
              overflow: 'hidden',
            }}
          >
            <td className="text-white font-medium px-4 py-4 truncate">{campaign.name}</td>
            <td className="text-indigo-400 px-4 py-4">
              📧 {campaign.sent > 0 ? campaign.sent.toLocaleString() : '—'}
            </td>
            <td className="text-violet-400 px-4 py-4">
              👁 {campaign.opens > 0 ? campaign.opens.toLocaleString() : '—'}
            </td>
            <td className="text-fuchsia-400 px-4 py-4">
              🔗 {campaign.clicks > 0 ? campaign.clicks.toLocaleString() : '—'}
            </td>
            <td className="text-indigo-300 px-4 py-4">
              {campaign.ctr > 0 ? `📊 ${campaign.ctr.toFixed(1)}%` : '—'}
            </td>
            <td className="px-4 py-4">
              <span
                className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap ${
                  campaign.status === 'active'
                    ? 'bg-violet-500/20 text-violet-400'
                    : campaign.status === 'draft'
                    ? 'bg-fuchsia-500/20 text-fuchsia-400'
                    : campaign.status === 'scheduled'
                    ? 'bg-indigo-500/20 text-indigo-400'
                    : 'bg-indigo-500/20 text-indigo-400'
                }`}
              >
                {campaign.status}
              </span>
            </td>
          </motion.tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="space-y-6"
                >
                  <div className="bg-indigo-950/60 backdrop-blur-xl rounded-3xl p-6 border border-indigo-800/30">
                    <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => showToast('Opening campaign creator... ✨', 'info')}
                        className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-violet-600/20 to-violet-700/30 border border-violet-600/30 rounded-2xl hover:from-violet-600/30 hover:to-violet-700/40 transition-all duration-200 text-violet-300 shadow-lg"
                      >
                        <PlusIcon className="w-5 h-5" />
                        <span className="font-medium">New Campaign</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => showToast('Loading template library... 📝', 'info')}
                        className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-fuchsia-600/20 to-fuchsia-700/30 border border-fuchsia-600/30 rounded-2xl hover:from-fuchsia-600/30 hover:to-fuchsia-700/40 transition-all duration-200 text-fuchsia-300 shadow-lg"
                      >
                        <DocumentArrowDownIcon className="w-5 h-5" />
                        <span className="font-medium">Templates</span>
                      </motion.button>
                    </div>
                  </div>

                  <div className="bg-indigo-950/60 backdrop-blur-xl rounded-3xl p-6 border border-indigo-800/30">
                    <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
                    <div className="space-y-5">
                      {[
                        { label: 'Delivery Rate', value: '99.2%', progress: 0.992, color: 'violet' },
                        { label: 'Inbox Placement', value: '94.8%', progress: 0.948, color: 'indigo' },
                        { label: 'List Health', value: `${(100 - (data?.subscribers?.churnRate ?? 0)).toFixed(1)}%`, progress: (100 - (data?.subscribers?.churnRate ?? 0)) / 100, color: 'fuchsia' }
                      ].map((item, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.6 + idx * 0.1 }}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-indigo-300 text-sm font-medium">{item.label}</span>
                            <span className={`font-bold ${item.color === 'violet' ? 'text-violet-400' :
                                item.color === 'fuchsia' ? 'text-fuchsia-400' : 'text-indigo-400'
                              }`}>{item.value}</span>
                          </div>
                          <div className="h-2 w-full bg-indigo-900/50 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: '0%' }}
                              animate={{ width: `${item.progress * 100}%` }}
                              transition={{ duration: 1.5, delay: 0.8 + idx * 0.2, ease: "easeOut" }}
                              className={`h-full rounded-full ${item.color === 'violet' ? 'bg-gradient-to-r from-violet-500 to-violet-400' :
                                  item.color === 'fuchsia' ? 'bg-gradient-to-r from-fuchsia-500 to-fuchsia-400' :
                                    'bg-gradient-to-r from-indigo-500 to-indigo-400'
                                }`}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeTab === 'campaigns' && (
            <motion.div
              key="campaigns"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 sm:space-y-8"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">Email Campaigns</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => showToast('Campaign wizard opening... 🚀', 'info')}
                  className="flex items-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-200 font-medium shadow-lg"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>New Campaign</span>
                </motion.button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-5 sm:space-y-6 order-2 lg:order-1">
                  {data?.campaigns?.map((campaign: any, idx: number) => (
                    <motion.div
                      key={campaign.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.1 }}
                      whileHover={{ y: -4 }}
                      className="bg-indigo-950/60 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-indigo-800/30 hover:border-indigo-700/50 transition-all duration-300 relative overflow-hidden"
                    >
                      <div className="absolute -right-12 -top-12 w-24 h-24 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 rounded-full blur-3xl" />
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-6">
                          <div>
                            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">{campaign.name}</h3>
                            <div className="flex items-center space-x-2">
                              <span className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold ${campaign.status === 'active' ? 'bg-violet-500/20 text-violet-400' :
                                  campaign.status === 'draft' ? 'bg-fuchsia-500/20 text-fuchsia-400' :
                                    campaign.status === 'scheduled' ? 'bg-indigo-500/20 text-indigo-400' :
                                      'bg-indigo-500/20 text-indigo-400'
                                }`}>
                                {campaign.status}
                              </span>
                              {campaign.ctr > 0 && (
                                <span className="text-xs text-indigo-400 bg-indigo-900/50 px-2 py-1 rounded-full">
                                  {campaign.ctr.toFixed(1)}% CTR
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 sm:gap-6 mb-6">
                          <div className="text-center">
                            <div className="text-xl sm:text-2xl font-bold text-violet-400 mb-1">{campaign.sent.toLocaleString()}</div>
                            <div className="text-xs text-indigo-400">Sent</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl sm:text-2xl font-bold text-indigo-300 mb-1">{campaign.opens.toLocaleString()}</div>
                            <div className="text-xs text-indigo-400">Opens</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl sm:text-2xl font-bold text-fuchsia-400 mb-1">{campaign.clicks.toLocaleString()}</div>
                            <div className="text-xs text-indigo-400">Clicks</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => showToast(`Opening ${campaign.name} editor... ✏️`, 'info')}
                            className="py-2.5 px-4 bg-indigo-900/50 text-indigo-200 rounded-xl hover:bg-indigo-800/50 transition-colors text-xs sm:text-sm font-medium"
                          >
                            Edit Campaign
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => showToast(`Loading ${campaign.name} analytics... 📊`, 'info')}
                            className="py-2.5 px-4 bg-indigo-900/50 text-indigo-200 rounded-xl hover:bg-indigo-800/50 transition-colors text-xs sm:text-sm font-medium"
                          >
                            View Analytics
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="order-1 lg:order-2">
                  <EmailPreview campaign={data?.campaigns?.[0]} />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 sm:space-y-8"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">Content Calendar</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => showToast('Event creator opening... 📅', 'info')}
                  className="flex items-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-200 font-medium shadow-lg"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Add Event</span>
                </motion.button>
              </div>

              <DragDropCalendar events={calendarEvents} onEventMove={handleEventMove} />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="bg-indigo-950/60 backdrop-blur-xl rounded-3xl p-6 border border-indigo-800/30"
                >
                  <h3 className="text-lg font-semibold text-white mb-6">Upcoming Events</h3>
                  <div className="space-y-4">
                    {calendarEvents.slice(0, 4).map((event, idx) => (
                      <motion.div
                        key={event.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.3, delay: idx * 0.1 }}
                        className="flex items-center space-x-3 p-3 hover:bg-indigo-900/30 rounded-xl transition-colors"
                      >
                        <div className={`w-3 h-3 rounded-full ${event.type === 'newsletter' ? 'bg-violet-400' :
                            event.type === 'promotion' ? 'bg-fuchsia-400' : 'bg-indigo-400'
                          }`} />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">{event.title}</div>
                          <div className="text-xs text-indigo-400">{new Date(event.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="bg-indigo-950/60 backdrop-blur-xl rounded-3xl p-6 border border-indigo-800/30"
                >
                  <h3 className="text-lg font-semibold text-white mb-6">This Week</h3>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-violet-400 mb-2">18</div>
                    <div className="text-sm text-indigo-400 mb-4">scheduled events</div>
                    <div className="h-3 bg-indigo-900/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '85%' }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                      />
                    </div>
                    <div className="text-xs text-indigo-500 mt-2">85% completion rate</div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="bg-indigo-950/60 backdrop-blur-xl rounded-3xl p-6 border border-indigo-800/30"
                >
                  <h3 className="text-lg font-semibold text-white mb-6">Content Types</h3>
                  <div className="space-y-4">
                    {[
                      { type: 'Newsletter', count: 8, color: 'violet' },
                      { type: 'Promotion', count: 5, color: 'fuchsia' },
                      { type: 'Content', count: 5, color: 'indigo' }
                    ].map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.4 + idx * 0.1 }}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${item.color === 'violet' ? 'bg-violet-400' :
                              item.color === 'fuchsia' ? 'bg-fuchsia-400' : 'bg-indigo-400'
                            }`} />
                          <span className="text-sm text-indigo-300">{item.type}</span>
                        </div>
                        <span className="text-sm font-semibold text-white">{item.count}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 sm:space-y-8"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Advanced Analytics</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="bg-indigo-950/60 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-indigo-800/30 relative overflow-hidden"
                >
                  <div className="absolute -right-16 -top-16 w-32 h-32 bg-fuchsia-500/5 rounded-full blur-3xl" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl sm:text-2xl font-bold text-white">Revenue Trends</h3>
                      <span className="text-sm text-fuchsia-400 font-semibold bg-fuchsia-500/10 px-3 py-1 rounded-full">
                        +{data?.revenue?.growth?.toFixed(1) ?? '--'}%
                      </span>
                    </div>
                    <ResponsiveChart data={data?.chartData ?? []} type="revenue" />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="bg-indigo-950/60 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-indigo-800/30 relative overflow-hidden"
                >
                  <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl sm:text-2xl font-bold text-white">Click-through Rates</h3>
                      <span className="text-sm text-violet-400 font-semibold bg-violet-500/10 px-3 py-1 rounded-full">
                        {data?.engagement?.clickRate?.toFixed(1) ?? '--'}%
                      </span>
                    </div>
                    <ResponsiveChart data={data?.chartData ?? []} type="clicks" />
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="bg-indigo-950/60 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-indigo-800/30 relative overflow-hidden"
              >
                <div className="absolute -right-16 -top-16 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl" />
                <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-fuchsia-500/5 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 sm:mb-8">Detailed Engagement Heatmap</h3>
                  <InteractiveHeatmap data={data?.heatmapData ?? []} detailed={true} />
                  <div className="mt-6 flex items-center justify-between text-xs sm:text-sm text-indigo-400">
                    <span className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded bg-indigo-900" />
                      <span>Low activity</span>
                    </span>
                    <div className="flex space-x-1">
                      {[0.2, 0.4, 0.6, 0.8, 1.0].map(opacity => (
                        <div
                          key={opacity}
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: `rgba(139, 92, 246, ${opacity * 0.7})` }}
                        />
                      ))}
                    </div>
                    <span className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded bg-violet-400" />
                      <span>High activity</span>
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 sm:space-y-8"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Settings</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="bg-indigo-950/60 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-indigo-800/30"
                >
                  <h3 className="text-xl font-semibold text-white mb-6">Account Settings</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-indigo-300 mb-2">Business Name</label>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        type="text"
                        className="w-full px-4 py-3 bg-indigo-900/50 border border-indigo-700/50 rounded-xl text-white focus:border-violet-500/50 focus:outline-none transition-all"
                        defaultValue="NewsletterPro Inc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-indigo-300 mb-2">Email Address</label>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        type="email"
                        className="w-full px-4 py-3 bg-indigo-900/50 border border-indigo-700/50 rounded-xl text-white focus:border-violet-500/50 focus:outline-none transition-all"
                        defaultValue="admin@newsletterpro.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-indigo-300 mb-2">Time Zone</label>
                      <motion.select
                        whileFocus={{ scale: 1.01 }}
                        className="w-full px-4 py-3 bg-indigo-900/50 border border-indigo-700/50 rounded-xl text-white focus:border-violet-500/50 focus:outline-none transition-all"
                      >
                        <option>UTC-8 (Pacific Time)</option>
                        <option>UTC-5 (Eastern Time)</option>
                        <option>UTC+0 (UTC)</option>
                        <option>UTC+1 (Central European Time)</option>
                      </motion.select>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="bg-indigo-950/60 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-indigo-800/30"
                >
                  <h3 className="text-xl font-semibold text-white mb-6">Notification Preferences</h3>
                  <div className="space-y-6">
                    {[
                      'Email campaign notifications',
                      'Subscriber milestone alerts',
                      'Performance warnings',
                      'System maintenance updates',
                      'Weekly analytics reports'
                    ].map((setting, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                        className="flex items-center justify-between"
                      >
                        <span className="text-indigo-300 text-sm">{setting}</span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => showToast(`${setting} updated! ⚙️`, 'success')}
                          className="relative inline-flex h-6 w-12 flex-shrink-0 cursor-pointer rounded-full bg-violet-600/80 transition-colors duration-200 focus:outline-none"
                        >
                          <motion.span
                            animate={{ x: 24 }}
                            className="inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200"
                          />
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="bg-indigo-950/60 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-indigo-800/30"
              >
                <h3 className="text-xl font-semibold text-white mb-6">Data Management</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => showToast('Data export initiated... 📦', 'info')}
                    className="flex-1 px-6 py-4 bg-violet-600/20 border border-violet-500/30 text-violet-300 rounded-2xl hover:bg-violet-600/30 transition-all duration-200 font-medium shadow-lg"
                  >
                    Export All Data
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => showToast('⚠️ This action cannot be undone. Please confirm.', 'error')}
                    className="flex-1 px-6 py-4 bg-fuchsia-600/20 border border-fuchsia-500/30 text-fuchsia-300 rounded-2xl hover:bg-fuchsia-600/30 transition-all duration-200 font-medium shadow-lg"
                  >
                    Delete Account
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="bg-indigo-950/80 backdrop-blur-xl border-t border-indigo-800/50 py-6 sm:py-8 mt-12 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center">
                <EnvelopeIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-indigo-300 font-semibold">NewsletterPro</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-indigo-400">
              <span>© 2025 NewsletterPro. All rights reserved.</span>
              <div className="flex space-x-4">
                <button className="hover:text-violet-400 transition-colors">Privacy</button>
                <button className="hover:text-violet-400 transition-colors">Terms</button>
                <button className="hover:text-violet-400 transition-colors">Support</button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <div className="fixed bottom-6 right-6 z-40 md:hidden">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (activeTab === 'campaigns') {
              showToast('Opening campaign creator... ✨', 'info')
            } else if (activeTab === 'calendar') {
              showToast('Event creator opening... 📅', 'info')
            } else {
              handleExportCSV()
            }
          }}
          className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg"
        >
          <PlusIcon className="w-6 h-6" />
        </motion.button>
      </div>
    </div>
  )
}